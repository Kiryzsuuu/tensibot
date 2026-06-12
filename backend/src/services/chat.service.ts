import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, COLLECTIONS } from '../lib/firebase';
import { AppError } from '../app';
import type { ChatSession, ChatMessage, BloodPressureRecord, UserMedication } from '../types';

// ─── AI Provider (Groq free tier, falls back to Anthropic) ───────────────────

async function callAI(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const groqKey = process.env['GROQ_API_KEY'];

  if (groqKey) {
    const { getGroqClient, GROQ_MODEL } = await import('../lib/groq');
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1000,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });
    return response.choices[0]?.message?.content ?? 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
  }

  // Fallback to Anthropic
  const { anthropic, CLAUDE_MODEL } = await import('../lib/anthropic');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  });
  return response.content[0]?.type === 'text' ? response.content[0].text : 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
}

// ─── System Prompt ────────────────────────────────────────────────────────────

interface UserHealthContext {
  fullName: string;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  diagnosis: string | null;
  bpRecords: BloodPressureRecord[];
  activeMedications: UserMedication[];
  medicationCompliance: { total: number; taken: number };
}

function buildSystemPrompt(ctx: UserHealthContext): string {
  const bmiInfo = ctx.weightKg && ctx.heightCm
    ? `BMI: ${(ctx.weightKg / Math.pow(ctx.heightCm / 100, 2)).toFixed(1)}`
    : null;

  const bpSummary = ctx.bpRecords.length > 0
    ? ctx.bpRecords.slice(-7).map(r => {
        const date = r.measuredAt instanceof Date ? r.measuredAt : new Date(r.measuredAt as unknown as string);
        return `  - ${date.toLocaleDateString('id-ID')}: ${r.systolic}/${r.diastolic} mmHg${r.pulse ? ` (nadi: ${r.pulse})` : ''} [${r.category}]`;
      }).join('\n')
    : '  Belum ada data tekanan darah.';

  const medSummary = ctx.activeMedications.length > 0
    ? ctx.activeMedications.map(m => `  - ${m.name} ${m.dosage} — ${m.frequency} (jam: ${m.times.join(', ')})`).join('\n')
    : '  Tidak ada obat aktif tercatat.';

  return `Kamu adalah Tensi-Bot, asisten kesehatan digital untuk penderita hipertensi. Kamu BUKAN dokter.

BATASAN WAJIB:
- JANGAN memberikan diagnosis penyakit
- JANGAN merekomendasikan perubahan dosis/jenis obat tanpa instruksi dokter
- SELALU sarankan konsultasi dokter untuk pertanyaan medis serius
- Respons dalam Bahasa Indonesia yang hangat dan mudah dipahami
- Selalu tambahkan disclaimer: "Informasi ini bersifat edukatif, bukan pengganti saran medis profesional"

DETEKSI KRISIS — PRIORITAS TERTINGGI:
Jika disebutkan tekanan darah ≥180/120 mmHg ATAU gejala: sakit kepala parah, nyeri dada, sesak napas, gangguan penglihatan — SEGERA arahkan ke IGD/UGD atau hubungi 119.

DATA KESEHATAN (${ctx.fullName}):
- Usia: ${ctx.age !== null ? `${ctx.age} tahun` : 'Tidak diketahui'}
- BB/TB: ${ctx.weightKg ? `${ctx.weightKg} kg` : '?'} / ${ctx.heightCm ? `${ctx.heightCm} cm` : '?'}${bmiInfo ? ` — ${bmiInfo}` : ''}
- Diagnosis: ${ctx.diagnosis ?? 'Tidak ada catatan'}

RIWAYAT TENSI (7 hari terakhir):
${bpSummary}

OBAT AKTIF:
${medSummary}

KEPATUHAN HARI INI: ${ctx.medicationCompliance.total > 0 ? `${ctx.medicationCompliance.taken}/${ctx.medicationCompliance.total} dosis` : 'Tidak ada jadwal'}

Jawab dengan empati, berbasis bukti, dan dorong kepatuhan pengobatan. Maksimal 300 kata.`;
}

// ─── Session Management ───────────────────────────────────────────────────────

export async function createSession(userId: string, title?: string): Promise<ChatSession> {
  const id = uuidv4();
  const now = new Date();
  const data: Omit<ChatSession, 'id'> = { userId, title: title ?? 'Sesi Baru', isActive: true, createdAt: now, updatedAt: now };
  await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(id).set(data);
  return { id, ...data };
}

export async function listSessions(userId: string): Promise<ChatSession[]> {
  const snap = await db.collection(COLLECTIONS.CHAT_SESSIONS)
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .orderBy('updatedAt', 'desc')
    .get();

  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id, ...data,
      createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
      updatedAt: data['updatedAt']?.toDate?.() ?? new Date(data['updatedAt']),
    } as ChatSession;
  });
}

export async function getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
  const session = await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId).get();
  if (!session.exists || session.data()?.['userId'] !== userId || !session.data()?.['isActive']) {
    throw new AppError('Sesi chat tidak ditemukan', 404, 'NOT_FOUND');
  }

  const snap = await db.collection(COLLECTIONS.CHAT_MESSAGES)
    .where('sessionId', '==', sessionId)
    .orderBy('createdAt', 'asc')
    .get();

  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']) } as ChatMessage;
  });
}

export async function sendMessage(
  sessionId: string,
  userId: string,
  userContent: string,
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const sessionDoc = await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data()?.['userId'] !== userId || !sessionDoc.data()?.['isActive']) {
    throw new AppError('Sesi chat tidak ditemukan', 404, 'NOT_FOUND');
  }

  const since7Days = new Date();
  since7Days.setDate(since7Days.getDate() - 7);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [profileDoc, bpSnap, medsSnap, logsSnap, recentMsgsSnap] = await Promise.all([
    db.collection(COLLECTIONS.USER_PROFILES).doc(userId).get(),
    db.collection(COLLECTIONS.BP_RECORDS).where('userId', '==', userId).where('isDeleted', '==', false).where('measuredAt', '>=', Timestamp.fromDate(since7Days)).orderBy('measuredAt', 'asc').get(),
    db.collection(COLLECTIONS.MEDICATIONS).where('userId', '==', userId).where('isActive', '==', true).get(),
    db.collection(COLLECTIONS.MEDICATION_LOGS).where('userId', '==', userId).where('scheduledTime', '>=', Timestamp.fromDate(todayStart)).where('scheduledTime', '<=', Timestamp.fromDate(todayEnd)).get(),
    db.collection(COLLECTIONS.CHAT_MESSAGES).where('sessionId', '==', sessionId).orderBy('createdAt', 'desc').limit(10).get(),
  ]);

  const profile = profileDoc.exists ? profileDoc.data() : null;
  const age = profile?.['dateOfBirth']
    ? Math.floor((Date.now() - new Date(profile['dateOfBirth']).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const ctx: UserHealthContext = {
    fullName: profile?.['fullName'] ?? 'Pengguna',
    age,
    weightKg: profile?.['weightKg'] ?? null,
    heightCm: profile?.['heightCm'] ?? null,
    diagnosis: profile?.['diagnosis'] ?? null,
    bpRecords: bpSnap.docs.map(d => d.data() as BloodPressureRecord),
    activeMedications: medsSnap.docs.map(d => d.data() as UserMedication),
    medicationCompliance: { total: logsSnap.size, taken: logsSnap.docs.filter(d => d.data()['status'] === 'TAKEN').length },
  };

  const conversationHistory = recentMsgsSnap.docs.reverse().map(d => ({
    role: d.data()['role'] as 'user' | 'assistant',
    content: d.data()['content'] as string,
  }));
  conversationHistory.push({ role: 'user', content: userContent });

  const userMsgId = uuidv4();
  const userMsgData: Omit<ChatMessage, 'id'> = { sessionId, role: 'user', content: userContent, createdAt: new Date() };
  await db.collection(COLLECTIONS.CHAT_MESSAGES).doc(userMsgId).set(userMsgData);

  const assistantContent = await callAI(buildSystemPrompt(ctx), conversationHistory);

  const assistantMsgId = uuidv4();
  const assistantMsgData: Omit<ChatMessage, 'id'> = { sessionId, role: 'assistant', content: assistantContent, createdAt: new Date() };
  await db.collection(COLLECTIONS.CHAT_MESSAGES).doc(assistantMsgId).set(assistantMsgData);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (!sessionDoc.data()?.['title'] || sessionDoc.data()?.['title'] === 'Sesi Baru') {
    updateData['title'] = userContent.slice(0, 50) + (userContent.length > 50 ? '…' : '');
  }
  await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId).update(updateData);

  return {
    userMessage: { id: userMsgId, ...userMsgData },
    assistantMessage: { id: assistantMsgId, ...assistantMsgData },
  };
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const session = await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId).get();
  if (!session.exists || session.data()?.['userId'] !== userId || !session.data()?.['isActive']) {
    throw new AppError('Sesi chat tidak ditemukan', 404, 'NOT_FOUND');
  }
  await db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId).update({ isActive: false });
}

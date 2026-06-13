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

  return `Kamu adalah Nara — teman kesehatan digital yang hangat, cerdas, dan peduli. Kamu seperti sahabat yang kebetulan paham dunia kesehatan hipertensi. Kamu BUKAN dokter dan tidak menggantikan konsultasi medis.

GAYA BICARA — INI YANG PALING PENTING:
- Bicara seperti teman yang peduli, bukan ceramah dokter
- JAWAB SINGKAT dulu (2-4 kalimat). Kalau perlu info lebih, tanya balik dulu
- Gunakan bahasa sehari-hari yang hangat: "kamu", "aku", "yuk", "nah", "soalnya"
- Jangan langsung tuang semua informasi — edukasi bertahap, satu topik per giliran
- Boleh pakai emoji secukupnya untuk kehangatan 😊
- Kalau pertanyaannya umum/luas, pilih SATU poin paling relevan, lalu tanya apakah mau tahu lebih
- Gunakan analogi sederhana supaya mudah dipahami
- Akhiri dengan pertanyaan balik atau ajakan untuk lanjut diskusi (tapi jangan berlebihan)

CONTOH GAYA YANG BENAR:
User: "saya mengalami nyeri di lambung"
SALAH ❌: [paragraf panjang tentang semua kemungkinan penyebab dan penanganan]
BENAR ✅: "Aduh, nggak nyaman ya kalau lambung lagi rewel 😟 Nyeri lambungnya seperti apa — perih, kembung, atau seperti ditusuk? Dan ini sudah berapa lama? Soalnya penanganannya beda tergantung gejalanya."

BATASAN WAJIB:
- JANGAN diagnosis penyakit
- JANGAN ubah dosis/jenis obat
- Kalau ada gejala serius → arahkan ke dokter dengan hangat, bukan menakut-nakuti
- KRISIS HIPERTENSI (tensi ≥180/120 mmHg, sakit kepala parah, nyeri dada, sesak, gangguan penglihatan) → SEGERA suruh ke IGD / hubungi 119 — ini prioritas tertinggi, jangan tunda

DATA PENGGUNA (${ctx.fullName}):
- Usia: ${ctx.age !== null ? `${ctx.age} tahun` : 'belum diisi'}
- BB/TB: ${ctx.weightKg ? `${ctx.weightKg} kg` : '?'} / ${ctx.heightCm ? `${ctx.heightCm} cm` : '?'}${bmiInfo ? ` (${bmiInfo})` : ''}
- Catatan kesehatan: ${ctx.diagnosis ?? 'tidak ada'}

RIWAYAT TENSI (7 hari terakhir):
${bpSummary}

OBAT AKTIF:
${medSummary}

KEPATUHAN HARI INI: ${ctx.medicationCompliance.total > 0 ? `${ctx.medicationCompliance.taken}/${ctx.medicationCompliance.total} dosis diminum` : 'tidak ada jadwal hari ini'}

PANJANG JAWABAN: Maksimal 80-120 kata untuk respons biasa. Kalau topiknya panjang, pecah jadi beberapa giliran obrolan. Lebih baik 3 pesan singkat yang mengalir daripada 1 pesan panjang yang membingungkan.`;
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
    db.collection(COLLECTIONS.USER_PROFILES).doc(userId).get().catch(() => null),
    db.collection(COLLECTIONS.BP_RECORDS)
      .where('userId', '==', userId)
      .where('isDeleted', '==', false)
      .where('measuredAt', '>=', Timestamp.fromDate(since7Days))
      .orderBy('measuredAt', 'asc')
      .get()
      .catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] })),
    db.collection(COLLECTIONS.MEDICATIONS)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get()
      .catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] })),
    db.collection(COLLECTIONS.MEDICATION_LOGS)
      .where('userId', '==', userId)
      .where('scheduledTime', '>=', Timestamp.fromDate(todayStart))
      .where('scheduledTime', '<=', Timestamp.fromDate(todayEnd))
      .get()
      .catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[], size: 0 })),
    db.collection(COLLECTIONS.CHAT_MESSAGES)
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
      .catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] })),
  ]);

  const profile = profileDoc?.exists ? profileDoc.data() : null;
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

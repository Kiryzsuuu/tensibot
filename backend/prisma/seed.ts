import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database…');

  // ─── Super Admin ────────────────────────────────────────────────────────────

  const adminPasswordHash = await bcrypt.hash('Admin@tensibot1', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@tensibot.id' },
    update: {},
    create: {
      email: 'admin@tensibot.id',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      profile: {
        create: {
          fullName: 'Super Admin Tensibot',
        },
      },
    },
  });

  console.log(`Super admin created: ${superAdmin.email}`);

  // ─── Demo User ──────────────────────────────────────────────────────────────

  const userPasswordHash = await bcrypt.hash('Demo@tensibot1', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tensibot.id' },
    update: {},
    create: {
      email: 'demo@tensibot.id',
      passwordHash: userPasswordHash,
      role: 'USER',
      profile: {
        create: {
          fullName: 'Budi Santoso',
          dateOfBirth: new Date('1970-05-15'),
          weight: 75,
          height: 168,
          diagnosis: 'Hipertensi esensial, terdiagnosis 2020',
          phone: '08123456789',
        },
      },
    },
  });

  console.log(`Demo user created: ${demoUser.email}`);

  // ─── Demo Medications ────────────────────────────────────────────────────────

  await prisma.userMedication.upsert({
    where: { id: 'seed-med-1' },
    update: {},
    create: {
      id: 'seed-med-1',
      userId: demoUser.id,
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: '1x sehari',
      times: ['08:00'],
      startDate: new Date('2024-01-01'),
      notes: 'Minum setelah sarapan',
    },
  });

  await prisma.userMedication.upsert({
    where: { id: 'seed-med-2' },
    update: {},
    create: {
      id: 'seed-med-2',
      userId: demoUser.id,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: '1x sehari',
      times: ['20:00'],
      startDate: new Date('2024-01-01'),
      notes: 'Minum malam hari',
    },
  });

  console.log('Demo medications created');

  // ─── Sample BP Records ───────────────────────────────────────────────────────

  const bpData = [
    { systolic: 145, diastolic: 92, category: 'STAGE_1' as const, daysAgo: 6 },
    { systolic: 138, diastolic: 88, category: 'STAGE_1' as const, daysAgo: 5 },
    { systolic: 142, diastolic: 90, category: 'STAGE_1' as const, daysAgo: 4 },
    { systolic: 135, diastolic: 85, category: 'STAGE_1' as const, daysAgo: 3 },
    { systolic: 130, diastolic: 82, category: 'STAGE_1' as const, daysAgo: 2 },
    { systolic: 128, diastolic: 80, category: 'ELEVATED' as const, daysAgo: 1 },
    { systolic: 125, diastolic: 78, category: 'ELEVATED' as const, daysAgo: 0 },
  ];

  for (const bp of bpData) {
    const measuredAt = new Date();
    measuredAt.setDate(measuredAt.getDate() - bp.daysAgo);
    measuredAt.setHours(7, 30, 0, 0);

    await prisma.bloodPressureRecord.create({
      data: {
        userId: demoUser.id,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        pulse: 72 + Math.floor(Math.random() * 10),
        measuredAt,
        category: bp.category,
        notes: 'Data contoh dari seed',
      },
    });
  }

  console.log('Sample BP records created');

  // ─── Sample Content Article ──────────────────────────────────────────────────

  await prisma.contentArticle.upsert({
    where: { slug: 'mengenal-hipertensi' },
    update: {},
    create: {
      title: 'Mengenal Hipertensi: Penyebab, Gejala, dan Cara Mengatasinya',
      slug: 'mengenal-hipertensi',
      summary:
        'Hipertensi atau tekanan darah tinggi adalah kondisi kronis yang perlu dikelola dengan baik. Pelajari lebih lanjut tentang penyebab, gejala, dan cara mengatasi hipertensi.',
      content: `# Mengenal Hipertensi

Hipertensi atau tekanan darah tinggi adalah kondisi di mana tekanan darah secara konsisten berada di atas 130/80 mmHg. Kondisi ini sering disebut "pembunuh diam-diam" karena jarang menimbulkan gejala yang terasa.

## Penyebab Hipertensi

- Gaya hidup tidak sehat (pola makan tinggi garam, kurang olahraga)
- Faktor genetik
- Obesitas
- Stres kronis
- Konsumsi alkohol berlebihan
- Merokok

## Gejala

Kebanyakan penderita hipertensi tidak merasakan gejala. Namun beberapa mungkin mengalami:
- Sakit kepala
- Sesak napas
- Mimisan
- Rasa berdenyut di kepala atau dada

## Cara Mengatasi

1. Perubahan gaya hidup (diet DASH, olahraga rutin)
2. Pengobatan sesuai resep dokter
3. Pemantauan tekanan darah rutin
4. Mengurangi stres

Selalu konsultasikan kondisi Anda dengan dokter untuk penanganan yang tepat.`,
      type: 'article',
      tags: ['hipertensi', 'kesehatan', 'edukasi'],
      isPublished: true,
      publishedAt: new Date(),
      authorId: superAdmin.id,
    },
  });

  console.log('Sample article created');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

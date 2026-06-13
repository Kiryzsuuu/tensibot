import 'dotenv/config';
import { db } from '../lib/firebase';

const heroes = [
  {
    title: 'Kendalikan Hipertensi Anda',
    subtitle: 'Pantau tekanan darah setiap hari',
    description: 'Tekanan darah terkontrol adalah kunci hidup sehat. Mulai catat sekarang dan lihat perkembangan Anda.',
    badgeText: 'Tips Kesehatan',
    colorFrom: '#1a3a5c',
    colorTo: '#2563a8',
    isActive: true,
    order: 1,
  },
  {
    title: 'Jangan Lewatkan Obat Anda',
    subtitle: 'Kepatuhan obat = hidup lebih sehat',
    description: 'Minum obat secara teratur sesuai jadwal meningkatkan efektivitas pengobatan hingga 80%.',
    badgeText: 'Pengingat Obat',
    colorFrom: '#14532d',
    colorTo: '#166534',
    isActive: true,
    order: 2,
  },
  {
    title: 'Tanya Asisten AI Kami',
    subtitle: 'Nara siap membantu 24/7',
    description: 'Punya pertanyaan tentang hipertensi? Asisten AI kami siap menjawab kapan saja.',
    badgeText: 'Fitur Baru',
    colorFrom: '#4c1d95',
    colorTo: '#6d28d9',
    isActive: true,
    order: 3,
  },
];

async function main() {
  console.log('Seeding heroes...');
  for (const hero of heroes) {
    const ref = db.collection('heroes').doc();
    await ref.set({ ...hero, createdAt: new Date(), updatedAt: new Date() });
    console.log(`Created hero: ${hero.title}`);
  }
  console.log('Done!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

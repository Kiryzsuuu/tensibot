import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Tensi-Bot — Teman Kendali Hipertensi',
    template: '%s | Tensi-Bot',
  },
  description:
    'Platform kesehatan digital berbasis AI untuk membantu penderita hipertensi memantau tekanan darah, meningkatkan kepatuhan pengobatan, dan mengakses edukasi kesehatan.',
  keywords: ['hipertensi', 'tekanan darah', 'kesehatan', 'AI', 'monitoring'],
  authors: [{ name: 'Tensi-Bot Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

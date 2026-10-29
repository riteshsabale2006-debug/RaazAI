import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RAAZ AI — One AI. Many Possibilities.',
  description:
    'RAAZ AI is your premium all-in-one AI assistant. Chat, study, create, code, write, and explore interactive mysteries — powered by Google Gemini.',
  keywords: ['AI chatbot', 'Gemini AI', 'RAAZ AI', 'study AI', 'coding assistant', 'creative AI'],
  authors: [{ name: 'RAAZ AI' }],
  openGraph: {
    title: 'RAAZ AI — One AI. Many Possibilities.',
    description: 'Your premium all-in-one AI assistant.',
    type: 'website',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-raaz-black text-raaz-text antialiased`}>
        {children}
      </body>
    </html>
  );
}

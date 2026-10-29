import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-raaz-black text-raaz-text antialiased">
        {children}
      </body>
    </html>
  );
}

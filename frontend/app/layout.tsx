import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Disclaimer from '@/components/Disclaimer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  title: 'LifeGuard Nexus — CJP Healthtech',
  description: "AI-assisted health information and triage for women in Bangladesh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body>
        <Disclaimer />
        <Nav />
        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">{children}</main>
      </body>
    </html>
  );
}

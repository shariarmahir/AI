import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sora, Hind_Siliguri } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Display faces for the landing hero: Sora carries the big statistics,
// Hind Siliguri shapes Bangla script properly (Inter cannot render Bengali).
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora' });
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-bangla',
});

export const metadata: Metadata = {
  title: 'LifeGuard NeXus — AI Health Agent',
  description: 'Your AI-powered medical health agent. Upload prescriptions, injury photos, lab reports, medicine images, and find nearby hospitals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable, sora.variable, hindSiliguri.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

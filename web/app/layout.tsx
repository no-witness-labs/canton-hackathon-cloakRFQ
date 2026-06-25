import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = {
  title: 'CloakRFQ · Private RFQ settlement on Canton',
  description: 'A privacy-preserving request-for-quote protocol on Canton Network. Cloaked intent, firm competing quotes, atomic settlement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}

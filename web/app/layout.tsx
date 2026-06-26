import type { Metadata } from 'next';
import { Space_Grotesk, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const body = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CloakRFQ Receipts · Private invoice-financing RFQs on Canton',
  description: 'A private RFQ marketplace for Receivable Sales on Canton. Funders submit proof-backed Private Quotes, the Seller selects the Best Compliant Quote, settlement is demonstrated on-ledger, and Auditors receive Scoped Compliance Receipts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

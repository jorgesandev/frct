import type { Metadata } from 'next';
import './globals.css';
import '@coinbase/onchainkit/styles.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'FRCT – Forecast-Routed Cross-Chain Treasury',
  description: 'An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts and Circle CCTP.',
  keywords: ['crypto', 'treasury', 'USDC', 'Base', 'Solana', 'Polymarket', 'DeFi'],
  authors: [{ name: 'FRCT Team' }],
  openGraph: {
    title: 'FRCT – Forecast-Routed Cross-Chain Treasury',
    description: 'An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Web3Provider>
          {/* Background effects */}
          <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
          <div className="fixed inset-0 bg-noise" />
          
          {/* Navigation */}
          <Navigation />
          
          {/* Main content with padding for fixed header */}
          <main className="relative pt-16">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}

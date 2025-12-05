'use client';

// =============================================================================
// Landing Page
// =============================================================================
// Hero section with project overview and call-to-action
// =============================================================================

import Link from 'next/link';
import { 
  ArrowRight, 
  Activity, 
  Shield, 
  Zap, 
  GitBranch,
  TrendingUp,
  Globe,
  Lock 
} from 'lucide-react';
import { ConnectWallet } from '@/components/ConnectWallet';

const features = [
  {
    icon: Activity,
    title: 'Forecast-Driven',
    description: 'Real-time risk scoring from Polymarket prediction markets guides treasury allocation decisions.',
  },
  {
    icon: Globe,
    title: 'Cross-Chain',
    description: 'Seamlessly routes USDC between Base and Solana using Circle CCTP for trustless bridging.',
  },
  {
    icon: Shield,
    title: 'Risk-Managed',
    description: 'Three regime modes (Aggressive, Neutral, Defensive) automatically adjust based on market conditions.',
  },
  {
    icon: Lock,
    title: 'Non-Custodial',
    description: 'Smart contracts hold funds directly. Owner-only withdrawals with full transparency.',
  },
];

const stats = [
  { value: '2', label: 'Chains' },
  { value: '3', label: 'Risk Regimes' },
  { value: '60s', label: 'Update Cycle' },
  { value: '100%', label: 'On-Chain' },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="animate-fade-in mb-8">
              <span className="badge badge-testnet">
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                Testnet Live on Base Sepolia
              </span>
            </div>

            {/* Logo Icon */}
            <div className="animate-fade-in stagger-1 mb-8 opacity-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg animate-pulse-glow">
                <GitBranch className="h-10 w-10 text-black" strokeWidth={2.5} />
              </div>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in stagger-2 opacity-0 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-zinc-100">Your </span>
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Onchain CFO
              </span>
              <span className="text-zinc-100"> for Cross-Chain Treasury</span>
          </h1>

            {/* Subheadline */}
            <p className="animate-fade-in stagger-3 opacity-0 mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              FRCT automatically routes USDC between Base and Solana based on real-time 
              Polymarket forecasts. Risk-managed, transparent, and fully on-chain.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in stagger-4 opacity-0 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/risk" className="btn-secondary flex items-center gap-2">
                <Activity className="h-4 w-4" />
                View Risk Engine
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-in stagger-5 opacity-0 mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="stat-value text-teal-400">{stat.value}</span>
                  <span className="stat-label mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-64 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="relative border-t border-zinc-800/50 bg-background-elevated/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
              Intelligent Treasury Management
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Powered by prediction markets and cross-chain infrastructure
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card p-6 animate-slide-up opacity-0"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative border-t border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
              How FRCT Works
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              From market data to automated rebalancing
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Analyze Markets',
                description: 'FRCT polls Polymarket for key macro indicators: recession odds, Fed policy, crypto sentiment.',
                icon: TrendingUp,
              },
              {
                step: '02',
                title: 'Calculate Risk Score',
                description: 'Weighted probability model generates a 0-100 risk score and determines the current regime.',
                icon: Activity,
              },
              {
                step: '03',
                title: 'Route Treasury',
                description: 'Based on regime, FRCT adjusts USDC allocation between Base (stable) and Solana (growth).',
                icon: Zap,
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative card-glow p-8 animate-slide-up opacity-0"
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="absolute -top-4 -left-2 font-mono text-6xl font-bold text-teal-500/10">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400 text-black">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">{item.title}</h3>
                  <p className="mt-3 text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-zinc-800/50 bg-gradient-to-b from-teal-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
            Ready to automate your treasury?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Connect your wallet to get started with FRCT on Base Sepolia.
          </p>
          <div className="mt-10 flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <GitBranch className="h-4 w-4" />
            <span>FRCT – Built for the Coinbase + Circle Hackathon</span>
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              GitHub
          </a>
          <a
              href="https://sepolia.basescan.org/address/0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830"
            target="_blank"
            rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
              Contract
          </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

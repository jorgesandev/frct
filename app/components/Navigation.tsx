'use client';

// =============================================================================
// Navigation Component
// =============================================================================
// Main navigation header with logo, links, and wallet connection
// =============================================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, GitBranch } from 'lucide-react';
import { ConnectWallet } from './ConnectWallet';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/risk', label: 'Risk Engine', icon: Activity },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link 
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
            <GitBranch className="h-4 w-4 text-black" />
          </div>
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            FRCT
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-teal-500/10 text-teal-400' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet Connection */}
        <ConnectWallet />
      </nav>
    </header>
  );
}


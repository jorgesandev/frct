// =============================================================================
// Wagmi Configuration
// =============================================================================
// Chain and connector configuration for wallet integration
// =============================================================================

import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

/**
 * Supported chains for FRCT
 */
export const supportedChains = [baseSepolia, base] as const;

/**
 * Default chain (Base Sepolia for testnet)
 */
export const defaultChain = baseSepolia;

/**
 * Wagmi configuration with multiple wallet connectors
 */
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    // MetaMask and other injected wallets
    injected({
      target: 'metaMask',
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'FRCT',
      preference: 'all', // Allow both smart wallet and extension
    }),
    // WalletConnect for mobile wallets
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

/**
 * Chain metadata for display
 */
export const chainMetadata = {
  [baseSepolia.id]: {
    name: 'Base Sepolia',
    shortName: 'Base (Testnet)',
    isTestnet: true,
    explorerUrl: 'https://sepolia.basescan.org',
  },
  [base.id]: {
    name: 'Base',
    shortName: 'Base',
    isTestnet: false,
    explorerUrl: 'https://basescan.org',
  },
} as const;

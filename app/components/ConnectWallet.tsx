'use client';

// =============================================================================
// Connect Wallet Component
// =============================================================================
// Uses OnchainKit's Wallet components with wallet aggregator for multiple options
// =============================================================================

import {
  ConnectWallet as OnchainConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

interface ConnectWalletProps {
  className?: string;
}

export function ConnectWallet({ className }: ConnectWalletProps) {
  return (
    <div className={className}>
      <Wallet>
        <OnchainConnectWallet
          className="!bg-teal-500/10 !border !border-teal-500/30 !text-teal-400 hover:!bg-teal-500/20 hover:!border-teal-500/50 !rounded-lg !px-4 !py-2 !font-mono !text-sm !transition-all"
        >
          <Avatar className="h-5 w-5" />
          <Name className="!text-teal-400" />
        </OnchainConnectWallet>
        <WalletDropdown className="!bg-zinc-900 !border !border-zinc-800 !rounded-lg">
          <Identity
            className="!px-4 !py-3 !border-b !border-zinc-800"
            hasCopyAddressOnClick
          >
            <Avatar />
            <Name className="!text-zinc-100" />
            <Address className="!text-zinc-500 !font-mono !text-xs" />
          </Identity>
          <WalletDropdownLink
            icon="wallet"
            href="https://wallet.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="!text-zinc-300 hover:!bg-zinc-800"
          >
            Go to Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect className="!text-red-400 hover:!bg-zinc-800" />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}


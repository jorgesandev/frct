# FRCT – Forecast-Routed Cross-Chain Treasury

> **An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts and Circle's CCTP.**

---

## What is FRCT?

FRCT automates treasury allocation decisions for DAOs and crypto-native startups using prediction markets.

**The Problem:** Most treasuries sit passively on a single chain while macro conditions change. Treasurers manually monitor markets, read threads, and maintain spreadsheets to decide where to park runway.

**The Solution:** FRCT pulls Polymarket probabilities, converts them into risk scores, and recommends cross-chain USDC allocations—all in a single dashboard.

---

## Features

- 🔗 **Multi-chain Treasury View** – See USDC balances on Base and Solana in one place
- 📊 **Polymarket-Powered Risk Engine** – Real-time risk scores from prediction market data
- ⚖️ **Smart Allocation** – Defensive/Neutral/Aggressive regime recommendations
- 🔄 **Cross-Chain Rebalancing** – Move USDC via Circle CCTP with one click
- 💸 **Integrated Payouts** – Withdraw and trigger Circle payments from the same cockpit

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRCT Dashboard                           │
│                    (Next.js + OnchainKit)                       │
└──────────┬─────────────────┬─────────────────┬──────────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Base Vault  │  │ Risk Engine  │  │ Solana Vault │
    │  (Solidity)  │  │ (Polymarket) │  │   (Anchor)   │
    └──────┬───────┘  └──────────────┘  └───────┬──────┘
           │                                    │
           └────────────── CCTP ────────────────┘
                      (Circle USDC)
```

### Components

| Component | Tech | Purpose |
|-----------|------|---------|
| **Frontend** | Next.js 15, React 19, OnchainKit, wagmi | Dashboard UI and wallet connection |
| **Base Contracts** | Solidity, Foundry | USDC vault with allocation tracking |
| **Solana Program** | Rust, Anchor | USDC SPL vault for cross-chain holdings |
| **Risk Engine** | Next.js API routes | Polymarket integration for risk scoring |
| **Cross-Chain** | Circle CCTP | Native USDC bridging between chains |
| **Payouts** | Circle Payments API | Off-ramp and payment creation |

---

## Track & Bounty Alignment

| Track / Bounty | Qualification |
|----------------|---------------|
| **Base Main Track** | Core vault contract + OnchainKit dApp deployed on Base |
| **Solana Track** | Anchor program with USDC SPL vault on devnet/mainnet |
| **Polymarket Bounty** | Risk engine uses Gamma API as decision core |
| **Circle / USDC** | Native USDC + CCTP bridging + Payments API |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm
- Foundry (for Solidity)
- Anchor + Solana CLI (for Solana)

### Install & Run

```bash
git clone https://github.com/<you>/frct.git
cd frct/app
pnpm install
cp .env.example .env.local  # Configure your API keys
pnpm dev
```

### Environment Variables

Create `app/.env.local`:

```env
# Base / EVM
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id

# Contracts
NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS=0x...

# Polymarket
POLYMARKET_GAMMA_URL=https://gamma-api.polymarket.com

# Circle
CIRCLE_API_KEY=your_circle_sandbox_key

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_VAULT_TOKEN_ACCOUNT=...
```

---

## Project Structure

```
frct/
├── app/                          # Next.js 15 frontend
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Main cockpit
│   │   └── api/
│   │       ├── risk-summary/     # Polymarket risk engine
│   │       └── circle-payout/    # Circle payments
│   ├── components/               # React components
│   └── lib/                      # Utilities and hooks
├── contracts/                    # Solidity contracts (Foundry)
│   ├── src/
│   │   └── TreasuryVaultBase.sol
│   └── test/
├── anchor-programs/              # Solana programs (Anchor)
│   └── treasury_vault_solana/
├── scripts/                      # Deployment scripts
└── docs/                         # Additional documentation
```

---

## Smart Contracts

### TreasuryVaultBase (Base/EVM)

```solidity
// Core functions
deposit(uint256 amount)
withdraw(uint256 amount, address to)
setTargetAllocation(uint16 baseBps, uint16 solanaBps)
planRebalance(uint16 newBaseBps, uint16 newSolBps)
```

### TreasuryVaultSolana (Anchor)

```rust
// Instructions
init_vault(authority: Pubkey)
deposit(amount: u64)
withdraw(amount: u64, to: Pubkey)
```

---

## Deployed Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Base Sepolia | TreasuryVaultBase | `TBD` |
| Solana Devnet | TreasuryVaultSolana | `TBD` |

---

## MVP Checklist

- [ ] Base vault contract deployed
- [ ] Dashboard with wallet connect
- [ ] Base + Solana balance display
- [ ] Polymarket risk engine working
- [ ] Target allocation updates
- [ ] Payout functionality
- [ ] Vercel deployment

### Stretch Goals

- [ ] Full CCTP integration (burn/mint flow)
- [ ] Circle Payments with status tracking
- [ ] Audit logging
- [ ] Multi-sig governance

---

## License

MIT

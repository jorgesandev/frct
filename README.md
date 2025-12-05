# FRCT – Forecast-Routed Cross-Chain Treasury

> **An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts and Circle's CCTP.**

---

## Deployed Contracts

| Network | Contract | Address | Explorer |
|---------|----------|---------|----------|
| **Base Sepolia** | TreasuryVaultBase | `0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830` | [View on Basescan](https://sepolia.basescan.org/address/0x36d4d2eade4bd7ec4ada5660f1b5ccfe6a25f830) |
| Base Sepolia | USDC (Circle) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [View on Basescan](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |
| **Solana Devnet** | TreasuryVaultSolana | `3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL` | [View on Solana Explorer](https://explorer.solana.com/address/3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL?cluster=devnet) |
| Solana Devnet | Vault PDA | `J7c13sZsYs5dDXrFDpPMunZGLdjsQfSDFphA67XQaGJf` | [View on Solana Explorer](https://explorer.solana.com/address/J7c13sZsYs5dDXrFDpPMunZGLdjsQfSDFphA67XQaGJf?cluster=devnet) |

**Contract Status:** All contracts deployed and verified

---

## Live Demo

- **Frontend:** [frct.jorgesandoval.dev](https://frct.jorgesandoval.dev)
- **Dashboard:** [frct.jorgesandoval.dev/dashboard](https://frct.jorgesandoval.dev/dashboard)
- **Risk API:** [frct.jorgesandoval.dev/api/risk-summary](https://frct.jorgesandoval.dev/api/risk-summary)

---

## What is FRCT?

FRCT automates treasury allocation decisions for DAOs and crypto-native startups using prediction markets.

**The Problem:** Most treasuries sit passively on a single chain while macro conditions change. Treasurers manually monitor markets, read threads, and maintain spreadsheets to decide where to park runway.

**The Solution:** FRCT pulls Polymarket probabilities, converts them into risk scores, and recommends cross-chain USDC allocations—all in a single dashboard.

---

## Features

- **Multi-chain Treasury View** – See USDC balances on Base and Solana in one place
- **Polymarket-Powered Risk Engine** – Real-time risk scores from prediction market data
- **Smart Allocation** – Defensive/Neutral/Aggressive regime recommendations
- **Cross-Chain Rebalancing** – Move USDC via Circle CCTP with one click
- **Integrated Payouts** – Withdraw and trigger Circle payments from the same cockpit

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

## Smart Contracts

### TreasuryVaultBase (Base/EVM)

**Address:** `0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830`

```solidity
// Core functions
deposit(uint256 amount)                              // Deposit USDC into vault
withdraw(uint256 amount, address to)                 // Withdraw USDC (owner only)
setTargetAllocation(uint16 baseBps, uint16 solanaBps) // Set target allocation
planRebalance(uint16 newBaseBps, uint16 newSolBps)   // Plan rebalance (emits event)

// View functions
getBaseBalance() returns (uint256)                   // Current USDC balance
getTotalValue() returns (uint256)                    // Total treasury value
getCurrentAllocation() returns (uint16, uint16)      // Target allocation in bps
getActualAllocation() returns (uint16, uint16)       // Actual allocation in bps
needsRebalance(uint16 thresholdBps) returns (bool)   // Check if rebalance needed
```

### TreasuryVaultSolana (Anchor)

**Program ID:** `TBD`

```rust
// Instructions
init_vault(authority: Pubkey)
deposit(amount: u64)
withdraw(amount: u64, to: Pubkey)
```

---

## Risk Engine

The risk engine fetches real-time data from Polymarket and calculates a risk score:

### Markets Tracked

| Market | Weight | Risk Direction |
|--------|--------|----------------|
| US Recession 2026 | 25% | Higher probability = more risk |
| US Recession 2025 | 20% | Higher probability = more risk |
| Fed Rate Cuts 2025 | 15% | Fewer cuts = more risk |
| Bitcoin Price 2025 | 25% | Lower bull probability = more risk |
| Ethereum Price 2025 | 15% | Lower bull probability = more risk |

### Regime Classification

| Risk Score | Regime | Base % | Solana % |
|------------|--------|--------|----------|
| 0-30 | Aggressive | 30% | 70% |
| 31-60 | Neutral | 50% | 50% |
| 61-100 | Defensive | 70% | 30% |

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
NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS=0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830

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
│   ├── lib/                      # Utilities and hooks
│   ├── config/                   # Configuration files
│   └── types/                    # TypeScript types
├── contracts/                    # Solidity contracts (Foundry)
│   ├── src/
│   │   └── TreasuryVaultBase.sol
│   ├── test/
│   │   └── TreasuryVaultBase.t.sol  # 28 passing tests
│   └── script/
│       └── Deploy.s.sol
├── anchor-programs/              # Solana programs (Anchor)
│   └── treasury_vault_solana/
├── scripts/                      # Deployment scripts
└── docs/                         # Additional documentation
    ├── ARCHITECTURE.md
    ├── RISK_MODEL.md
    └── SUBMISSION_CHECKLIST.md
```

---

## Development Progress

### Completed

- [x] Phase 0: Project setup, tooling, API keys
- [x] Phase 1: Risk Engine with Polymarket integration
- [x] Phase 2: Base smart contract (deployed & verified)

### In Progress

- [ ] Phase 3: Frontend foundation (OnchainKit, dashboard)

### Pending

- [ ] Phase 4: Dashboard components
- [ ] Phase 5: Circle Payments integration
- [ ] Phase 6: Solana vault program
- [ ] Phase 7: CCTP integration (stretch)
- [ ] Phase 8: Polish & Vercel deployment

---

## Testing

### Smart Contract Tests (Foundry)

```bash
cd contracts
forge test -vv
```

**Result:** 28 tests passing

### Risk Engine

```bash
cd app
pnpm dev
# Visit http://localhost:3000/api/risk-summary
```

---

## License

MIT

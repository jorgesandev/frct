# FRCT Architecture

> Technical architecture documentation for the Forecast-Routed Cross-Chain Treasury system.

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                     │
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │   Browser   │    │ Base Wallet │    │Solana Wallet│                    │
│   │  (Next.js)  │◄───│ (MetaMask)  │    │ (Phantom)*  │                    │
│   └──────┬──────┘    └─────────────┘    └─────────────┘                    │
│          │                                                                  │
└──────────┼──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      Next.js 15 Application                          │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│   │  │   Pages      │  │  Components  │  │    Hooks     │               │  │
│   │  │ - Landing    │  │ - Balances   │  │ - useBaseVault│              │  │
│   │  │ - Dashboard  │  │ - RiskGauge  │  │ - useSolanaVault│            │  │
│   │  │              │  │ - Allocation │  │ - useRiskSummary│            │  │
│   │  │              │  │ - Payout     │  │               │              │  │
│   │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │                      API Routes                                 │ │  │
│   │  │  /api/risk-summary  │  /api/circle-payout                      │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└──────────┬──────────────────────┬──────────────────────┬────────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   BASE LAYER     │   │ EXTERNAL APIS    │   │  SOLANA LAYER    │
│                  │   │                  │   │                  │
│ ┌──────────────┐ │   │ ┌──────────────┐ │   │ ┌──────────────┐ │
│ │TreasuryVault │ │   │ │  Polymarket  │ │   │ │TreasuryVault │ │
│ │    Base      │ │   │ │  Gamma API   │ │   │ │   Solana     │ │
│ └──────────────┘ │   │ └──────────────┘ │   │ └──────────────┘ │
│                  │   │                  │   │                  │
│ ┌──────────────┐ │   │ ┌──────────────┐ │   │ ┌──────────────┐ │
│ │ CCTP Router  │ │   │ │   Circle     │ │   │ │  USDC SPL    │ │
│ │  (stretch)   │◄┼───┼─┤   CCTP       ├─┼───┼─►  Token Acct  │ │
│ └──────────────┘ │   │ └──────────────┘ │   │ └──────────────┘ │
│                  │   │                  │   │                  │
│ ┌──────────────┐ │   │ ┌──────────────┐ │   │                  │
│ │  Base USDC   │ │   │ │   Circle     │ │   │                  │
│ │   (ERC20)    │ │   │ │ Payments API │ │   │                  │
│ └──────────────┘ │   │ └──────────────┘ │   │                  │
│                  │   │                  │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘

* Solana wallet connect is read-only for MVP (balance display only)
```

---

## Data Flow Diagrams

### Flow 1: Dashboard Load

```
User                Browser              API              Contracts
 │                    │                   │                   │
 │──── Load Page ────►│                   │                   │
 │                    │                   │                   │
 │                    │── GET /risk-summary ─►│               │
 │                    │                   │── Polymarket ────►│
 │                    │                   │◄── Probabilities ─│
 │                    │◄── Risk JSON ─────│                   │
 │                    │                   │                   │
 │                    │── wagmi read ─────────────────────────►│
 │                    │◄── Base Balance ──────────────────────│
 │                    │                   │                   │
 │                    │── @solana/web3.js ────────────────────►│
 │                    │◄── Solana Balance ────────────────────│
 │                    │                   │                   │
 │◄── Render ─────────│                   │                   │
 │                    │                   │                   │
```

### Flow 2: Update Target Allocation

```
User              Browser            Wallet           Base Contract
 │                  │                  │                   │
 │── Click Apply ──►│                  │                   │
 │                  │                  │                   │
 │                  │── Prepare Tx ────►│                  │
 │                  │                  │                   │
 │◄─────────────────── Sign Request ───│                  │
 │                  │                  │                   │
 │── Approve ───────────────────────────►│                 │
 │                  │                  │                   │
 │                  │                  │── setTargetAllocation()
 │                  │                  │                   │
 │                  │                  │◄── Tx Receipt ────│
 │                  │◄── Confirmed ────│                   │
 │                  │                  │                   │
 │◄── Success ──────│                  │                   │
 │                  │                  │                   │
```

### Flow 3: CCTP Rebalance (Stretch)

```
User         Browser        Base Contract      CCTP         Solana Program
 │             │                 │               │                │
 │── Rebal ───►│                 │               │                │
 │             │                 │               │                │
 │             │── burnForSolana()──►│           │                │
 │             │                 │               │                │
 │             │                 │── Burn USDC ──►│               │
 │             │                 │               │                │
 │             │                 │◄── Message ───│               │
 │             │                 │               │                │
 │             │                 │               │── Attest ──────►│
 │             │                 │               │                │
 │             │                 │               │── Mint USDC ──►│
 │             │                 │               │                │
 │             │◄── Complete ────────────────────────────────────│
 │             │                 │               │                │
 │◄── Done ────│                 │               │                │
 │             │                 │               │                │
```

---

## Component Architecture

### Frontend Components

```
app/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Main cockpit
│   └── api/
│       ├── risk-summary/
│       │   └── route.ts        # Polymarket integration
│       └── circle-payout/
│           └── route.ts        # Circle Payments
├── components/
│   ├── providers/
│   │   ├── WagmiProvider.tsx   # EVM wallet config
│   │   └── AppProviders.tsx    # Combined providers
│   ├── wallet/
│   │   └── ConnectWallet.tsx   # OnchainKit connect
│   ├── dashboard/
│   │   ├── BalancesPanel.tsx   # Multi-chain balances
│   │   ├── RiskGauge.tsx       # Risk visualization
│   │   ├── AllocationCard.tsx  # Current vs recommended
│   │   ├── RebalanceModal.tsx  # Rebalance confirmation
│   │   └── PayoutTab.tsx       # Withdraw + Circle payout
│   └── ui/
│       ├── Card.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useBaseVault.ts         # Base contract reads/writes
│   ├── useSolanaVault.ts       # Solana balance reads
│   └── useRiskSummary.ts       # Risk API fetching
├── lib/
│   ├── polymarket.ts           # Polymarket API client
│   ├── circle.ts               # Circle API client
│   ├── contracts.ts            # Contract ABIs and addresses
│   └── solana.ts               # Solana connection helpers
└── types/
    ├── risk.ts                 # Risk model types
    └── contracts.ts            # Contract types
```

### Smart Contract Structure

**Base (Solidity/Foundry):**
```
contracts/
├── src/
│   ├── TreasuryVaultBase.sol   # Main vault contract
│   └── CCTPBaseRouter.sol      # CCTP integration (stretch)
├── test/
│   └── TreasuryVaultBase.t.sol # Foundry tests
├── script/
│   └── Deploy.s.sol            # Deployment script
└── foundry.toml
```

**Solana (Anchor):**
```
anchor-programs/
└── treasury_vault_solana/
    ├── programs/
    │   └── treasury_vault_solana/
    │       └── src/
    │           └── lib.rs      # Program logic
    ├── tests/
    │   └── treasury_vault_solana.ts
    ├── Anchor.toml
    └── Cargo.toml
```

---

## Contract Interfaces

### TreasuryVaultBase.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TreasuryVaultBase is Ownable {
    // State
    IERC20 public immutable usdc;
    uint16 public targetBaseBps;      // Basis points (0-10000)
    uint16 public targetSolanaBps;    // Basis points (0-10000)
    
    // Events
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event TargetAllocationSet(uint16 baseBps, uint16 solanaBps);
    event RebalancePlanned(
        uint16 newBaseBps, 
        uint16 newSolBps, 
        uint256 baseAmount, 
        uint256 solanaAmount
    );
    
    // Functions
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount, address to) external onlyOwner;
    function setTargetAllocation(uint16 baseBps, uint16 solanaBps) external onlyOwner;
    function planRebalance(uint16 newBaseBps, uint16 newSolBps) external onlyOwner;
    
    // Views
    function getBalance() external view returns (uint256);
    function getCurrentAllocation() external view returns (uint16 baseBps, uint16 solBps);
}
```

### treasury_vault_solana (Anchor)

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

#[program]
pub mod treasury_vault_solana {
    pub fn init_vault(ctx: Context<InitVault>) -> Result<()>;
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()>;
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()>;
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub usdc_token_account: Pubkey,
    pub bump: u8,
}
```

---

## External API Integration

### Polymarket Gamma API

```typescript
// Endpoint
GET https://gamma-api.polymarket.com/markets?slug={slug}

// Response (simplified)
{
  "id": "0x...",
  "question": "Will there be a US recession in 2025?",
  "slug": "will-us-enter-recession-2025",
  "active": true,
  "closed": false,
  "outcomePrices": ["0.45", "0.55"],  // YES, NO prices
  "volume": "1234567.89",
  "liquidity": "567890.12"
}
```

### Circle Payments API

```typescript
// Create Payout
POST https://api-sandbox.circle.com/v1/payouts

// Headers
{
  "Authorization": "Bearer {API_KEY}",
  "Content-Type": "application/json"
}

// Body
{
  "idempotencyKey": "unique-key",
  "destination": {
    "type": "blockchain",
    "address": "0x...",
    "chain": "BASE"
  },
  "amount": {
    "amount": "100.00",
    "currency": "USD"
  }
}
```

---

## Security Considerations

### Smart Contracts

1. **Access Control**: Only owner can withdraw/rebalance
2. **Reentrancy**: Use checks-effects-interactions pattern
3. **Integer Overflow**: Use SafeMath (built into Solidity 0.8+)
4. **USDC Approval**: Validate approvals before transfers

### API Routes

1. **Rate Limiting**: Cache Polymarket responses (60s)
2. **API Key Security**: Never expose CIRCLE_API_KEY client-side
3. **Input Validation**: Sanitize all user inputs
4. **Error Handling**: Never leak internal errors to client

### Frontend

1. **Wallet Security**: Use established libraries (wagmi, OnchainKit)
2. **Transaction Simulation**: Show users what they're signing
3. **Amount Validation**: Check balances before transactions

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App                             │  │
│  │  • Static pages (Landing)                                 │  │
│  │  • Server components (Dashboard)                          │  │
│  │  • API routes (risk-summary, circle-payout)              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    Environment Variables                         │
│                    (API keys, addresses)                        │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Base Sepolia │    │   Polymarket  │    │ Solana Devnet │
│     RPC       │    │     Gamma     │    │     RPC       │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Performance Considerations

1. **API Caching**: Risk summary cached for 60s to reduce Polymarket calls
2. **Static Generation**: Landing page statically generated
3. **Code Splitting**: Dashboard components lazy loaded
4. **RPC Batching**: Batch multiple contract reads when possible
5. **Optimistic Updates**: Update UI before transaction confirms


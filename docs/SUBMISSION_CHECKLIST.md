# FRCT Submission Checklist

> Complete this checklist before final hackathon submission.

---

## Deployment Verification

### Base Contract
- [x] `TreasuryVaultBase` deployed to Base Sepolia/Mainnet
- [x] Contract address: `0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830`
- [x] Contract verified on Basescan
- [x] Test deposit completed
- [x] Test withdraw completed
- [x] Test setTargetAllocation completed

### Solana Program
- [x] `TreasuryVaultSolana` deployed to Devnet/Mainnet
- [x] Program ID: `3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL`
- [x] Vault initialized
- [x] Vault token account: `3tg7yaecTqDSRJufwcrbiSqtJzeyiKKmLQzdkr7sgikx`
- [x] Test USDC deposited to vault
- [x] Balance readable from frontend

### Frontend
- [x] Deployed to Vercel
- [x] Live URL: `frct.jorgesandoval.dev`
- [x] All environment variables configured
- [x] Wallet connect working
- [x] Base balance displaying
- [x] Solana balance displaying
- [x] Risk gauge working
- [x] Allocation update transaction working
- [x] Payout functionality working

---

## Feature Completeness

### MVP Features
- [x] Landing page
- [x] Dashboard with wallet connect
- [x] Multi-chain balance display (Base + Solana)
- [x] Polymarket risk engine integration
- [x] Risk score visualization
- [x] Regime display (Defensive/Neutral/Aggressive)
- [x] Current vs recommended allocation view
- [x] Update target allocation on-chain
- [x] Payout/withdraw functionality

### Stretch Features
- [x] CCTP Base → Solana transfer
- [x] Circle Payments with status tracking
- [ ] Transaction history
- [x] Mobile responsiveness

---

## Documentation

### README.md
- [ ] Project overview
- [ ] Architecture section
- [ ] Setup instructions
- [ ] Environment variables documented
- [ ] Contract addresses listed
- [ ] Track/bounty alignment table

### Supporting Docs
- [ ] `docs/ARCHITECTURE.md` complete
- [ ] `docs/RISK_MODEL.md` complete
- [ ] Code comments in key files

---

## Code Quality

- [ ] No console errors in production
- [ ] No TypeScript errors
- [ ] Loading states for all async operations
- [ ] Error handling for failed transactions
- [ ] Error handling for API failures

---

## Track & Bounty Requirements

### Base Main Track
- [x] Smart contract deployed on Base
- [x] Address: `0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830`
- [x] OnchainKit used for wallet UX
- [x] Transaction flow originates on Base

### Solana Main Track  
- [x] Anchor program deployed
- [x] Program ID: `3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL`
- [x] Real balance read from Solana RPC
- [x] USDC SPL token integration

### Polymarket Bounty
- [x] Gamma API integration working
- [x] Risk score derived from real market data
- [x] Multiple markets weighted
- [x] Allocation decisions based on predictions

### Circle / USDC Bounty
- [x] Native USDC used (not wrapped)
- [x] USDC vault on Base
- [x] USDC vault on Solana
- [x] Circle Payments API integration
- [x] CCTP integration

---

## Submission Materials

### Devpost
- [ ] Project title
- [ ] Description (≤250 words)
- [ ] Tech stack summary
- [ ] Tracks selected
- [ ] GitHub repo linked
- [ ] Demo video linked
- [ ] Team members added

### Demo Video (≤3 min)
- [ ] Problem statement (30s)
- [ ] Solution overview (30s)
- [ ] Live demo walkthrough
  - [ ] Wallet connect
  - [ ] Balance display
  - [ ] Risk gauge explanation
  - [ ] Allocation update
  - [ ] Payout demo
- [ ] Tech highlights (30s)
- [ ] Uploaded to YouTube/Loom

### GitHub Repository
- [ ] Public repository
- [ ] Clean commit history
- [ ] No sensitive data committed
- [ ] `.env.example` included
- [ ] README complete
- [ ] License file added

---

## Final Testing

### Happy Path
1. [ ] Fresh user visits site
2. [ ] Connects Base wallet
3. [ ] Sees accurate balances
4. [ ] Sees risk score from Polymarket
5. [ ] Updates target allocation
6. [ ] Executes payout
7. [ ] All transactions confirmed

### Error Cases
- [ ] Handles wallet disconnect gracefully
- [ ] Handles insufficient balance
- [ ] Handles transaction rejection
- [ ] Handles API failures
- [ ] Shows helpful error messages

---

## Post-Submission

- [ ] Test all links one more time
- [ ] Screenshot of working app saved
- [ ] Team notified of submission
- [ ] Celebrate! 🎉

---

## Quick Links

| Resource | URL |
|----------|-----|
| Live App | `https://frct.jorgesandoval.dev` |
| GitHub Repo | `https://github.com/jorgesandoval/frct` |
| Demo Video | `[Link to video]` |
| Devpost | `[Link to Devpost]` |
| Base Contract | `0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830` |
| Solana Program | `3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL` |


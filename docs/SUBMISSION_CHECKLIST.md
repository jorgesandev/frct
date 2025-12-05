# FRCT Submission Checklist

> Complete this checklist before final hackathon submission.

---

## Deployment Verification

### Base Contract
- [ ] `TreasuryVaultBase` deployed to Base Sepolia/Mainnet
- [ ] Contract address: `_________________________`
- [ ] Contract verified on Basescan
- [ ] Test deposit completed
- [ ] Test withdraw completed
- [ ] Test setTargetAllocation completed

### Solana Program
- [ ] `TreasuryVaultSolana` deployed to Devnet/Mainnet
- [ ] Program ID: `_________________________`
- [ ] Vault initialized
- [ ] Vault token account: `_________________________`
- [ ] Test USDC deposited to vault
- [ ] Balance readable from frontend

### Frontend
- [ ] Deployed to Vercel
- [ ] Live URL: `_________________________`
- [ ] All environment variables configured
- [ ] Wallet connect working
- [ ] Base balance displaying
- [ ] Solana balance displaying
- [ ] Risk gauge working
- [ ] Allocation update transaction working
- [ ] Payout functionality working

---

## Feature Completeness

### MVP Features
- [ ] Landing page
- [ ] Dashboard with wallet connect
- [ ] Multi-chain balance display (Base + Solana)
- [ ] Polymarket risk engine integration
- [ ] Risk score visualization
- [ ] Regime display (Defensive/Neutral/Aggressive)
- [ ] Current vs recommended allocation view
- [ ] Update target allocation on-chain
- [ ] Payout/withdraw functionality

### Stretch Features
- [ ] CCTP Base → Solana transfer
- [ ] Circle Payments with status tracking
- [ ] Transaction history
- [ ] Mobile responsiveness

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
- [ ] Smart contract deployed on Base
- [ ] Address: `_________________________`
- [ ] OnchainKit used for wallet UX
- [ ] Transaction flow originates on Base

### Solana Main Track  
- [ ] Anchor program deployed
- [ ] Program ID: `_________________________`
- [ ] Real balance read from Solana RPC
- [ ] USDC SPL token integration

### Polymarket Bounty
- [ ] Gamma API integration working
- [ ] Risk score derived from real market data
- [ ] Multiple markets weighted
- [ ] Allocation decisions based on predictions

### Circle / USDC Bounty
- [ ] Native USDC used (not wrapped)
- [ ] USDC vault on Base
- [ ] USDC vault on Solana
- [ ] Circle Payments API integration
- [ ] (Stretch) CCTP integration

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
| Live App | `_________________________` |
| GitHub Repo | `_________________________` |
| Demo Video | `_________________________` |
| Devpost | `_________________________` |
| Base Contract | `_________________________` |
| Solana Program | `_________________________` |


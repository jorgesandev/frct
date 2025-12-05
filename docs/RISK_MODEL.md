# FRCT Risk Model

> How FRCT converts Polymarket prediction data into treasury allocation recommendations.

---

## Overview

The FRCT Risk Engine ingests probability data from Polymarket's Gamma API and produces a single **risk score** that drives allocation decisions. This document specifies the model.

---

## Inputs

### Polymarket Markets

We track a curated set of markets that correlate with macro/crypto risk:

| Market | Weight | Risk Direction | Rationale |
|--------|--------|----------------|-----------|
| **US Recession 2025** | 0.35 | Positive | Higher recession odds → risk-off |
| **BTC Below $X** | 0.25 | Positive | Crash probability → risk-off |
| **Fed Rate Hike** | 0.20 | Positive | Tightening → risk-off |
| **Major Crypto Regulation** | 0.20 | Positive | Regulatory pressure → risk-off |

**Risk Direction:**
- `Positive`: Higher probability = higher risk score
- `Negative`: Higher probability = lower risk score (bullish signal)

### Data Source

```
GET https://gamma-api.polymarket.com/markets?slug={slug}
```

Response includes:
- `outcomePrices`: Array of prices for YES/NO outcomes
- `clobTokenIds`: Token IDs for each outcome
- `active`: Whether market is still trading

We use `yesPrice` (first outcome price) as the probability.

---

## Risk Score Calculation

### Formula

```
riskScore = Σ (weight_i × probability_i × direction_i) × 100
```

Where:
- `weight_i` ∈ [0, 1], all weights sum to 1.0
- `probability_i` ∈ [0, 1], from Polymarket yesPrice
- `direction_i` ∈ {-1, +1}, based on risk direction

### Normalization

The raw score is clamped to [0, 100]:
```typescript
riskScore = Math.max(0, Math.min(100, rawScore));
```

---

## Regime Classification

| Risk Score | Regime | Interpretation |
|------------|--------|----------------|
| 0–30 | **Aggressive** | Low macro risk, favor yield/growth |
| 31–60 | **Neutral** | Balanced conditions |
| 61–100 | **Defensive** | High risk, favor stability |

---

## Allocation Mapping

Each regime maps to a recommended allocation:

| Regime | Base % | Solana % | Rationale |
|--------|--------|----------|-----------|
| Aggressive | 30% | 70% | Solana for higher yield opportunities |
| Neutral | 50% | 50% | Balanced exposure |
| Defensive | 70% | 30% | Base for stability and liquidity |

### Why Base = Defensive?

- Base is an L2 with strong Coinbase backing
- Higher liquidity for USDC
- More institutional infrastructure
- Lower volatility in ecosystem activity

### Why Solana = Aggressive?

- Higher DeFi yields available
- More volatile but higher upside
- Active trading ecosystem
- Native USDC with fast finality

---

## API Response Shape

```typescript
interface RiskSummary {
  riskScore: number;                    // 0-100
  regime: 'Defensive' | 'Neutral' | 'Aggressive';
  recommendedBasePct: number;           // 0-100
  recommendedSolanaPct: number;         // 0-100
  explanations: string[];               // Human-readable factors
  markets: {
    name: string;
    probability: number;
    weight: number;
    contribution: number;               // To risk score
  }[];
  timestamp: string;                    // ISO 8601
  cacheHit: boolean;
}
```

---

## Implementation Notes

### Caching

- Cache risk summary for 60 seconds
- Prevents API rate limiting
- Provides consistent UX during rapid page loads

### Error Handling

If Polymarket API fails:
1. Return cached data if available (with `stale: true`)
2. Fall back to "Neutral" regime with `riskScore: 50`
3. Log error for monitoring

### Future Improvements

1. **Dynamic Markets**: Allow users to add/remove markets
2. **Custom Weights**: Let treasurers adjust weights
3. **Historical Tracking**: Show risk score over time
4. **Confidence Intervals**: Use market liquidity as confidence factor
5. **Multi-signal Integration**: Add on-chain metrics (TVL, gas, etc.)

---

## Example Calculation

Given:
- Recession market: yesPrice = 0.45, weight = 0.35
- BTC crash market: yesPrice = 0.20, weight = 0.25
- Fed hike market: yesPrice = 0.60, weight = 0.20
- Regulation market: yesPrice = 0.35, weight = 0.20

```
riskScore = (0.35 × 0.45 + 0.25 × 0.20 + 0.20 × 0.60 + 0.20 × 0.35) × 100
          = (0.1575 + 0.05 + 0.12 + 0.07) × 100
          = 0.3975 × 100
          = 39.75 → 40
```

Result: **Neutral** regime (40 is between 31-60)
Allocation: **50% Base / 50% Solana**

---

## Configuration

Markets and weights are configured via environment variables:

```env
POLYMARKET_MARKET_SLUGS=recession-2025,btc-crash,fed-hike,crypto-regulation
```

Weights are defined in code but can be moved to config:

```typescript
const MARKET_CONFIG = {
  'recession-2025': { weight: 0.35, direction: 1 },
  'btc-crash': { weight: 0.25, direction: 1 },
  'fed-hike': { weight: 0.20, direction: 1 },
  'crypto-regulation': { weight: 0.20, direction: 1 },
};
```


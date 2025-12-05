# FRCT Risk Model

> How FRCT converts Polymarket prediction data into treasury allocation recommendations.

---

## Overview

The FRCT Risk Engine ingests probability data from **5 binary Polymarket markets** and produces a single **risk score** (0-100) that drives allocation decisions between Base and Solana.

---

## Markets

All markets are **binary (Yes/No)** for clarity and interpretability:

| # | Market | Slug | Weight | Direction |
|---|--------|------|--------|-----------|
| 1 | **US Recession 2025** | `us-recession-in-2025` | 40% | Yes → +Risk |
| 2 | **US Recession 2026** | `us-recession-by-end-of-2026` | 35% | Yes → +Risk |
| 3 | **Negative GDP 2026** | `negative-gdp-growth-in-2026` | 25% | Yes → +Risk |

### Direction Logic

All markets use **Yes → +Risk (Defensive)**:
- Higher "Yes" probability = higher risk score
- Recession & negative GDP = bad for risk assets = more defensive allocation

---

## Data Source

```
GET https://gamma-api.polymarket.com/markets?slug={slug}
```

Response includes `outcomePrices` array where first value is "Yes" probability.

---

## Risk Score Calculation

### Formula

```
riskScore = Σ (weight_i × adjustedProbability_i) × 100
```

Where `adjustedProbability`:
- **Defensive markets**: `probability` (direct)
- **Aggressive markets**: `1 - probability` (inverted)

### Example

| Market | Probability | Weight | Contribution |
|--------|-------------|--------|--------------|
| Recession 2025 | 2% | 0.40 | 0.02 × 0.40 = 0.008 |
| Recession 2026 | 31% | 0.35 | 0.31 × 0.35 = 0.109 |
| Negative GDP 2026 | 18% | 0.25 | 0.18 × 0.25 = 0.045 |

**Total**: 0.162 × 100 = **16.2 → Risk Score: 16**

---

## Regime Classification

| Risk Score | Regime | Interpretation |
|------------|--------|----------------|
| 0–30 | **Aggressive** | Low macro risk, favor growth (Solana) |
| 31–60 | **Neutral** | Balanced conditions |
| 61–100 | **Defensive** | High risk, favor stability (Base) |

---

## Allocation Mapping

| Regime | Base % | Solana % | Rationale |
|--------|--------|----------|-----------|
| **Aggressive** | 30% | 70% | Low risk → favor Solana for yield |
| **Neutral** | 50% | 50% | Balanced exposure |
| **Defensive** | 70% | 30% | High risk → favor Base stability |

### Why Base = Defensive?
- L2 with strong Coinbase backing
- Higher USDC liquidity
- More institutional infrastructure

### Why Solana = Aggressive?
- Higher DeFi yields
- Active trading ecosystem
- Fast finality for opportunities

---

## API Response

```typescript
interface RiskSummary {
  riskScore: number;                    // 0-100
  regime: 'Defensive' | 'Neutral' | 'Aggressive';
  recommendedBasePct: number;           // 0-100
  recommendedSolanaPct: number;         // 0-100
  markets: {
    slug: string;
    question: string;
    probability: number;                // 0-1
    riskContribution: number;           // Adjusted probability
    weight: number;
    status: 'active' | 'error';
  }[];
  explanations: string[];
  timestamp: string;
  cacheHit: boolean;
}
```

---

## Configuration

Markets are defined in `app/config/polymarket.ts`:

```typescript
export const POLYMARKET_MARKETS = [
  {
    key: 'us_recession_2025',
    slug: 'us-recession-in-2025',
    weight: 0.40,
    type: 'binary',
    riskDirection: 'higher_yes_is_more_risk',
  },
  {
    key: 'us_recession_2026',
    slug: 'us-recession-by-end-of-2026',
    weight: 0.35,
    type: 'binary',
    riskDirection: 'higher_yes_is_more_risk',
  },
  {
    key: 'negative_gdp_2026',
    slug: 'negative-gdp-growth-in-2026',
    weight: 0.25,
    type: 'binary',
    riskDirection: 'higher_yes_is_more_risk',
  },
];
```

---

## Caching

- Risk summary cached for **60 seconds**
- Prevents API rate limiting
- Returns stale data on API failure

---

## Live Demo

- **Risk API**: [frct.jorgesandoval.dev/api/risk-summary](https://frct.jorgesandoval.dev/api/risk-summary)
- **Risk Dashboard**: [frct.jorgesandoval.dev/risk](https://frct.jorgesandoval.dev/risk)

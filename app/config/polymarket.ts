// =============================================================================
// Polymarket Market Configuration
// =============================================================================
// These markets are used to calculate the risk score for treasury allocation.
// Total weights must sum to 1.0
// =============================================================================

import { MarketRiskConfig } from '@/types/risk';

/**
 * Polymarket markets configuration for risk scoring
 * 
 * Markets:
 * 1. US Recession 2026 - Binary macro risk indicator
 * 2. US Recession 2025 - Binary macro risk indicator
 * 3. Fed Rate Cuts 2025 - Monetary policy stress
 * 4. Bitcoin Price 2025 - Crypto market sentiment
 * 5. Ethereum Price 2025 - Crypto market sentiment
 */
export const POLYMARKET_MARKETS: MarketRiskConfig[] = [
  {
    key: 'us_recession_2026',
    slug: 'us-recession-by-end-of-2026',
    weight: 0.25,
    type: 'binary',
    riskDirection: 'higher_yes_is_more_risk',
  },
  {
    key: 'us_recession_2025',
    slug: 'us-recession-in-2025',
    weight: 0.20,
    type: 'binary',
    riskDirection: 'higher_yes_is_more_risk',
  },
  {
    key: 'fed_cuts_2025',
    slug: 'how-many-fed-rate-cuts-in-2025',
    weight: 0.15,
    type: 'multi',
    riskDirection: 'monetary_stress_from_cuts',
  },
  {
    key: 'btc_2025_price',
    slug: 'what-price-will-bitcoin-hit-in-2025',
    weight: 0.25,
    type: 'multi',
    riskDirection: 'inverse_bull_probability',
  },
  {
    key: 'eth_2025_price',
    slug: 'what-price-will-ethereum-hit-in-2025',
    weight: 0.15,
    type: 'multi',
    riskDirection: 'inverse_bull_probability',
  },
];

/**
 * Bull thresholds for crypto price markets
 * Outcomes at or above these values are considered "bullish"
 */
export const BULL_THRESHOLDS = {
  btc_2025_price: 95000,  // $95k and above is bullish for BTC
  eth_2025_price: 5000,   // $5k and above is bullish for ETH
};

/**
 * Regime thresholds (risk score ranges)
 */
export const REGIME_THRESHOLDS = {
  aggressive: { min: 0, max: 30 },   // Low risk -> favor Solana
  neutral: { min: 31, max: 60 },     // Balanced
  defensive: { min: 61, max: 100 },  // High risk -> favor Base
};

/**
 * Allocation percentages for each regime
 */
export const REGIME_ALLOCATIONS = {
  Aggressive: { basePct: 30, solanaPct: 70 },
  Neutral: { basePct: 50, solanaPct: 50 },
  Defensive: { basePct: 70, solanaPct: 30 },
};

/**
 * Cache TTL in milliseconds (60 seconds)
 */
export const CACHE_TTL_MS = 60 * 1000;

/**
 * Polymarket Gamma API base URL
 */
export const GAMMA_API_BASE_URL = process.env.POLYMARKET_GAMMA_URL || 'https://gamma-api.polymarket.com';


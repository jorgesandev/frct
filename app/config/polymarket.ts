// =============================================================================
// Polymarket Market Configuration
// =============================================================================
// These markets are used to calculate the risk score for treasury allocation.
// Total weights must sum to 1.0
// All markets are BINARY (Yes/No) for simplicity and clarity.
// =============================================================================

import { MarketRiskConfig } from '@/types/risk';

/**
 * Polymarket markets configuration for risk scoring
 * 
 * 3 Active Binary Markets (all macro risk indicators):
 * 1. US Recession 2025 - Near-term recession risk
 * 2. US Recession 2026 - Medium-term recession risk
 * 3. Negative GDP 2026 - Economic contraction signal
 * 
 * All markets: Higher "Yes" probability = higher risk = more defensive allocation
 */
export const POLYMARKET_MARKETS: MarketRiskConfig[] = [
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


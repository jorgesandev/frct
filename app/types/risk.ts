// =============================================================================
// Risk Engine Types
// =============================================================================

/**
 * Risk regime classification based on score
 */
export type RiskRegime = 'Defensive' | 'Neutral' | 'Aggressive';

/**
 * How a market's probability maps to risk
 */
export type RiskDirection = 'higher_yes_is_more_risk'; // Binary "Yes" = more defensive

/**
 * Market type classification (binary only for simplicity)
 */
export type MarketType = 'binary';

/**
 * Configuration for a single Polymarket market
 */
export interface MarketRiskConfig {
  key: string;
  slug: string;
  weight: number;
  type: MarketType;
  riskDirection: RiskDirection;
}

/**
 * Individual market data from Polymarket API
 */
export interface MarketData {
  key: string;
  slug: string;
  question: string;
  probability: number;
  riskContribution: number;
  weight: number;
  status: 'active' | 'closed' | 'error';
}

/**
 * API response from /api/risk-summary
 */
export interface RiskSummary {
  riskScore: number;
  regime: RiskRegime;
  recommendedBasePct: number;
  recommendedSolanaPct: number;
  explanations: string[];
  markets: MarketData[];
  timestamp: string;
  cacheHit: boolean;
}

/**
 * Polymarket Gamma API response for a market
 */
export interface PolymarketMarketResponse {
  id: string;
  slug: string;
  question: string;
  conditionId: string;
  outcomes: string[];
  outcomePrices: string[];
  active: boolean;
  closed: boolean;
  volume: string;
  liquidity: string;
}

/**
 * Polymarket Gamma API response for events (contains multiple markets)
 */
export interface PolymarketEventResponse {
  id: string;
  slug: string;
  title: string;
  markets: PolymarketMarketResponse[];
}

/**
 * Internal calculation result for a market
 */
export interface MarketCalculation {
  key: string;
  slug: string;
  question: string;
  rawProbability: number;
  normalizedRisk: number;
  weightedContribution: number;
  explanation: string;
}

/**
 * Cache entry for risk summary
 */
export interface RiskCacheEntry {
  data: RiskSummary;
  timestamp: number;
}


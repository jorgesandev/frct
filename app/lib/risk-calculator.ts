// =============================================================================
// Risk Score Calculator
// =============================================================================
// Simplified to use only BINARY markets for clear, interpretable risk scoring.
// =============================================================================

import {
  POLYMARKET_MARKETS,
  REGIME_THRESHOLDS,
  REGIME_ALLOCATIONS,
} from '@/config/polymarket';
import {
  fetchMarketBySlug,
  extractBinaryYesProbability,
} from '@/lib/polymarket';
import type {
  RiskRegime,
  RiskSummary,
  MarketData,
  MarketCalculation,
  MarketRiskConfig,
} from '@/types/risk';

/**
 * Calculate normalized risk (0-1) for a single BINARY market
 */
async function calculateMarketRisk(config: MarketRiskConfig): Promise<MarketCalculation> {
  let rawProbability = 0.5;
  let normalizedRisk = 0.5;
  let question = config.slug;
  let explanation = '';

  try {
    const market = await fetchMarketBySlug(config.slug);
    
    if (market) {
      question = market.question || config.slug;
      rawProbability = extractBinaryYesProbability(market);
      
      // All markets: Higher "Yes" = higher risk (defensive indicators)
      normalizedRisk = rawProbability;
      explanation = `${question}: ${(rawProbability * 100).toFixed(1)}% Yes → +${(normalizedRisk * 100).toFixed(1)}% risk`;
    } else {
      explanation = `${config.slug}: Market data unavailable, using neutral (50%)`;
    }
  } catch (error) {
    console.error(`Error calculating risk for ${config.slug}:`, error);
    explanation = `${config.slug}: Error fetching data, using neutral (50%)`;
  }

  return {
    key: config.key,
    slug: config.slug,
    question,
    rawProbability,
    normalizedRisk,
    weightedContribution: normalizedRisk * config.weight,
    explanation,
  };
}

/**
 * Determine regime based on risk score
 */
function determineRegime(riskScore: number): RiskRegime {
  if (riskScore <= REGIME_THRESHOLDS.aggressive.max) {
    return 'Aggressive';
  } else if (riskScore <= REGIME_THRESHOLDS.neutral.max) {
    return 'Neutral';
  } else {
    return 'Defensive';
  }
}

/**
 * Calculate complete risk summary from all markets
 */
export async function calculateRiskSummary(): Promise<RiskSummary> {
  // Fetch and calculate risk for all markets in parallel
  const calculations = await Promise.all(
    POLYMARKET_MARKETS.map(config => calculateMarketRisk(config))
  );

  // Sum weighted contributions to get raw risk score (0-1)
  const riskScoreRaw = calculations.reduce(
    (sum, calc) => sum + calc.weightedContribution,
    0
  );

  // Convert to 0-100 scale
  const riskScore = Math.round(riskScoreRaw * 100);

  // Determine regime and allocation
  const regime = determineRegime(riskScore);
  const allocation = REGIME_ALLOCATIONS[regime];

  // Build market data for response
  const markets: MarketData[] = calculations.map((calc, index) => ({
    key: calc.key,
    slug: calc.slug,
    question: calc.question,
    probability: calc.rawProbability,
    riskContribution: calc.normalizedRisk,
    weight: POLYMARKET_MARKETS[index].weight,
    status: calc.explanation.includes('unavailable') || calc.explanation.includes('Error')
      ? 'error'
      : 'active',
  }));

  // Build explanations
  const explanations = calculations.map(calc => calc.explanation);

  return {
    riskScore,
    regime,
    recommendedBasePct: allocation.basePct,
    recommendedSolanaPct: allocation.solanaPct,
    explanations,
    markets,
    timestamp: new Date().toISOString(),
    cacheHit: false,
  };
}

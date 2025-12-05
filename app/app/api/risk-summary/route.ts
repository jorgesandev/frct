// =============================================================================
// Risk Summary API Route
// =============================================================================
// GET /api/risk-summary
// Returns current risk score, regime, and recommended allocation
// based on Polymarket prediction market data.
// =============================================================================

import { NextResponse } from 'next/server';
import { calculateRiskSummary } from '@/lib/risk-calculator';
import { CACHE_TTL_MS } from '@/config/polymarket';
import type { RiskSummary, RiskCacheEntry } from '@/types/risk';

// In-memory cache for risk summary
let cache: RiskCacheEntry | null = null;

/**
 * Check if cache is valid (within TTL)
 */
function isCacheValid(): boolean {
  if (!cache) return false;
  const age = Date.now() - cache.timestamp;
  return age < CACHE_TTL_MS;
}

/**
 * GET /api/risk-summary
 * 
 * Returns risk score and allocation recommendation based on Polymarket data.
 * Results are cached for 60 seconds to prevent API rate limiting.
 * 
 * Response:
 * {
 *   riskScore: number (0-100),
 *   regime: "Defensive" | "Neutral" | "Aggressive",
 *   recommendedBasePct: number (0-100),
 *   recommendedSolanaPct: number (0-100),
 *   explanations: string[],
 *   markets: MarketData[],
 *   timestamp: string,
 *   cacheHit: boolean
 * }
 */
export async function GET(): Promise<NextResponse<RiskSummary>> {
  try {
    // Return cached response if valid
    if (isCacheValid() && cache) {
      return NextResponse.json({
        ...cache.data,
        cacheHit: true,
      });
    }

    // Calculate fresh risk summary
    const summary = await calculateRiskSummary();

    // Update cache
    cache = {
      data: summary,
      timestamp: Date.now(),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error calculating risk summary:', error);

    // Return fallback neutral response on error
    const fallback: RiskSummary = {
      riskScore: 50,
      regime: 'Neutral',
      recommendedBasePct: 50,
      recommendedSolanaPct: 50,
      explanations: ['Error fetching market data. Using neutral fallback.'],
      markets: [],
      timestamp: new Date().toISOString(),
      cacheHit: false,
    };

    // Return stale cache if available, otherwise fallback
    if (cache) {
      return NextResponse.json({
        ...cache.data,
        cacheHit: true,
        explanations: [
          ...cache.data.explanations,
          'Warning: Using stale cached data due to API error.',
        ],
      });
    }

    return NextResponse.json(fallback, { status: 200 });
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

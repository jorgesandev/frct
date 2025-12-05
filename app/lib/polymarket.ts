// =============================================================================
// Polymarket Gamma API Client
// =============================================================================
// Simplified for BINARY markets only.
// =============================================================================

import { GAMMA_API_BASE_URL } from '@/config/polymarket';
import type { PolymarketMarketResponse } from '@/types/risk';

/**
 * Fetch market data from Polymarket Gamma API by slug
 */
export async function fetchMarketBySlug(slug: string): Promise<PolymarketMarketResponse | null> {
  try {
    const url = `${GAMMA_API_BASE_URL}/markets?slug=${encodeURIComponent(slug)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Disable cache to get fresh data
    });

    if (!response.ok) {
      console.error(`Polymarket API error for market ${slug}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as PolymarketMarketResponse;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch Polymarket market ${slug}:`, error);
    return null;
  }
}

/**
 * Extract "Yes" probability from a binary market
 * Returns value between 0 and 1
 */
export function extractBinaryYesProbability(market: PolymarketMarketResponse): number {
  if (!market.outcomePrices) {
    return 0.5; // Default to neutral if no data
  }
  
  // Handle both string and array formats from API
  let prices: string[];
  if (typeof market.outcomePrices === 'string') {
    try {
      prices = JSON.parse(market.outcomePrices);
    } catch {
      return 0.5;
    }
  } else {
    prices = market.outcomePrices;
  }
  
  if (!prices || prices.length === 0) {
    return 0.5;
  }
  
  // First outcome is typically "Yes"
  const yesPrice = parseFloat(prices[0]);
  return isNaN(yesPrice) ? 0.5 : yesPrice;
}

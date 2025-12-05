// =============================================================================
// Polymarket Gamma API Client
// =============================================================================

import { GAMMA_API_BASE_URL } from '@/config/polymarket';
import type { PolymarketEventResponse, PolymarketMarketResponse } from '@/types/risk';

/**
 * Fetch event data from Polymarket Gamma API by slug
 */
export async function fetchEventBySlug(slug: string): Promise<PolymarketEventResponse | null> {
  try {
    const url = `${GAMMA_API_BASE_URL}/events?slug=${encodeURIComponent(slug)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 30 seconds at fetch level
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.error(`Polymarket API error for slug ${slug}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // API returns array, get first match
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as PolymarketEventResponse;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch Polymarket event ${slug}:`, error);
    return null;
  }
}

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
      next: { revalidate: 30 },
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
  if (!market.outcomePrices || market.outcomePrices.length === 0) {
    return 0.5; // Default to neutral if no data
  }
  
  // First outcome is typically "Yes"
  const yesPrice = parseFloat(market.outcomePrices[0]);
  return isNaN(yesPrice) ? 0.5 : yesPrice;
}

/**
 * Extract probabilities from multi-outcome market
 * Returns map of outcome -> probability
 */
export function extractMultiOutcomeProbabilities(
  event: PolymarketEventResponse
): Map<string, number> {
  const probabilities = new Map<string, number>();
  
  if (!event.markets || event.markets.length === 0) {
    return probabilities;
  }
  
  for (const market of event.markets) {
    // Market question usually contains the outcome value
    const question = market.question.toLowerCase();
    
    // Extract the "Yes" probability for this outcome
    if (market.outcomePrices && market.outcomePrices.length > 0) {
      const yesProb = parseFloat(market.outcomePrices[0]);
      if (!isNaN(yesProb)) {
        probabilities.set(question, yesProb);
      }
    }
  }
  
  return probabilities;
}

/**
 * Calculate expected number of Fed rate cuts from multi-outcome market
 */
export function calculateExpectedFedCuts(event: PolymarketEventResponse): number {
  if (!event.markets || event.markets.length === 0) {
    return 0;
  }

  let expectedCuts = 0;
  let totalProb = 0;

  for (const market of event.markets) {
    const question = market.question.toLowerCase();
    
    // Try to extract the number of cuts from the question
    // Examples: "0 cuts", "1 cut", "2 cuts", "3+ cuts"
    const match = question.match(/(\d+)\+?\s*cut/);
    if (match) {
      const numCuts = parseInt(match[1]);
      const prob = parseFloat(market.outcomePrices?.[0] || '0');
      
      if (!isNaN(numCuts) && !isNaN(prob)) {
        expectedCuts += numCuts * prob;
        totalProb += prob;
      }
    }
  }

  // Normalize if probabilities don't sum to 1
  if (totalProb > 0 && totalProb !== 1) {
    expectedCuts = expectedCuts / totalProb;
  }

  return expectedCuts;
}

/**
 * Calculate bull probability for crypto price market
 * Sums probabilities of outcomes at or above the threshold
 */
export function calculateBullProbability(
  event: PolymarketEventResponse,
  thresholdPrice: number
): number {
  if (!event.markets || event.markets.length === 0) {
    return 0.5; // Neutral if no data
  }

  let bullProb = 0;

  for (const market of event.markets) {
    const question = market.question.toLowerCase();
    
    // Try to extract price from question
    // Examples: "$100,000?", "$95,000+", "95k"
    const priceMatch = question.match(/\$?([\d,]+)(?:k|\+|\?|$)/i);
    
    if (priceMatch) {
      let price = parseFloat(priceMatch[1].replace(/,/g, ''));
      
      // Handle "k" suffix (e.g., "95k" -> 95000)
      if (question.includes('k') && price < 1000) {
        price *= 1000;
      }
      
      if (price >= thresholdPrice) {
        const prob = parseFloat(market.outcomePrices?.[0] || '0');
        if (!isNaN(prob)) {
          bullProb += prob;
        }
      }
    }
  }

  // Clamp to 0-1
  return Math.min(Math.max(bullProb, 0), 1);
}

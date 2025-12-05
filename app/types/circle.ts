// =============================================================================
// Circle Payments Types
// =============================================================================

/**
 * Payout status from Circle
 */
export type PayoutStatus = 'pending' | 'confirmed' | 'complete' | 'failed';

/**
 * Supported blockchain chains for payouts
 */
export type SupportedChain = 'ETH' | 'BASE' | 'SOL' | 'MATIC' | 'AVAX';

/**
 * Chain display names
 */
export const CHAIN_NAMES: Record<SupportedChain, string> = {
  ETH: 'Ethereum',
  BASE: 'Base',
  SOL: 'Solana',
  MATIC: 'Polygon',
  AVAX: 'Avalanche',
};

/**
 * Payout response from API
 */
export interface PayoutResponse {
  id: string;
  status: PayoutStatus;
  amount: string;
  currency: string;
  fees?: string;
  destination: string;
  chain: string;
  trackingRef?: string;
  createDate: string;
  updateDate?: string;
}

/**
 * Create payout request
 */
export interface CreatePayoutParams {
  amount: string;
  address: string;
  chain: SupportedChain;
  email?: string;
}

/**
 * API success response
 */
export interface PayoutApiResponse {
  success: boolean;
  payout?: PayoutResponse;
  payouts?: PayoutResponse[];
  error?: string;
  details?: string;
}


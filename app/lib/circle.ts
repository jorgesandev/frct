// =============================================================================
// Circle Payments API Client
// =============================================================================
// Client for interacting with Circle's Payouts API
// Documentation: https://developers.circle.com/api-reference
// =============================================================================

const CIRCLE_API_BASE = 'https://api-sandbox.circle.com/v1';

/**
 * Circle API error response
 */
interface CircleError {
  code: number;
  message: string;
}

/**
 * Circle payout destination
 */
interface PayoutDestination {
  type: 'address_book' | 'blockchain';
  addressId?: string;
  chain?: string;
  address?: string;
}

/**
 * Circle payout amount
 */
interface PayoutAmount {
  amount: string;
  currency: 'USD';
}

/**
 * Create payout request body
 */
export interface CreatePayoutRequest {
  idempotencyKey: string;
  destination: PayoutDestination;
  amount: PayoutAmount;
  metadata?: {
    beneficiaryEmail?: string;
  };
}

/**
 * Payout status from Circle
 */
export type PayoutStatus = 'pending' | 'confirmed' | 'complete' | 'failed';

/**
 * Circle payout response
 */
export interface CirclePayout {
  id: string;
  sourceWalletId: string;
  destination: PayoutDestination;
  amount: PayoutAmount;
  fees: PayoutAmount;
  status: PayoutStatus;
  trackingRef: string;
  createDate: string;
  updateDate: string;
}

/**
 * Circle API response wrapper
 */
interface CircleResponse<T> {
  data: T;
}

/**
 * Get Circle API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Make a request to Circle API
 */
async function circleRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  
  const response = await fetch(`${CIRCLE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as CircleError;
    throw new Error(`Circle API Error: ${error.message || response.statusText}`);
  }

  return (data as CircleResponse<T>).data;
}

/**
 * Create a crypto payout
 * 
 * @param request - Payout request details
 * @returns Created payout object
 */
export async function createPayout(request: CreatePayoutRequest): Promise<CirclePayout> {
  return circleRequest<CirclePayout>('/payouts', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get payout by ID
 * 
 * @param payoutId - The payout ID
 * @returns Payout details
 */
export async function getPayout(payoutId: string): Promise<CirclePayout> {
  return circleRequest<CirclePayout>(`/payouts/${payoutId}`);
}

/**
 * List all payouts
 * 
 * @param options - Filter options
 * @returns Array of payouts
 */
export async function listPayouts(options?: {
  status?: PayoutStatus;
  pageSize?: number;
}): Promise<CirclePayout[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.pageSize) params.set('pageSize', options.pageSize.toString());
  
  const queryString = params.toString();
  const endpoint = queryString ? `/payouts?${queryString}` : '/payouts';
  
  return circleRequest<CirclePayout[]>(endpoint);
}

/**
 * Get master wallet balance
 */
export interface WalletBalance {
  amount: string;
  currency: string;
}

export interface MasterWallet {
  walletId: string;
  entityId: string;
  type: string;
  description: string;
  balances: WalletBalance[];
}

export async function getMasterWallet(): Promise<MasterWallet> {
  return circleRequest<MasterWallet>('/configuration');
}

/**
 * Generate an idempotency key for payout requests
 */
export function generateIdempotencyKey(): string {
  return `payout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Supported blockchain chains for Circle payouts
 */
export const SUPPORTED_CHAINS = {
  ETH: 'Ethereum Mainnet',
  BASE: 'Base',
  SOL: 'Solana',
  MATIC: 'Polygon',
  AVAX: 'Avalanche',
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;


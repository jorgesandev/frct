// =============================================================================
// Circle Payout API Route
// =============================================================================
// POST /api/circle-payout - Create a payout
// GET /api/circle-payout?id=xxx - Get payout status
// GET /api/circle-payout - List payouts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  createPayout, 
  getPayout, 
  listPayouts,
  generateIdempotencyKey,
  type CreatePayoutRequest,
  type SupportedChain,
} from '@/lib/circle';

/**
 * POST - Create a new payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { amount, address, chain = 'BASE', email } = body as {
      amount: string;
      address: string;
      chain?: SupportedChain;
      email?: string;
    };

    // Validate required fields
    if (!amount || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, address' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount: must be a positive number' },
        { status: 400 }
      );
    }

    // Validate address format (basic check)
    if (chain === 'SOL') {
      // Solana addresses are base58 encoded, typically 32-44 chars
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        return NextResponse.json(
          { error: 'Invalid Solana address format' },
          { status: 400 }
        );
      }
    } else {
      // EVM addresses start with 0x and are 42 chars
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json(
          { error: 'Invalid EVM address format' },
          { status: 400 }
        );
      }
    }

    const payoutRequest: CreatePayoutRequest = {
      idempotencyKey: generateIdempotencyKey(),
      destination: {
        type: 'blockchain',
        chain: chain,
        address: address,
      },
      amount: {
        amount: amountNum.toFixed(2),
        currency: 'USD',
      },
      metadata: email ? { beneficiaryEmail: email } : undefined,
    };

    const payout = await createPayout(payoutRequest);

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        status: payout.status,
        amount: payout.amount.amount,
        currency: payout.amount.currency,
        destination: payout.destination.address,
        chain: payout.destination.chain,
        trackingRef: payout.trackingRef,
        createDate: payout.createDate,
      },
    });

  } catch (error) {
    console.error('Circle payout error:', error);
    
    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('CIRCLE_API_KEY')) {
      return NextResponse.json(
        { 
          error: 'Circle API not configured',
          details: 'Please set CIRCLE_API_KEY environment variable',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create payout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get payout(s)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payoutId = searchParams.get('id');
    const status = searchParams.get('status');

    // If ID is provided, get single payout
    if (payoutId) {
      const payout = await getPayout(payoutId);
      return NextResponse.json({
        success: true,
        payout: {
          id: payout.id,
          status: payout.status,
          amount: payout.amount.amount,
          currency: payout.amount.currency,
          fees: payout.fees?.amount,
          destination: payout.destination.address,
          chain: payout.destination.chain,
          trackingRef: payout.trackingRef,
          createDate: payout.createDate,
          updateDate: payout.updateDate,
        },
      });
    }

    // Otherwise, list payouts
    const payouts = await listPayouts({
      status: status as 'pending' | 'confirmed' | 'complete' | 'failed' | undefined,
      pageSize: 10,
    });

    return NextResponse.json({
      success: true,
      payouts: payouts.map(payout => ({
        id: payout.id,
        status: payout.status,
        amount: payout.amount.amount,
        currency: payout.amount.currency,
        destination: payout.destination.address,
        chain: payout.destination.chain,
        createDate: payout.createDate,
      })),
    });

  } catch (error) {
    console.error('Circle payout fetch error:', error);

    if (error instanceof Error && error.message.includes('CIRCLE_API_KEY')) {
      return NextResponse.json(
        { 
          error: 'Circle API not configured',
          details: 'Please set CIRCLE_API_KEY environment variable',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch payout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


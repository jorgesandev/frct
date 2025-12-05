// =============================================================================
// Solana Balance API Route
// =============================================================================
// Fetches real USDC balance from the Solana vault token account
// =============================================================================

import { NextResponse } from 'next/server';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const VAULT_TOKEN_ACCOUNT = process.env.NEXT_PUBLIC_SOLANA_VAULT_TOKEN_ACCOUNT || '3tg7yaecTqDSRJufwcrbiSqtJzeyiKKmLQzdkr7sgikx';

export async function GET() {
  try {
    // Use Solana JSON-RPC to get token account balance
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountBalance',
        params: [VAULT_TOKEN_ACCOUNT],
      }),
    });

    const data = await response.json();

    if (data.error) {
      // Token account might not exist yet or have no balance
      return NextResponse.json({
        balance: '0',
        balanceRaw: '0',
        decimals: 6,
        vaultTokenAccount: VAULT_TOKEN_ACCOUNT,
        error: data.error.message,
      });
    }

    const result = data.result?.value;
    
    if (!result) {
      return NextResponse.json({
        balance: '0',
        balanceRaw: '0',
        decimals: 6,
        vaultTokenAccount: VAULT_TOKEN_ACCOUNT,
      });
    }

    return NextResponse.json({
      balance: result.uiAmountString || '0',
      balanceRaw: result.amount || '0',
      decimals: result.decimals || 6,
      vaultTokenAccount: VAULT_TOKEN_ACCOUNT,
    });

  } catch (error) {
    console.error('Solana balance fetch error:', error);
    return NextResponse.json({
      balance: '0',
      balanceRaw: '0',
      decimals: 6,
      vaultTokenAccount: VAULT_TOKEN_ACCOUNT,
      error: String(error),
    });
  }
}


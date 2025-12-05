// =============================================================================
// CCTP Attestation API Route
// =============================================================================
// Proxies attestation requests to Circle's Iris API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

const ATTESTATION_API = {
  testnet: 'https://iris-api-sandbox.circle.com/attestations',
  mainnet: 'https://iris-api.circle.com/attestations',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageHash = searchParams.get('messageHash');
    const isMainnet = searchParams.get('mainnet') === 'true';

    if (!messageHash) {
      return NextResponse.json(
        { error: 'messageHash is required' },
        { status: 400 }
      );
    }

    const baseUrl = isMainnet ? ATTESTATION_API.mainnet : ATTESTATION_API.testnet;
    const response = await fetch(`${baseUrl}/${messageHash}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          status: 'pending',
          message: 'Attestation not yet available',
        });
      }
      throw new Error(`Attestation API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: data.status,
      attestation: data.attestation,
      message: data.message,
    });

  } catch (error) {
    console.error('CCTP attestation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attestation', details: String(error) },
      { status: 500 }
    );
  }
}


'use client';

// =============================================================================
// useRiskSummary Hook
// =============================================================================
// Custom hook for fetching and caching risk summary data
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiskSummary } from '@/types/risk';

async function fetchRiskSummary(): Promise<RiskSummary> {
  const response = await fetch('/api/risk-summary');
  if (!response.ok) {
    throw new Error('Failed to fetch risk data');
  }
  return response.json();
}

export function useRiskSummary() {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['risk-summary'],
    queryFn: fetchRiskSummary,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 60 seconds
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
  };
}

/**
 * Get the CSS class for a risk regime badge
 */
export function getRegimeBadgeClass(regime: string | undefined): string {
  switch (regime) {
    case 'Aggressive': return 'badge-aggressive';
    case 'Defensive': return 'badge-defensive';
    default: return 'badge-neutral';
  }
}

/**
 * Get the color for a risk score
 */
export function getRiskScoreColor(score: number): string {
  if (score < 35) return 'text-green-400';
  if (score < 65) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get the gradient for a risk score bar
 */
export function getRiskBarGradient(score: number): string {
  if (score < 35) return 'from-green-500 to-green-400';
  if (score < 65) return 'from-yellow-500 to-orange-400';
  return 'from-red-500 to-red-400';
}


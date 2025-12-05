// =============================================================================
// CCTP Bridge Hook
// =============================================================================
// Hook for bridging USDC from Base to Solana via Circle CCTP
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { parseUnits, encodeFunctionData, keccak256 } from 'viem';
import {
  CCTP_BASE_SEPOLIA,
  CCTP_SOLANA_DEVNET,
  TOKEN_MESSENGER_ABI,
  addressToBytes32,
  getAttestation,
} from '@/config/cctp';
import { USDC_ABI } from '@/lib/contracts';
import type { BridgeStatus, BridgeTransaction } from '@/types/cctp';

export interface UseCCTPBridgeReturn {
  // State
  status: BridgeStatus | 'idle';
  currentTx: BridgeTransaction | null;
  error: string | null;
  isLoading: boolean;
  
  // Actions
  bridgeToSolana: (amount: string, destinationAddress: string) => Promise<void>;
  checkAttestation: (messageHash: string) => Promise<void>;
  reset: () => void;
}

export function useCCTPBridge(): UseCCTPBridgeReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [status, setStatus] = useState<BridgeStatus | 'idle'>('idle');
  const [currentTx, setCurrentTx] = useState<BridgeTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Contract write hooks
  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeDeposit } = useWriteContract();

  const bridgeToSolana = useCallback(async (amount: string, destinationAddress: string) => {
    if (!address || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const txId = `bridge-${Date.now()}`;
    const amountInUnits = parseUnits(amount, 6); // USDC has 6 decimals

    try {
      // Create transaction record
      const tx: BridgeTransaction = {
        id: txId,
        direction: 'base-to-solana',
        amount,
        status: 'pending_deposit',
        createdAt: new Date().toISOString(),
        sourceAddress: address,
        destinationAddress,
      };
      setCurrentTx(tx);
      setStatus('pending_deposit');

      // Step 1: Approve TokenMessenger to spend USDC
      console.log('Step 1: Approving USDC...');
      const approveTxHash = await writeApprove({
        address: CCTP_BASE_SEPOLIA.usdc,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CCTP_BASE_SEPOLIA.tokenMessenger, amountInUnits],
      });

      // Wait for approval confirmation
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      console.log('USDC approved:', approveTxHash);

      // Step 2: Call depositForBurn on TokenMessenger
      console.log('Step 2: Depositing for burn...');
      
      // Convert Solana address to bytes32 format
      // For Solana, we need the associated token account address
      // For simplicity, we'll use a placeholder - in production you'd compute the ATA
      const mintRecipient = addressToBytes32(destinationAddress);
      
      const depositTxHash = await writeDeposit({
        address: CCTP_BASE_SEPOLIA.tokenMessenger,
        abi: TOKEN_MESSENGER_ABI,
        functionName: 'depositForBurn',
        args: [
          amountInUnits,
          CCTP_SOLANA_DEVNET.domainId, // Solana domain ID
          mintRecipient,
          CCTP_BASE_SEPOLIA.usdc,
        ],
      });

      // Wait for deposit confirmation
      const depositReceipt = await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
      console.log('Deposit complete:', depositTxHash);

      // Update transaction with source tx hash
      setCurrentTx(prev => prev ? {
        ...prev,
        sourceTxHash: depositTxHash,
        status: 'deposited',
      } : null);
      setStatus('deposited');

      // Step 3: Extract message hash from logs for attestation
      // The MessageSent event contains the message we need
      const messageSentTopic = keccak256(
        Buffer.from('MessageSent(bytes)')
      );
      
      const messageSentLog = depositReceipt.logs.find(
        log => log.topics[0] === messageSentTopic
      );

      if (messageSentLog) {
        // The message hash is keccak256 of the message data
        const messageHash = keccak256(messageSentLog.data);
        
        setCurrentTx(prev => prev ? {
          ...prev,
          messageHash,
          status: 'pending_attestation',
        } : null);
        setStatus('pending_attestation');

        console.log('Message hash for attestation:', messageHash);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Bridge error:', err);
      setError(err instanceof Error ? err.message : 'Bridge failed');
      setStatus('failed');
      setCurrentTx(prev => prev ? { ...prev, status: 'failed' } : null);
      setIsLoading(false);
    }
  }, [address, publicClient, writeApprove, writeDeposit]);

  const checkAttestation = useCallback(async (messageHash: string) => {
    setIsLoading(true);
    
    try {
      const result = await getAttestation(messageHash, false); // false = testnet
      
      if (result.status === 'complete' && result.attestation) {
        setCurrentTx(prev => prev ? {
          ...prev,
          status: 'attested',
        } : null);
        setStatus('attested');
        
        console.log('Attestation received:', result.attestation);
        // At this point, you would call receiveMessage on Solana
        // This requires Solana wallet integration
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Attestation check failed:', err);
      setError('Failed to check attestation');
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentTx(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    status,
    currentTx,
    error,
    isLoading,
    bridgeToSolana,
    checkAttestation,
    reset,
  };
}


/**
 * Wallet Utilities
 * Helper functions for wallet operations and signatures
 */

import { type WalletClient } from 'viem';
import { generateAnalyticsId } from './encryption';

// Master key message for deterministic encryption key derivation
export const MASTER_KEY_MESSAGE = 'dreamtree-master-key-v1';

/**
 * Request wallet signature for master key
 * This signature is used to derive the user's encryption key
 * @param walletClient - Viem wallet client
 * @param address - User's wallet address
 * @returns Signature string
 */
export async function requestMasterKeySignature(
  walletClient: WalletClient,
  address: `0x${string}`
): Promise<string> {
  const signature = await walletClient.signMessage({
    account: address,
    message: MASTER_KEY_MESSAGE,
  });

  return signature;
}

/**
 * Request authentication signature with timestamp
 * Used for API authentication (expires after 5 minutes)
 * @param walletClient - Viem wallet client
 * @param address - User's wallet address
 * @returns Object with signature and timestamp
 */
export async function requestAuthSignature(
  walletClient: WalletClient,
  address: `0x${string}`
): Promise<{ signature: string; timestamp: number }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `DreamTree Authentication\nTimestamp: ${timestamp}`;

  const signature = await walletClient.signMessage({
    account: address,
    message,
  });

  return { signature, timestamp };
}

/**
 * Format authentication header for API requests
 * Format: "Bearer {walletAddress}:{signature}:{timestamp}"
 */
export function formatAuthHeader(
  walletAddress: string,
  signature: string,
  timestamp: number
): string {
  return `Bearer ${walletAddress}:${signature}:${timestamp}`;
}

/**
 * Parse authentication header
 */
export function parseAuthHeader(header: string): {
  walletAddress: string;
  signature: string;
  timestamp: number;
} | null {
  try {
    const [bearer, data] = header.split(' ');
    if (bearer !== 'Bearer') return null;

    const [walletAddress, signature, timestampStr] = data.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (!walletAddress || !signature || isNaN(timestamp)) return null;

    return { walletAddress, signature, timestamp };
  } catch {
    return null;
  }
}

/**
 * Verify authentication signature is recent (< 5 minutes old)
 */
export function isAuthSignatureValid(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return now - timestamp < fiveMinutes;
}

/**
 * Generate analytics ID for a wallet address
 */
export async function getAnalyticsIdForWallet(
  walletAddress: string
): Promise<string> {
  return generateAnalyticsId(walletAddress);
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

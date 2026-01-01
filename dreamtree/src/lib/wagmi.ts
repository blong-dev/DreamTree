/**
 * Wagmi and RainbowKit Configuration
 * Sets up Web3 wallet connection for DreamTree
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';
const appName = 'DreamTree';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Configure Wagmi with RainbowKit
export const config = getDefaultConfig({
  appName,
  projectId,
  chains: [mainnet, sepolia], // Use mainnet for production, sepolia for testing
  ssr: true, // Enable server-side rendering
});

// Re-export chains for use in components
export { mainnet, sepolia };

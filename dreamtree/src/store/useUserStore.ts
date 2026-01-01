/**
 * User State Store
 * Manages user account, wallet, and authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserAccount } from '@/lib/api';

interface UserState {
  // Wallet connection
  walletAddress: string | null;
  isConnected: boolean;
  masterKeySignature: string | null;
  authSignature: string | null;
  authTimestamp: number | null;

  // Account data
  account: UserAccount | null;
  credits: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWalletAddress: (address: string | null) => void;
  setMasterKeySignature: (signature: string) => void;
  setAuthSignature: (signature: string, timestamp: number) => void;
  setAccount: (account: UserAccount | null) => void;
  updateCredits: (credits: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
  reset: () => void;
}

const initialState = {
  walletAddress: null,
  isConnected: false,
  masterKeySignature: null,
  authSignature: null,
  authTimestamp: null,
  account: null,
  credits: 0,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setWalletAddress: (address) =>
        set({ walletAddress: address, isConnected: !!address }),

      setMasterKeySignature: (signature) =>
        set({ masterKeySignature: signature }),

      setAuthSignature: (signature, timestamp) =>
        set({ authSignature: signature, authTimestamp: timestamp }),

      setAccount: (account) =>
        set({
          account,
          credits: account?.credits || 0,
        }),

      updateCredits: (credits) => set({ credits }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      disconnect: () =>
        set({
          ...initialState,
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'dreamtree-user-storage',
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        isConnected: state.isConnected,
        // Don't persist signatures for security
      }),
    }
  )
);

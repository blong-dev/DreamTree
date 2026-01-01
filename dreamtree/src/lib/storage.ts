/**
 * IndexedDB Storage Utilities
 * Client-side encrypted storage for user data
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { EncryptedData } from './encryption';

// ============================================
// DATABASE SETUP
// ============================================

const DB_NAME = 'dreamtree-db';
const DB_VERSION = 1;

export interface StoredExerciseData {
  exerciseId: string;
  moduleId: number;
  data: EncryptedData;
  savedAt: number;
  completedAt?: number;
}

export interface StoredConversation {
  exerciseId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  lastUpdated: number;
}

export interface StoredWalletData {
  address: string;
  masterKeySignature: string;
  lastConnected: number;
}

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Exercise data store
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', {
          keyPath: 'exerciseId',
        });
        exerciseStore.createIndex('moduleId', 'moduleId');
        exerciseStore.createIndex('savedAt', 'savedAt');
      }

      // Conversation history store
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', {
          keyPath: 'exerciseId',
        });
      }

      // Wallet data store (single entry)
      if (!db.objectStoreNames.contains('wallet')) {
        db.createObjectStore('wallet', {
          keyPath: 'address',
        });
      }

      // App state store
      if (!db.objectStoreNames.contains('appState')) {
        db.createObjectStore('appState', {
          keyPath: 'key',
        });
      }
    },
  });
}

// ============================================
// EXERCISE DATA STORAGE
// ============================================

export async function saveExerciseData(
  exerciseId: string,
  moduleId: number,
  encryptedData: EncryptedData,
  completed: boolean = false
): Promise<void> {
  const db = await getDB();
  const data: StoredExerciseData = {
    exerciseId,
    moduleId,
    data: encryptedData,
    savedAt: Date.now(),
    completedAt: completed ? Date.now() : undefined,
  };

  await db.put('exercises', data);
}

export async function getExerciseData(
  exerciseId: string
): Promise<StoredExerciseData | undefined> {
  const db = await getDB();
  return db.get('exercises', exerciseId);
}

export async function getAllExerciseData(): Promise<StoredExerciseData[]> {
  const db = await getDB();
  return db.getAll('exercises');
}

export async function deleteExerciseData(exerciseId: string): Promise<void> {
  const db = await getDB();
  await db.delete('exercises', exerciseId);
}

// ============================================
// CONVERSATION STORAGE
// ============================================

export async function saveConversation(
  exerciseId: string,
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>
): Promise<void> {
  const db = await getDB();
  const conversation: StoredConversation = {
    exerciseId,
    messages,
    lastUpdated: Date.now(),
  };

  await db.put('conversations', conversation);
}

export async function getConversation(
  exerciseId: string
): Promise<StoredConversation | undefined> {
  const db = await getDB();
  return db.get('conversations', exerciseId);
}

export async function deleteConversation(exerciseId: string): Promise<void> {
  const db = await getDB();
  await db.delete('conversations', exerciseId);
}

// ============================================
// WALLET DATA STORAGE
// ============================================

export async function saveWalletData(
  address: string,
  masterKeySignature: string
): Promise<void> {
  const db = await getDB();
  const data: StoredWalletData = {
    address: address.toLowerCase(),
    masterKeySignature,
    lastConnected: Date.now(),
  };

  await db.put('wallet', data);
}

export async function getWalletData(
  address: string
): Promise<StoredWalletData | undefined> {
  const db = await getDB();
  return db.get('wallet', address.toLowerCase());
}

export async function deleteWalletData(address: string): Promise<void> {
  const db = await getDB();
  await db.delete('wallet', address.toLowerCase());
}

// ============================================
// APP STATE STORAGE
// ============================================

export async function saveAppState<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('appState', { key, value });
}

export async function getAppState<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get('appState', key);
  return result?.value as T | undefined;
}

export async function deleteAppState(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('appState', key);
}

// ============================================
// CLEAR ALL DATA
// ============================================

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('exercises');
  await db.clear('conversations');
  await db.clear('wallet');
  await db.clear('appState');
}

// ============================================
// EXPORT COMPLETE DATABASE BACKUP
// ============================================

export async function exportAllData(): Promise<{
  exercises: StoredExerciseData[];
  conversations: StoredConversation[];
  wallet: StoredWalletData | null;
  appState: Record<string, unknown>;
}> {
  const db = await getDB();

  const exercises = await db.getAll('exercises');
  const conversations = await db.getAll('conversations');
  const walletData = await db.getAll('wallet');
  const appStateData = await db.getAll('appState');

  const appState: Record<string, unknown> = {};
  appStateData.forEach((item) => {
    appState[item.key] = item.value;
  });

  return {
    exercises,
    conversations,
    wallet: walletData[0] || null,
    appState,
  };
}

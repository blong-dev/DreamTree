/**
 * DreamTree Encryption Utilities
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 * Used for encrypting user career data with wallet-derived keys
 */

// ============================================
// TYPES
// ============================================

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  algorithm: 'AES-256-GCM';
}

export interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

// ============================================
// CONSTANTS
// ============================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const PBKDF2_ITERATIONS = 100000;
const SALT = 'dreamtree-salt-v1'; // Static salt for deterministic key derivation

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================
// KEY DERIVATION
// ============================================

/**
 * Derive an encryption key from a password/signature using PBKDF2
 * @param keyMaterial - Source material (wallet signature or password)
 * @param salt - Salt for key derivation (uses static salt for deterministic keys)
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 */
export async function deriveKey(
  keyMaterial: string,
  salt: string = SALT
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // Import the key material
  const importedKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyMaterial),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive the actual encryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    importedKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

// ============================================
// ENCRYPTION
// ============================================

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - String to encrypt
 * @param key - Encryption key (wallet signature or password)
 * @returns Encrypted data with IV and ciphertext
 */
export async function encryptAES256(
  plaintext: string,
  key: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder();

  // Derive encryption key from the provided key material
  const encryptionKey = await deriveKey(key);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    encryptionKey,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
    algorithm: 'AES-256-GCM',
  };
}

/**
 * Encrypt an object (converts to JSON first)
 */
export async function encryptObject(
  obj: unknown,
  key: string
): Promise<EncryptedData> {
  const jsonString = JSON.stringify(obj);
  return encryptAES256(jsonString, key);
}

// ============================================
// DECRYPTION
// ============================================

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param encryptedData - Encrypted data with IV
 * @param key - Decryption key (same as used for encryption)
 * @returns Decrypted plaintext string
 */
export async function decryptAES256(
  encryptedData: EncryptedData,
  key: string
): Promise<string> {
  const decoder = new TextDecoder();

  // Derive decryption key
  const decryptionKey = await deriveKey(key);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: base64ToArrayBuffer(encryptedData.iv),
    },
    decryptionKey,
    base64ToArrayBuffer(encryptedData.ciphertext)
  );

  return decoder.decode(decrypted);
}

/**
 * Decrypt and parse JSON object
 */
export async function decryptObject<T = unknown>(
  encryptedData: EncryptedData,
  key: string
): Promise<T> {
  const jsonString = await decryptAES256(encryptedData, key);
  return JSON.parse(jsonString) as T;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Encrypt data with a wallet signature (user master key)
 * The signature is deterministic, so the same wallet always generates the same key
 */
export async function encryptWithWallet(
  data: unknown,
  walletSignature: string
): Promise<EncryptedData> {
  return encryptObject(data, walletSignature);
}

/**
 * Decrypt data with a wallet signature
 */
export async function decryptWithWallet<T = unknown>(
  encryptedData: EncryptedData,
  walletSignature: string
): Promise<T> {
  return decryptObject<T>(encryptedData, walletSignature);
}

/**
 * Generate a one-way analytics ID from wallet address
 * Used to anonymize user tracking while maintaining uniqueness
 */
export async function generateAnalyticsId(
  walletAddress: string,
  salt: string = 'dreamtree-analytics-salt'
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(walletAddress + salt);

  // Hash the wallet address with salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `anon_${hashHex.substring(0, 16)}`;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate encrypted data structure
 */
export function isValidEncryptedData(data: unknown): data is EncryptedData {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  return (
    typeof d.ciphertext === 'string' &&
    typeof d.iv === 'string' &&
    d.algorithm === 'AES-256-GCM'
  );
}

/**
 * Test encryption/decryption roundtrip
 * Useful for verifying wallet signatures work correctly
 */
export async function testEncryption(
  testData: unknown,
  key: string
): Promise<boolean> {
  try {
    const encrypted = await encryptObject(testData, key);
    const decrypted = await decryptObject(encrypted, key);
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}

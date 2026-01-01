/**
 * API Client
 * Handles all API requests to Cloudflare Workers backend
 */

import { formatAuthHeader } from './wallet';
import type { EncryptedData } from './encryption';

// ============================================
// TYPES
// ============================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface UserAccount {
  id: string;
  walletAddress: string;
  analyticsId: string;
  credits: number;
  modulesCompleted: number[];
  currentModule: number;
  exercisesCompleted: string[];
  accountStatus: string;
  accountType: string;
}

export interface CareerData {
  encryptedBlob: EncryptedData;
  metadata?: {
    dreamJob?: string;
    targetRole?: string;
    salary?: number;
  };
}

export interface Credential {
  id: string;
  type: string;
  issuedDate: number;
  moduleId?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  cost: number;
  creditsRemaining: number;
}

// ============================================
// BASE API CLIENT
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private authHeader: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication header for subsequent requests
   */
  setAuth(walletAddress: string, signature: string, timestamp: number) {
    this.authHeader = formatAuthHeader(walletAddress, signature, timestamp);
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.authHeader = null;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if available
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `API Error: ${response.statusText}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.code = errorData.code;
      } catch {
        // Use default error message
      }

      throw error;
    }

    return response.json();
  }

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================

  async createCheckoutSession(
    walletAddress: string,
    amount: number,
    type: 'initial' | 'add_credits' = 'initial'
  ): Promise<{ sessionId: string; url: string }> {
    return this.request('/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, amount, type }),
    });
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  async createUser(
    walletAddress: string,
    sessionId: string
  ): Promise<{ success: boolean; user: UserAccount }> {
    return this.request('/user/create', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, sessionId }),
    });
  }

  async getUserData(): Promise<{
    account: UserAccount;
    careerData?: CareerData;
    credentials: Credential[];
  }> {
    return this.request('/user/data', {
      method: 'GET',
    });
  }

  async saveExerciseData(data: {
    moduleId: number;
    exerciseId: string;
    data: unknown;
    metadata: {
      timeSpent: number;
      completedAt: number;
    };
  }): Promise<{ success: boolean; creditsRemaining: number }> {
    return this.request('/user/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUserData(): Promise<{ success: boolean; backupUrl: string }> {
    return this.request('/user/delete', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: 'DELETE_MY_DATA' }),
    });
  }

  // ============================================
  // AI ENDPOINTS
  // ============================================

  async sendChatMessage(
    message: string,
    conversationHistory: ChatMessage[],
    context: {
      moduleId: number;
      exerciseId: string;
    },
    systemPrompt?: string
  ): Promise<ChatResponse> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationHistory,
        context,
        systemPrompt,
      }),
    });
  }

  // ============================================
  // RESEARCH ENDPOINTS
  // ============================================

  async executeResearch(
    query: string,
    tools: string[],
    moduleId: number,
    exerciseId: string
  ): Promise<{
    results: Array<{ source: string; data: unknown }>;
    cost: number;
    creditsRemaining: number;
  }> {
    return this.request('/research/search', {
      method: 'POST',
      body: JSON.stringify({ query, tools, moduleId, exerciseId }),
    });
  }

  // ============================================
  // CREDENTIALS ENDPOINTS
  // ============================================

  async verifyCredential(
    credentialId: string
  ): Promise<{
    valid: boolean;
    trusted: boolean;
    credential: unknown;
  }> {
    return this.request(`/credentials/verify?credentialId=${credentialId}`, {
      method: 'GET',
    });
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  async getAdminInsights(): Promise<{
    revenue: unknown;
    users: unknown;
    completion: unknown;
    costs: unknown;
  }> {
    return this.request('/admin/insights', {
      method: 'GET',
    });
  }

  async submitScholarshipApplication(data: {
    email: string;
    name: string;
    story: string;
    reason: string;
    goal: string;
  }): Promise<{ success: boolean; id: string }> {
    return this.request('/scholarship/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const api = new ApiClient();
export default api;

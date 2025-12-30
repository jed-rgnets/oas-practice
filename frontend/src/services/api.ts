/**
 * API client for communicating with the backend
 */

import type {
  Scenario,
  ScenarioSummary,
  TopicInfo,
  ValidationResponse,
  Topic,
  Difficulty,
} from '../types';

const API_BASE = '/api/v1';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error: { error?: string; message?: string } = {};
    try {
      error = await response.json();
    } catch {
      // Response wasn't JSON
    }
    throw new ApiError(
      error.error || 'unknown_error',
      error.message || `HTTP ${response.status} error`,
      response.status
    );
  }
  return response.json();
}

// Convert snake_case to camelCase
function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return obj as T;
}

export interface ScenariosResponse {
  scenarios: ScenarioSummary[];
  total: number;
  topics: string[];
}

export interface TopicsResponse {
  topics: TopicInfo[];
}

export const api = {
  async getScenarios(params?: {
    topics?: Topic[];
    difficulty?: Difficulty;
  }): Promise<ScenariosResponse> {
    const searchParams = new URLSearchParams();
    if (params?.topics?.length) {
      searchParams.set('topics', params.topics.join(','));
    }
    if (params?.difficulty) {
      searchParams.set('difficulty', params.difficulty);
    }

    const query = searchParams.toString();
    const url = `${API_BASE}/scenarios${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    const data = await handleResponse<ScenariosResponse>(response);
    return toCamelCase(data);
  },

  async getScenario(id: string): Promise<Scenario> {
    const response = await fetch(`${API_BASE}/scenarios/${id}`);
    const data = await handleResponse<Scenario>(response);
    return toCamelCase(data);
  },

  async getTopics(): Promise<TopicsResponse> {
    const response = await fetch(`${API_BASE}/scenarios/topics`);
    const data = await handleResponse<TopicsResponse>(response);
    return toCamelCase(data);
  },

  async validateSolution(scenarioId: string, solution: string): Promise<ValidationResponse> {
    const response = await fetch(`${API_BASE}/scenarios/${scenarioId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ solution }),
    });
    const data = await handleResponse<ValidationResponse>(response);
    return toCamelCase(data);
  },

  async healthCheck(): Promise<{ status: string; version: string; scenariosLoaded: number }> {
    const response = await fetch(`${API_BASE}/health`);
    const data = await handleResponse<{
      status: string;
      version: string;
      scenarios_loaded: number;
    }>(response);
    return toCamelCase(data);
  },
};

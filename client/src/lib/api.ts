// API configuration and typed client
export const BASE = (import.meta.env.VITE_PICK_API ?? '').replace(/\/+$/, '');

export const endpoints = {
  health: `${BASE}/actuator/health`,
  optimize: `${BASE}/api/optimize`,
  layout: `${BASE}/api/layout`,
} as const;

export class ApiError extends Error {
  status?: number;
  code?: 'NETWORK' | 'TIMEOUT' | 'CORS' | 'HTTP' | 'CONFIG';
  
  constructor(message: string, options: Partial<Pick<ApiError, 'status' | 'code'>> = {}) {
    super(message);
    this.name = 'ApiError';
    Object.assign(this, options);
  }
}

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  components?: Record<string, { status: string }>;
}

export interface OptimizeRequest {
  skus: string[];
  strategy: string;
  constraints?: {
    maxCapacity?: number;
    maxTimeMinutes?: number;
    avoidBlockedZones?: boolean;
    allowAisleCrossing?: boolean;
  };
  weights?: {
    distanceWeight?: number;
    aisleCrossingPenalty?: number;
    turnPenalty?: number;
    blockedZonePenalty?: number;
  };
  startLocation?: string;
  endLocation?: string;
}

export interface OptimizeResponse {
  orderedStops: Array<{
    sequence: number;
    locationCode: string;
    sku: string | null;
    x: number;
    y: number;
    legDistance: number;
    cumulativeDistance: number;
  }>;
  totalDistance: number;
  strategy: string;
  executionTimeMs: number;
}

export async function postJSON<T>(
  url: string, 
  body: unknown, 
  options: { timeoutMs?: number } = {}
): Promise<T> {
  // Configuration validation
  if (!url.startsWith('http')) {
    throw new ApiError(
      'API base not configured. Set VITE_PICK_API environment variable.',
      { code: 'CONFIG' }
    );
  }
  
  // Mixed content protection
  if (location.protocol === 'https:' && url.startsWith('http://')) {
    throw new ApiError(
      'Mixed content blocked: HTTPS page cannot call HTTP API. Use HTTPS for API.',
      { code: 'CORS' }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      let message = `HTTP ${status}`;
      
      try {
        const errorData = await response.text();
        if (errorData) message += `: ${errorData}`;
      } catch {
        // Ignore parsing errors
      }
      
      throw new ApiError(message, { status, code: 'HTTP' });
    }

    return await response.json() as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Check your network connection and API server status.',
        { code: 'TIMEOUT' }
      );
    }
    
    if (error?.message?.includes('Failed to fetch')) {
      throw new ApiError(
        'Network error or CORS blocked. Verify API URL and CORS configuration.',
        { code: 'NETWORK' }
      );
    }
    
    // Re-throw ApiError instances and other errors
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Health check utility
export async function checkHealth(): Promise<{ status: 'UP' | 'DOWN'; error?: string }> {
  try {
    const health = await postJSON<HealthResponse>(endpoints.health, {});
    return { status: health.status };
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Unknown error';
    return { status: 'DOWN', error: message };
  }
}

// Optimize API call
export async function optimizeRoute(request: OptimizeRequest): Promise<OptimizeResponse> {
  return postJSON<OptimizeResponse>(endpoints.optimize, request);
}

// Error message helpers for UI
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

export function getErrorHint(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  
  switch (error.code) {
    case 'CONFIG':
      return 'Check environment variables in your deployment settings.';
    case 'CORS':
      return 'Ensure API server has CORS configured for your domain.';
    case 'NETWORK':
      return 'Check your internet connection and API server status.';
    case 'TIMEOUT':
      return 'API server may be slow. Try again or check server status.';
    case 'HTTP':
      return error.status === 404 
        ? 'API endpoint not found. Check API server version.' 
        : 'API server error. Contact support if this persists.';
    default:
      return null;
  }
}

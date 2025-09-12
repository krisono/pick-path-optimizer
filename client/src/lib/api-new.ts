// Production-grade API client with comprehensive error handling
export const BASE = (import.meta.env.VITE_PICK_API ?? '').replace(/\/+$/, '');

// Validate API configuration on load
if (!BASE) {
  console.warn('⚠️ VITE_PICK_API not configured. Using localhost fallback.');
}

// Prevent mixed content in production
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && BASE.startsWith('http:')) {
  throw new Error(`Mixed content error: Cannot use HTTP API (${BASE}) from HTTPS page. Update VITE_PICK_API to use HTTPS.`);
}

export const endpoints = {
  health: `${BASE}/actuator/health`,
  optimize: `${BASE}/api/optimize`,
  layout: `${BASE}/api/layout`,
} as const;

// Enhanced API Error class with detailed categorization
export class ApiError extends Error {
  status?: number;
  code: 'NETWORK' | 'TIMEOUT' | 'CORS' | 'HTTP' | 'CONFIG' | 'MIXED_CONTENT';
  endpoint?: string;
  
  constructor(message: string, options: Partial<Pick<ApiError, 'status' | 'code' | 'endpoint'>> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code ?? 'NETWORK';
    Object.assign(this, options);
  }
}

// Type definitions for API requests/responses
export interface OptimizeRequest {
  skus: string[];
  startLocation: string;
  endLocation: string;
  strategy: string;
  constraints: {
    maxCapacity: number;
    maxTimeMinutes: number;
    avoidBlockedZones: boolean;
    allowAisleCrossing: boolean;
  };
  weights: {
    distanceWeight: number;
    aisleCrossingPenalty: number;
    turnPenalty: number;
    blockedZonePenalty: number;
    capacityViolationPenalty: number;
  };
}

export interface OptimizeResponse {
  orderedStops: Array<{
    location: string;
    sku: string;
    legDistance: number;
    cumulativeDistance: number;
    estimatedTimeMinutes: number;
  }>;
  totalDistance: number;
  totalTime: number;
  strategy: string;
  metrics: {
    turnCount: number;
    aisleCrossings: number;
    efficiency: number;
  };
}

// Comprehensive error message generator
export function getErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'NETWORK':
      return `Failed to connect to API server${error.endpoint ? ` at ${error.endpoint}` : ''}`;
    case 'TIMEOUT':
      return 'Request timed out - the server is taking too long to respond';
    case 'CORS':
      return 'Cross-origin request blocked - API server needs CORS configuration';
    case 'HTTP':
      return `Server error (${error.status}): ${error.message}`;
    case 'CONFIG':
      return 'API configuration error - check VITE_PICK_API environment variable';
    case 'MIXED_CONTENT':
      return 'Mixed content error - cannot use HTTP API from HTTPS page';
    default:
      return error.message || 'An unexpected error occurred';
  }
}

// User-friendly troubleshooting hints
export function getErrorHint(error: ApiError): string[] {
  const hints: string[] = [];
  
  switch (error.code) {
    case 'NETWORK':
      hints.push('Check your internet connection');
      hints.push('Verify the API server is running');
      if (BASE) hints.push(`API URL: ${BASE}`);
      hints.push('Try refreshing the page');
      break;
    case 'TIMEOUT':
      hints.push('The server might be overloaded');
      hints.push('Try again in a few seconds');
      hints.push('Contact support if this persists');
      break;
    case 'CORS':
      hints.push('Contact the API administrator');
      hints.push('This domain needs to be added to CORS allowlist');
      break;
    case 'HTTP':
      if (error.status === 404) {
        hints.push('The API endpoint might have changed');
        hints.push('Check the API documentation');
      } else if (error.status === 500) {
        hints.push('Server encountered an internal error');
        hints.push('Try again later or contact support');
      }
      break;
    case 'CONFIG':
      hints.push('Set VITE_PICK_API in environment variables');
      hints.push('For development: http://localhost:8080');
      hints.push('For production: https://your-api-domain.com');
      break;
    case 'MIXED_CONTENT':
      hints.push('Update VITE_PICK_API to use HTTPS');
      hints.push('Ensure your API server supports HTTPS');
      break;
  }
  
  return hints;
}

// Robust HTTP client with timeout and error handling
export async function postJSON<T = any>(
  endpoint: string, 
  data: any,
  options: { timeout?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const { timeout = 12000 } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Use provided signal or our timeout signal
  const signal = options.signal || controller.signal;
  
  try {
    if (!BASE) {
      throw new ApiError('API base URL not configured', { 
        code: 'CONFIG',
        endpoint 
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
      cache: 'no-store', // Prevent caching for API calls
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, {
        code: 'HTTP',
        status: response.status,
        endpoint
      });
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network connection failed', {
        code: 'NETWORK',
        endpoint
      });
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out', {
        code: 'TIMEOUT',
        endpoint
      });
    }

    // CORS errors typically show as TypeError in browsers
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new ApiError('Cross-origin request blocked', {
        code: 'CORS',
        endpoint
      });
    }

    throw new ApiError(error.message || 'Request failed', {
      code: 'NETWORK',
      endpoint
    });
  }
}

// Health check with detailed status
export async function checkHealth(): Promise<{
  status: 'UP' | 'DOWN' | 'CHECKING';
  error?: string;
  responseTime?: number;
}> {
  if (!BASE) {
    return {
      status: 'DOWN',
      error: 'API not configured'
    };
  }

  try {
    const startTime = Date.now();
    const response = await fetch(endpoints.health, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5s timeout for health checks
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { status: 'UP', responseTime };
    } else {
      return { 
        status: 'DOWN', 
        error: `HTTP ${response.status}`,
        responseTime 
      };
    }
  } catch (error) {
    return {
      status: 'DOWN',
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

// Route optimization with comprehensive error handling
export async function optimizeRoute(request: OptimizeRequest): Promise<OptimizeResponse> {
  try {
    return await postJSON<OptimizeResponse>(endpoints.optimize, request);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Route optimization failed', {
      code: 'NETWORK',
      endpoint: endpoints.optimize
    });
  }
}

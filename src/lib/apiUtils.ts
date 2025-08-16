import { useEffect, useRef, useState } from 'react';

interface UseApiCallOptions<T> {
  url: string;
  dependencies?: unknown[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiCall<T>({ 
  url, 
  dependencies = [], 
  enabled = true,
  onSuccess,
  onError 
}: UseApiCallOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !url) {
      setData(null);
      setError(null);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortControllerRef.current!.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to abort request when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, enabled, onSuccess, onError, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

// Utility function to create a stable URL for API calls
export function createApiUrl(baseUrl: string, endpoint: string, params?: Record<string, string>) {
  const url = new URL(endpoint, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
}

// Utility function to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Utility function to get auth headers for axios
export function getAxiosAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Utility function to get auth headers for axios multipart requests
export function getAxiosMultipartAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'multipart/form-data',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Utility function for authenticated API calls
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  console.log("=== AUTHENTICATED FETCH STARTED ===");
  console.log("URL:", url);
  console.log("Options:", options);
  
  const headers = getAuthHeaders();
  console.log("Auth headers:", headers);
  
  console.log("Making fetch request...");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  console.log("Response received:", {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    console.log("Response not ok, status:", response.status);
    if (response.status === 401) {
      console.log("401 Unauthorized - redirecting to login");
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    console.log("Throwing HTTP error");
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log("=== AUTHENTICATED FETCH SUCCESS ===");
  return response;
}
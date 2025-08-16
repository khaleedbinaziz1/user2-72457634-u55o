'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiConfigContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  storeId: string | null;
  setStoreId: (id: string | null) => void;
  publicBaseUrl: string | null;
  buildPublicUrl: (path: string) => string | null;
}

interface ApiConfigProviderProps {
  children: ReactNode;
  apiId: number;
  storeId?: string;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

const API_BASE_URL_KEY = 'apiBaseUrl';
const API_ID_KEY = 'apiId';
const STORE_ID_KEY = 'storeId';

// API URL mapping - use environment variables for production
const apiUrlMapping: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500/',
  2: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500/',
  3: process.env.NEXT_PUBLIC_API_URL || 'https://oraginic.vercel.app/',
  4: process.env.NEXT_PUBLIC_API_URL || 'https://onno-server.vercel.app/',
  5: process.env.NEXT_PUBLIC_API_URL || 'https://alfredo-server.vercel.app/',
};

export const ApiConfigProvider = ({ children, apiId, storeId }: ApiConfigProviderProps) => {
  const selectedApiUrl = apiUrlMapping[apiId] || 'http://localhost:500/';
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(selectedApiUrl);
  const [storeIdState, setStoreIdState] = useState<string | null>(storeId || null);

  useEffect(() => {
    // Set the selected API URL and ID immediately
    console.log('Generated website API ID:', apiId);
    console.log('Generated website using API URL:', selectedApiUrl);
    console.log('Generated website Store ID:', storeId);
    setApiBaseUrlState(selectedApiUrl);
    localStorage.setItem(API_ID_KEY, apiId.toString());
    localStorage.setItem(API_BASE_URL_KEY, selectedApiUrl);
    
    // Set store ID if provided
    if (storeId) {
      setStoreIdState(storeId);
      localStorage.setItem(STORE_ID_KEY, storeId);
    }
  }, [apiId, selectedApiUrl, storeId]);

  const setApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    localStorage.setItem(API_BASE_URL_KEY, url);
  };

  const setStoreId = (id: string | null) => {
    setStoreIdState(id);
    if (id) {
      localStorage.setItem(STORE_ID_KEY, id);
    } else {
      localStorage.removeItem(STORE_ID_KEY);
    }
  };

  // Derived base URL for store-scoped public API
  const publicBaseUrl = storeIdState ? new URL(`/public/s/${storeIdState}/`, apiBaseUrl).toString() : null;

  const buildPublicUrl = (path: string) => {
    if (!publicBaseUrl) return null;
    return new URL(path.replace(/^\//, ''), publicBaseUrl).toString();
  };

  return (
    <ApiConfigContext.Provider value={{ 
      apiBaseUrl, 
      setApiBaseUrl, 
      storeId: storeIdState, 
      setStoreId,
      publicBaseUrl,
      buildPublicUrl
    }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return context;
};
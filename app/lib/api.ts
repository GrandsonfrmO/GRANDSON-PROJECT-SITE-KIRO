// Detect if we're on mobile
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Dynamically determine API URL based on current host
const getApiUrl = (): string => {
  // If explicitly set in environment, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, detect the current host
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If accessing via network IP, use the same IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // For mobile, try frontend API first, then backend
      if (isMobile()) {
        return `http://${hostname}:3000`; // Use frontend API for mobile
      }
      return `http://${hostname}:3001`;
    }
  }
  
  // Default to localhost
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('adminToken');
  const headers: HeadersInit = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Add mobile-specific headers
  if (isMobile()) {
    headers['X-Mobile-Request'] = 'true';
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }
  
  return headers;
};

// Helper to handle API errors with proper messages
const handleApiError = async (response: Response) => {
  let errorMessage = `API Error: ${response.statusText}`;
  try {
    const errorData = await response.json();
    if (errorData.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // If response is not JSON, use status text
  }
  throw new Error(errorMessage);
};

export const api = {
  get: async (endpoint: string, authenticated = false) => {
    const headers: HeadersInit = authenticated ? getAuthHeaders() : {};
    
    // Add mobile-specific headers for all requests
    if (isMobile()) {
      Object.assign(headers, {
        'X-Mobile-Request': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
    
    // Mobile-optimized fetch with longer timeout and retry
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), isMobile() ? 15000 : 5000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          console.log(`Attempt ${i + 1} failed:`, error);
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
      }
      throw new Error('All retry attempts failed');
    };
    
    const response = await fetchWithRetry(`${API_URL}${endpoint}`, { headers });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  post: async (endpoint: string, data: unknown, authenticated = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  put: async (endpoint: string, data: unknown, authenticated = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  delete: async (endpoint: string, authenticated = false) => {
    const headers: HeadersInit = authenticated ? getAuthHeaders() : {};
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  upload: async (endpoint: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 API Upload - URL:', `${API_URL}${endpoint}`);
    console.log('🌐 API Upload - Token:', token ? 'Présent' : 'Absent');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.log('🌐 API Upload - Status:', response.status, response.statusText);
    console.log('🌐 API Upload - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.log('🌐 API Upload - Erreur HTTP');
      await handleApiError(response);
    }
    
    const text = await response.text();
    console.log('🌐 API Upload - Raw response:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('🌐 API Upload - Parsed data:', data);
      return data;
    } catch (e) {
      console.error('🌐 API Upload - Parse error:', e);
      console.error('🌐 API Upload - Response was:', text);
      return {};
    }
  },
};

// Helper to get image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-product.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Helper to check backend health
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export default api;

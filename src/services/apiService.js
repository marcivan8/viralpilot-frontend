// Dynamically detect backend API URL
const getApiUrl = () => {
  // ✅ 1. Explicit environment variable takes priority
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // ✅ 2. Local development
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000'; // backend port
  }

  // ✅ 3. Default production fallback
  return 'https://clean-vp-backend-production.up.railway.app';
};

const API_BASE_URL = getApiUrl();
console.log('🔧 API Base URL:', API_BASE_URL);

class ApiService {
  static getAccessToken() {
    // Try multiple possible Supabase storage keys
    const possibleKeys = [
      'sb-cvlecctifgctrghlvnes-auth-token',
      'supabase.auth.token',
      'sb-auth-token'
    ];

    for (const key of possibleKeys) {
      const session = localStorage.getItem(key);
      if (session) {
        try {
          const data = JSON.parse(session);
          const token = data?.access_token || data?.currentSession?.access_token;
          if (token && token !== 'null' && token !== 'undefined') {
            console.log('🔑 Found access token via key:', key);
            return token;
          }
        } catch (err) {
          console.warn('❌ Failed to parse session from key:', key, err);
          continue;
        }
      }
    }

    console.warn('❌ No valid access token found in localStorage');
    return null;
  }

  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 Making request to:', url);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const token = this.getAccessToken();
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Using authorization token');
    } else {
      console.warn('⚠️ No token available for request');
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = {
            error: `HTTP Error: ${response.status} ${response.statusText}`,
            status: response.status
          };
        }

        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Request successful');
      return data;
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async analyzeVideo(formData, accessToken) {
    const url = `${API_BASE_URL}/api/analyze`;
    console.log('🎥 Uploading video to:', url);
    console.log('🔑 Using access token:', accessToken ? 'Yes' : 'No');

    if (!accessToken) {
      throw new Error('No access token available. Please sign in again.');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Note: Don't set Content-Type for FormData - browser sets it automatically with boundary
        },
        body: formData,
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = {
            error: `HTTP Error: ${response.status} ${response.statusText}`,
            status: response.status
          };
        }

        console.error('❌ Backend error:', errorData);

        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error(errorData.message || 'Monthly limit reached');
        } else if (response.status === 404) {
          throw new Error('User profile not found. Please complete registration.');
        } else if (response.status === 413) {
          throw new Error('File too large. Maximum size: 100MB');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status >= 500) {
          const serverError = errorData.error || errorData.message || 'Unknown server error';
          throw new Error(`Server Error (${response.status}): ${serverError}`);
        }

        throw new Error(errorData.error || errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      console.log('✅ Analysis successful');
      return data;
    } catch (error) {
      console.error('❌ analyzeVideo failed:', error);
      throw error;
    }
  }

  static async getUsage(accessToken) {
    console.log('📊 Fetching usage data...');
    return this.makeRequest('/api/auth/usage', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  static async getAnalysisHistory(accessToken, limit = 10, offset = 0) {
    console.log('📚 Fetching analysis history...');
    return this.makeRequest(`/api/auth/history?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  static async testConnection() {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend is reachable:', data);
      return { status: 'ok', data };
    } catch (error) {
      console.error('❌ Backend is NOT reachable:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Health check for the analyze endpoint
  static async testAnalyzeEndpoint() {
    try {
      console.log('🧪 Testing analyze endpoint...');
      const response = await fetch(`${API_BASE_URL}/api/analyze/health/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Analyze endpoint is healthy:', data);
      return { status: 'ok', data };
    } catch (error) {
      console.error('❌ Analyze endpoint is NOT healthy:', error);
      return { status: 'error', error: error.message };
    }
  }

}

// Run health checks on load
ApiService.testConnection();
ApiService.testAnalyzeEndpoint();

export default ApiService;
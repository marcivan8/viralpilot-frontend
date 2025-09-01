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
    // Try both possible Supabase storage keys
    const session =
      localStorage.getItem('sb-cvlecctifgctrghlvnes-auth-token') ||
      localStorage.getItem('supabase.auth.token');

    if (!session) return null;

    try {
      const data = JSON.parse(session);
      return data?.access_token || data?.currentSession?.access_token || null;
    } catch (err) {
      console.error('❌ Failed to parse stored session:', err);
      return null;
    }
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async analyzeVideo(formData, accessToken) {
    const url = `${API_BASE_URL}/api/analyze`;
    console.log('🎥 Uploading video to:', url);
    console.log('🔑 Using access token:', accessToken ? 'Yes' : 'No');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Note: Don't set Content-Type for FormData
        },
        body: formData,
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      console.log('✅ Analysis successful:', data);
      return data;
    } catch (error) {
      console.error('❌ analyzeVideo failed:', error);
      throw error;
    }
  }

  static async getUsage(accessToken) {
    return this.makeRequest('/api/auth/usage', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  static async createProfile(userId, email, fullName, accessToken) {
    return this.makeRequest('/api/auth/profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, email, fullName }),
    });
  }

  static async testConnection() {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('✅ Backend is reachable:', data);
      return true;
    } catch (error) {
      console.error('❌ Backend is NOT reachable:', error);
      return false;
    }
  }
}

// Run health check on load
ApiService.testConnection();

export default ApiService;

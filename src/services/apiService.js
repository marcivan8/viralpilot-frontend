// Detect environment and use correct port
const getApiUrl = () => {
  // Check if we have an explicit URL set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Auto-detect based on current location
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // IMPORTANT: Backend runs on port 3001, not 3000!
    return 'http://localhost:3001';
  }
  
  // Production URL - UPDATE THIS WITH YOUR ACTUAL BACKEND URL
  return 'https://clean-vp-backend-production.up.railway.app';
};

const API_BASE_URL = getApiUrl();
console.log('🔧 API Base URL:', API_BASE_URL);

class ApiService {
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 Making request to:', url);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Get token from session storage (Supabase stores it there)
    const session = localStorage.getItem('sb-cvlecctifgctrghlvnes-auth-token');
    let token = null;
    
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        token = sessionData?.access_token;
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }

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
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
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

  // Test connection function
  static async testConnection() {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('✅ Backend is reachable:', data);
      return true;
    } catch (error) {
      console.error('❌ Backend is NOT reachable:', error);
      console.error('Make sure your backend is running on port 3001');
      return false;
    }
  }
}

// Test connection on load
ApiService.testConnection();

export default ApiService;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Debug log
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

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('sb-access-token');
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
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData, // FormData, pas JSON
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
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        url: url
      });
      throw error;
    }
  }

  static async getAnalysisHistory(accessToken, limit = 10, offset = 0) {
    return this.makeRequest(`/api/analyze/history?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  static async getSubscriptionStatus(accessToken) {
    return this.makeRequest(`/api/subscription/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  static async createCheckout(planKey, accessToken) {
    return this.makeRequest(`/api/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ plan: planKey })
    });
  }

  static async createProfile(userId, email, fullName, accessToken) {
    return this.makeRequest('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ userId, email, fullName })
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
      return false;
    }
  }
}

// Test connection on load
ApiService.testConnection();

export default ApiService;
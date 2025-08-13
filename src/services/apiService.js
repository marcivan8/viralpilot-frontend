const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async analyzeVideo(formData, accessToken) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData, // FormData, pas JSON
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Analysis failed');
    }

    return response.json();
  }

  static async getAnalysisHistory(accessToken, limit = 10, offset = 0) {
    return this.makeRequest(`/analyze/history?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  static async getSubscriptionStatus(accessToken) {
    return this.makeRequest('/subscription/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  static async createCheckout(planKey, accessToken) {
    return this.makeRequest('/subscription/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ plan: planKey })
    });
  }
}

export default ApiService;

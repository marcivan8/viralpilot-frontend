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
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return mocked V2 response
    return {
      viralityScore: 88,
      bestPlatform: "TikTok",
      scores: {
        viralityScore: 88,
        hookScore: 92,
        pacingScore: 85,
        emotionScore: 78,
        storytellingScore: 82,
        clarityScore: 95
      },
      platformScores: {
        TikTok: 94,
        Reels: 88,
        Shorts: 82,
        YouTube: 75
      },
      retentionHeatmap: [
        { timestamp: 0, retention: 100 },
        { timestamp: 5, retention: 95 },
        { timestamp: 10, retention: 88 },
        { timestamp: 15, retention: 85 },
        { timestamp: 20, retention: 70 },
        { timestamp: 25, retention: 65 },
        { timestamp: 30, retention: 60 },
        { timestamp: 35, retention: 55 },
        { timestamp: 40, retention: 50 },
        { timestamp: 45, retention: 45 },
        { timestamp: 50, retention: 40 },
        { timestamp: 55, retention: 35 },
        { timestamp: 60, retention: 30 }
      ],
      suggestedHookRewrite: "🔥 Stop scrolling! You won't believe what happens next...",
      suggestedCTARewrite: "👇 Double tap if you agree and share with a friend!",
      suggestedEdits: "• Cut the silence at 0:12\n• Add zoom effect at 0:05\n• Use brighter color grading",
      thumbnailIdeas: "• Close-up of the reaction shot\n• Split screen with 'Before' and 'After' text",
      subtitleImprovements: "• Use yellow bold font for emphasis\n• Add emojis to key words",
      bestHighlights: [
        { start: 0, end: 5, score: 95, description: "Strong Hook" },
        { start: 15, end: 20, score: 88, description: "Emotional Peak" },
        { start: 40, end: 45, score: 82, description: "Unexpected Twist" }
      ]
    };
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
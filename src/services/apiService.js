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

  static async analyzeVideo(formData, accessToken, clientDuration) {
    const url = `${API_BASE_URL}/analyze`;
    console.log('🎥 Uploading video to:', url);
    console.log('🔑 Using access token:', accessToken ? 'Yes' : 'No');

    try {
      if (!accessToken) {
        console.warn('⚠️ No access token provided. Backend might reject request.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
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
        throw new Error(errorData.error || errorData.message || 'Analysis failed');
      }

      const rawData = await response.json();
      console.log('✅ Analysis successful (Raw):', rawData);

      // Transform backend data to match frontend expectations
      const transformedData = {
        viralityScore: rawData.viralityScore || 0,
        bestPlatform: rawData.bestPlatform || 'TikTok',
        scores: {
          viralityScore: rawData.viralityScore || 0,
          hookScore: rawData.details?.hook?.score || 0,
          pacingScore: rawData.details?.pacing?.score || 0,
          emotionScore: rawData.details?.emotion?.score || 0,
          storytellingScore: rawData.details?.structure?.score || 0,
          clarityScore: rawData.details?.structure?.score || 70, // Default or map from structure
        },
        platformScores: {
          TikTok: rawData.platformScores?.tiktok || 0,
          Reels: rawData.platformScores?.reels || 0,
          Shorts: rawData.platformScores?.shorts || 0,
          YouTube: rawData.platformScores?.youtube || 0,
        },
        // Generate dynamic retention heatmap based on duration and structure
        retentionHeatmap: (() => {
          if (rawData.retentionHeatmap) return rawData.retentionHeatmap;

          const duration = rawData.metadata?.duration || clientDuration || 60;
          const points = [];
          const interval = Math.max(1, Math.floor(duration / 10)); // ~10 points

          // Use structure analysis to shape the curve if available
          const introEnd = rawData.details?.structure?.sections?.intro?.end || duration * 0.15;
          const outroStart = rawData.details?.structure?.sections?.outro?.start || duration * 0.85;

          for (let t = 0; t <= duration; t += interval) {
            let retention = 100;

            if (t <= introEnd) {
              // Intro: Sharp drop then stabilize (Hook effect)
              // Drop from 100 to ~70-80 depending on hook score
              const hookScore = rawData.details?.hook?.score || 50;
              const dropRate = 100 - (hookScore / 2);
              const progress = t / introEnd;
              retention = 100 - (progress * (100 - dropRate));
            } else if (t >= outroStart) {
              // Outro: Drop off
              const progress = (t - outroStart) / (duration - outroStart);
              retention = 60 - (progress * 40);
            } else {
              // Body: Gradual decline
              const hookScore = rawData.details?.hook?.score || 50;
              const startRetention = 50 + (hookScore / 2);
              const bodyDuration = outroStart - introEnd;
              if (bodyDuration > 0) {
                const progress = (t - introEnd) / bodyDuration;
                retention = startRetention - (progress * 15);
              } else {
                retention = startRetention;
              }
            }

            retention += (Math.random() * 5) - 2.5;
            points.push({
              timestamp: Math.round(t),
              retention: Math.max(0, Math.min(100, Math.round(retention)))
            });
          }
          return points;
        })(),
        prediction: {
          views: rawData.prediction?.views || 0,
          viralityScore: rawData.prediction?.viralityScore || 0,
          assessment: rawData.prediction?.assessment || 'No assessment available',
        },
        suggestedHookRewrite: rawData.suggestions?.hookRewrite || '',
        suggestedCTARewrite: rawData.suggestions?.ctaRewrite || '',
        suggestedEdits: rawData.suggestions?.editingTips?.join('\n• ') || '',
        thumbnailIdeas: rawData.suggestions?.editingTips?.[0] || 'Use a high contrast close-up',

        // Only show if available from backend
        subtitleImprovements: rawData.suggestions?.subtitleImprovements || null,

        bestHighlights: (() => {
          // 1. Use existing backend highlights if available
          if (rawData.highlights && rawData.highlights.length > 0) {
            return rawData.highlights.map(h => ({
              start: h.start || 0,
              end: h.end || 0,
              score: h.score || 85,
              description: h.description || 'Viral Moment'
            }));
          }

          // 2. Fallback: Smart Generation using client duration
          const duration = rawData.metadata?.duration || clientDuration || 60;
          const structure = rawData.details?.structure?.sections || {};
          const generatedHighlights = [];

          // Debug duration usage
          console.log(`⏱ Using duration: ${duration}s for highlights generation`);

          // Highlight 1: The Hook
          generatedHighlights.push({
            start: 0,
            end: structure.intro?.end || Math.min(5, Math.ceil(duration * 0.1)),
            score: rawData.details?.hook?.score || 90,
            description: "🔥 The Hook: Crucial opening moments"
          });

          // Highlight 2: peak engagement point (often 60-70% through)
          // Or specifically where the 'climax' is if defined
          const climaxStart = structure.climax?.start || (duration * 0.6);
          const climaxEnd = structure.climax?.end || (climaxStart + 5);

          if (climaxStart < duration) {
            generatedHighlights.push({
              start: Math.floor(climaxStart),
              end: Math.min(duration, Math.floor(climaxEnd)),
              score: 88,
              description: "⚡ Peak Engagement: High intensity segment"
            });
          }

          // Highlight 3: Call to Action / Strong Finish
          const outroStart = structure.outro?.start || (duration * 0.9);
          if (outroStart < duration) {
            generatedHighlights.push({
              start: Math.floor(outroStart),
              end: Math.floor(duration),
              score: 85,
              description: "🎯 Strong Finish: Effective CTA placement"
            });
          }

          // Add Audio Peaks if available from backend (simulated check)
          if (rawData.audioAnalysis?.loudest_moment) {
            const peakTime = rawData.audioAnalysis.loudest_moment;
            // Check if we already covered this time
            const covered = generatedHighlights.some(h => peakTime >= h.start && peakTime <= h.end);
            if (!covered) {
              generatedHighlights.push({
                start: Math.max(0, peakTime - 2),
                end: Math.min(duration, peakTime + 3),
                score: 87,
                description: "🔊 Audio Peak: Loudest/most energetic moment"
              });
            }
          }

          return generatedHighlights.sort((a, b) => b.score - a.score).slice(0, 3);
        })() || []
      };

      console.log('✨ Transformed Data:', transformedData);
      return transformedData;

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
      const response = await fetch(`${API_BASE_URL}/analyze/health/check`, {
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
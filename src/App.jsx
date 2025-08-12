import React, { useState, useCallback, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { Upload, Play, Star, TrendingUp, Target, Zap, CheckCircle, AlertCircle, Globe, Crown, Sparkles, Shield, Database, LogOut, User, ArrowLeft } from "lucide-react";

// Supabase Configuration
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Backend API Configuration (for analysis, assuming backend handles GCS storage)
const API_CONFIG = {
  baseURL: 'https://clean-vp-backend-production.up.railway.app',
  endpoints: {
    analyze: '/analyze',
    subscription: '/subscription',
    history: '/analyze/history'
  }
};

// Auth Service using Supabase
const AuthService = {
  currentUser: null,
  
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.currentUser = data.user;
      localStorage.setItem('viral_pilot_session', JSON.stringify(data.session));
      localStorage.setItem('viral_pilot_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async signOut() {
    await supabase.auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('viral_pilot_session');
    localStorage.removeItem('viral_pilot_user');
  },
  
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const storedUser = localStorage.getItem('viral_pilot_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    
    return null;
  },
  
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
  
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};

// Analysis Service (assuming backend handles GCS upload and Supabase DB integration)
const AnalysisService = {
  async analyzeVideo(file, formData, aiConsent) {
    const session = await AuthService.getSession();
    if (!session) throw new Error('Not authenticated');
    
    const uploadData = new FormData();
    uploadData.append("video", file);
    uploadData.append("title", formData.title);
    uploadData.append("description", formData.description);
    uploadData.append("language", formData.language || "en");
    uploadData.append("ai_training_consent", aiConsent.toString());

    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.analyze}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`
      },
      body: uploadData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    return response.json();
  },
  
  async getHistory() {
    const session = await AuthService.getSession();
    if (!session) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.history}`, {
      headers: { "Authorization": `Bearer ${session.access_token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  }
};

// Translations (unchanged)
const translations = {
  en: {
    title: "Viral Pilot",
    subtitle: "AI-Powered Video Analysis for Maximum Virality",
    tagline: "Turn any video into viral content with AI insights",
    login: "Sign In",
    signup: "Sign Up",
    logout: "Sign Out",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    
    freePlan: "Free",
    proPlan: "Pro Creator",
    premiumPlan: "Premium Studio",
    enterprisePlan: "Enterprise",
    
    freeFeatures: "3 analyses/month • 2 platforms • Basic insights",
    proFeatures: "30 short + 1 long/month • All platforms • Advanced analytics",
    premiumFeatures: "Unlimited short + 5 long • Priority processing • Team collaboration",
    enterpriseFeatures: "Unlimited everything • API access • Custom integrations",
    
    videoTitle: "Video Title",
    videoTitlePlaceholder: "Enter a catchy title...",
    description: "Description", 
    descriptionPlaceholder: "Describe your video content...",
    videoFile: "Video File",
    selectVideo: "Select Video",
    changeVideo: "Change Video",
    analyzing: "Analyzing with AI...",
    
    aiConsentTitle: "🤖 Help improve our AI (Optional)",
    aiConsentText: "I agree to allow Viral Pilot to store and use my uploaded video(s) for improving its AI algorithms. I confirm that I have the necessary rights to this content.",
    aiConsentWith: "With consent: Videos stored securely for AI training",
    aiConsentWithout: "Without consent: Videos automatically deleted after 30 days",
    
    viralScore: "Viral Potential Score",
    bestPlatform: "Recommended Platform",
    platformScores: "Platform Scores", 
    insights: "AI Insights & Tips",
    analyzeAnother: "Analyze Another Video",
    
    upgradeNow: "Upgrade Now",
    startFree: "Start Free Trial",
    launchAnalysis: "Analyze with AI",
    
    TikTok: "TikTok",
    YouTube: "YouTube",
    YouTubeShorts: "YouTube Shorts",
    Instagram: "Instagram",
    X: "X (Twitter)",
    LinkedIn: "LinkedIn",
    
    exceptional: "🔥 Exceptional viral potential!",
    excellent: "🚀 Excellent viral potential!",
    good: "⭐ Good viral potential",
    moderate: "👍 Moderate viral potential",
    needsWork: "💪 Needs improvements",
    
    usageThisMonth: "Usage this month",
    analysesLeft: "analyses left",
    unlimited: "unlimited",
    upgradeToUnlock: "Upgrade to unlock more",
    
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    gdprCompliant: "GDPR Compliant"
  },
  fr: {
    title: "Viral Pilot",
    subtitle: "Analyse Vidéo IA pour une Viralité Maximale",
    tagline: "Transformez vos vidéos en contenu viral grâce à l'IA",
    login: "Se connecter",
    signup: "S'inscrire",
    logout: "Se déconnecter",
    email: "Email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    
    freePlan: "Gratuit",
    proPlan: "Pro Créateur", 
    premiumPlan: "Premium Studio",
    enterprisePlan: "Enterprise",
    
    freeFeatures: "3 analyses/mois • 2 plateformes • Insights de base",
    proFeatures: "30 courtes + 1 longue/mois • Toutes plateformes • Analytics avancées",
    premiumFeatures: "Courtes illimitées + 5 longues • Traitement prioritaire • Collaboration équipe",
    enterpriseFeatures: "Tout illimité • Accès API • Intégrations sur mesure",
    
    videoTitle: "Titre de la vidéo",
    videoTitlePlaceholder: "Entrez un titre accrocheur...",
    description: "Description",
    descriptionPlaceholder: "Décrivez le contenu de votre vidéo...",
    videoFile: "Fichier vidéo",
    selectVideo: "Sélectionner une vidéo",
    changeVideo: "Changer la vidéo",
    analyzing: "Analyse IA en cours...",
    
    aiConsentTitle: "🤖 Aider à améliorer notre IA (Optionnel)",
    aiConsentText: "J'accepte que Viral Pilot stocke et utilise mes vidéos pour améliorer ses algorithmes IA. Je confirme avoir les droits nécessaires sur ce contenu.",
    aiConsentWith: "Avec consentement : Vidéos stockées de manière sécurisée pour l'entraînement IA",
    aiConsentWithout: "Sans consentement : Vidéos automatiquement supprimées après 30 jours",
    
    viralScore: "Score de Potentiel Viral",
    bestPlatform: "Plateforme Recommandée",
    platformScores: "Scores par Plateforme",
    insights: "Insights IA & Conseils",
    analyzeAnother: "Analyser une autre vidéo",
    
    upgradeNow: "Passer Pro",
    startFree: "Essai Gratuit",
    launchAnalysis: "Analyser avec l'IA",
    
    TikTok: "TikTok",
    YouTube: "YouTube", 
    YouTubeShorts: "YouTube Shorts",
    Instagram: "Instagram",
    X: "X (Twitter)",
    LinkedIn: "LinkedIn",
    
    exceptional: "🔥 Potentiel viral exceptionnel !",
    excellent: "🚀 Excellent potentiel viral !",
    good: "⭐ Bon potentiel viral",
    moderate: "👍 Potentiel viral modéré",
    needsWork: "💪 Améliorations nécessaires",
    
    usageThisMonth: "Utilisation ce mois-ci",
    analysesLeft: "analyses restantes",
    unlimited: "illimité",
    upgradeToUnlock: "Passer Pro pour débloquer",
    
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions d'Utilisation",
    gdprCompliant: "Conforme RGPD"
  }
};

const PRICING_PLANS = {
  free: { 
    name: "Free", 
    price: 0, 
    monthly_analyses: 3, 
    platforms: 2,
    features: ["Basic AI scoring", "Platform recommendations", "Mobile app"],
    cta: "Start Free"
  },
  pro: { 
    name: "Pro Creator", 
    price: 29, 
    monthly_analyses: 30,
    long_form: 1,
    platforms: "all",
    features: ["Advanced AI analytics", "Competitor benchmarking", "Export reports", "Optimal timing", "A/B testing suggestions", "Email support"],
    cta: "Upgrade to Pro",
    popular: true
  },
  premium: { 
    name: "Premium Studio", 
    price: 79,
    monthly_analyses: "unlimited",
    long_form: 5, 
    platforms: "all",
    features: ["All Pro features", "Priority processing (<30s)", "Team collaboration (3 users)", "Custom integrations", "Phone support", "Advanced trend insights"],
    cta: "Go Premium"
  }
};

// Composant de consentement IA (modernisé)
const AITrainingConsent = ({ consent, setConsent, language }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  return (
    <div className="bg-gray-100 border border-gray-300 p-4 rounded-md mb-4">
      <div className="flex items-start gap-3">
        <input
          id="ai-training-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div>
          <label htmlFor="ai-training-consent" className="font-medium text-gray-900 cursor-pointer">
            {t('aiConsentTitle')}
          </label>
          <p className="text-sm text-gray-600 mt-1">
            {t('aiConsentText')}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-gray-500" />
              <span>{t('aiConsentWith')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-gray-500" />
              <span>{t('aiConsentWithout')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant d'usage et limites (modernisé)
const UsageDisplay = ({ user, language }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  if (!user) return null;
  
  const usage = user.monthly_usage || { analyses: 0, long_form: 0 };
  const tier = user.user_metadata?.subscription_tier || 'free'; // Adapted for Supabase user metadata
  const limits = {
    free: { monthly_analyses: 3, long_form: 0 },
    pro: { monthly_analyses: 30, long_form: 1 },
    premium: { monthly_analyses: 999999, long_form: 5 }
  };
  
  const userLimits = limits[tier] || limits.free;
  const analysesLeft = Math.max(0, userLimits.monthly_analyses - usage.analyses);
  
  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('usageThisMonth')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {usage.analyses}/{userLimits.monthly_analyses === 999999 ? t('unlimited') : userLimits.monthly_analyses}
          </div>
          <div className="text-xs text-gray-500">
            {analysesLeft} {t('analysesLeft')}
          </div>
        </div>
      </div>
      
      {tier === 'free' && analysesLeft <= 1 && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
          {t('upgradeToUnlock')}
        </div>
      )}
    </div>
  );
};

// Composant d'authentification (modernisé)
const AuthModal = ({ show, isLogin, setIsLogin, authData, setAuthData, onSubmit, loading, error, onClose, language }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin ? t('login') : t('signup')}
          </h2>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={authData.fullName}
                onChange={(e) => setAuthData({...authData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              value={authData.email}
              onChange={(e) => setAuthData({...authData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              value={authData.password}
              onChange={(e) => setAuthData({...authData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm">
              {error.message || error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? t('login') : t('signup'))}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ViralPilotApp() {
  // États principaux
  const [currentPage, setCurrentPage] = useState("landing");
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("free");
  
  // États d'authentification
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ email: "", password: "", fullName: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // États d'analyse
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [aiConsent, setAiConsent] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const t = (key) => translations[language][key] || translations.en[key] || key;

  // Initialisation avec Supabase
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Écouter les changements d'auth Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('viral_pilot_session', JSON.stringify(session));
        localStorage.setItem('viral_pilot_user', JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem('viral_pilot_session');
        localStorage.removeItem('viral_pilot_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Gestion de l'authentification avec Supabase
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      if (isLogin) {
        const result = await AuthService.signIn(authData.email, authData.password);
        setUser(result.user);
        setShowAuth(false);
        setCurrentPage("upload");
      } else {
        const result = await AuthService.signUp(authData.email, authData.password, authData.fullName);
        if (result.user) {
          alert("Account created! Please check your email to confirm, then sign in.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      setAuthError(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setCurrentPage("landing");
    setUploadedVideo(null);
    setAnalysisResults(null);
  };

  // Analyse vidéo
  const analyzeVideo = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    if (!uploadedVideo || !formData.title || !formData.description) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 12, 85));
    }, 500);

    try {
      const results = await AnalysisService.analyzeVideo(uploadedVideo, formData, aiConsent);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResults(results);
      setCurrentPage("results");
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [uploadedVideo, formData, aiConsent, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        setError("File too large. Maximum size: 100MB");
        return;
      }
      setUploadedVideo(file);
      setError(null);
    } else {
      setError("Please select a valid video file");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600"; 
    if (score >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score) => {
    if (score >= 85) return t('exceptional');
    if (score >= 70) return t('excellent');
    if (score >= 55) return t('good');
    if (score >= 40) return t('moderate');
    return t('needsWork');
  };

  // Landing Page (design modernisé: plus clean, tons neutres avec accents indigo)
  const LandingPage = () => (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="en">🇺🇸 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-all"
            >
              {t('login')}
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            {t('subtitle')}
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('tagline')}. Analyze any video and get AI-powered recommendations for TikTok, YouTube, Instagram, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={() => user ? setCurrentPage("upload") : setShowAuth(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all shadow-md"
            >
              {user ? "Analyze Your Video" : "Start Free - No Credit Card"}
            </button>
            <button 
              onClick={() => setCurrentPage("pricing")}
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-md font-medium hover:bg-indigo-50 transition-all"
            >
              View Pricing
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
              <Target className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 text-sm">Advanced algorithms analyze your content across multiple platforms simultaneously</p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
              <TrendingUp className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">Viral Insights</h3>
              <p className="text-gray-600 text-sm">Get specific, actionable recommendations to maximize your viral potential</p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
              <Sparkles className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">Multi-Platform</h3>
              <p className="text-gray-600 text-sm">Optimize for TikTok, YouTube, Instagram, LinkedIn, and X simultaneously</p>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-xs text-gray-600">{t('gdprCompliant')}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Globe className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-xs text-gray-600">EU-Hosted Servers</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Database className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-xs text-gray-600">Secure Data</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Crown className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-xs text-gray-600">Premium AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="flex justify-center space-x-4 mb-4">
          <a href="/privacy" className="hover:text-gray-900">{t('privacyPolicy')}</a>
          <a href="/terms" className="hover:text-gray-900">{t('termsOfService')}</a>
        </div>
        <p>© 2025 Viral Pilot. All rights reserved.</p>
      </footer>
    </div>
  );

  // Pricing Page (modernisé)
  const PricingPage = () => (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="en">🇺🇸 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-all"
            >
              {t('login')}
            </button>
          )}
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <div 
              key={key}
              className={`bg-white p-8 rounded-md border ${plan.popular ? 'border-indigo-500 shadow-md' : 'border-gray-200'} relative`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-4 bg-indigo-500 text-white px-3 py-1 rounded-b-md text-sm font-medium">Popular</span>
              )}
              <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
              <div className="text-3xl font-bold mb-2">${plan.price}<span className="text-lg text-gray-500">/mo</span></div>
              <p className="text-gray-600 mb-6">{plan.monthly_analyses} analyses/month</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setSelectedPlan(key);
                  // TODO: Integrate payment (e.g., Paddle or Stripe via backend)
                  alert(`Upgrading to ${plan.name} plan! (Integration pending)`);
                }}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-all"
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="flex justify-center space-x-4 mb-4">
          <a href="/privacy" className="hover:text-gray-900">{t('privacyPolicy')}</a>
          <a href="/terms" className="hover:text-gray-900">{t('termsOfService')}</a>
        </div>
        <p>© 2025 Viral Pilot. All rights reserved.</p>
      </footer>
    </div>
  );

  // Upload Page (modernisé)
  const UploadPage = () => (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="en">🇺🇸 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="container mx-auto px-6 py-20 max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-8">Upload Your Video</h2>
        
        <UsageDisplay user={user} language={language} />
        
        <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('videoTitle')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t('videoTitlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">{t('videoFile')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500">
                    {uploadedVideo ? uploadedVideo.name : t('selectVideo')}
                  </span>
                </label>
              </div>
            </div>
            
            <AITrainingConsent consent={aiConsent} setConsent={setAiConsent} language={language} />
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            
            <button 
              type="button"
              onClick={analyzeVideo}
              disabled={isAnalyzing || !uploadedVideo || !formData.title || !formData.description}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? `${t('analyzing')} (${analysisProgress}%)` : t('launchAnalysis')}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="flex justify-center space-x-4 mb-4">
          <a href="/privacy" className="hover:text-gray-900">{t('privacyPolicy')}</a>
          <a href="/terms" className="hover:text-gray-900">{t('termsOfService')}</a>
        </div>
        <p>© 2025 Viral Pilot. All rights reserved.</p>
      </footer>
    </div>
  );

  // Results Page (modernisé)
  const ResultsPage = () => {
    if (!analysisResults) return null;

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </header>

        {/* Results Section */}
        <section className="container mx-auto px-6 py-20 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Analysis Results</h2>
            <button 
              onClick={() => setCurrentPage("upload")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Viral Score */}
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold mb-4">{t('viralScore')}</h3>
              <div className={`text-5xl font-bold ${getScoreColor(analysisResults.viralityScore)}`}>
                {analysisResults.viralityScore}
              </div>
              <p className="text-base mt-2 text-gray-600">{getScoreMessage(analysisResults.viralityScore)}</p>
            </div>
            
            {/* Best Platform */}
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold mb-4">{t('bestPlatform')}</h3>
              <div className="text-3xl font-semibold text-indigo-600">{t(analysisResults.bestPlatform)}</div>
              <p className="text-gray-600 mt-2 text-sm">Highest viral potential here</p>
            </div>
          </div>
          
          {/* Platform Scores */}
          <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('platformScores')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(analysisResults.platformScores).map(([platform, score]) => (
                <div key={platform} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="font-medium text-gray-700">{t(platform)}</span>
                  <span className={`font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Insights */}
          <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('insights')}</h3>
            <ul className="space-y-3">
              {analysisResults.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => {
              setCurrentPage("upload");
              setUploadedVideo(null);
              setFormData({ title: "", description: "" });
              setAiConsent(false);
            }}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all"
          >
            {t('analyzeAnother')}
          </button>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <div className="flex justify-center space-x-4 mb-4">
            <a href="/privacy" className="hover:text-gray-900">{t('privacyPolicy')}</a>
            <a href="/terms" className="hover:text-gray-900">{t('termsOfService')}</a>
          </div>
          <p>© 2025 Viral Pilot. All rights reserved.</p>
        </footer>
      </div>
    );
  };

  return (
    <>
      {currentPage === "landing" && <LandingPage />}
      {currentPage === "pricing" && <PricingPage />}
      {currentPage === "upload" && <UploadPage />}
      {currentPage === "results" && <ResultsPage />}
      
      <AuthModal 
        show={showAuth}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        authData={authData}
        setAuthData={setAuthData}
        onSubmit={handleAuth}
        loading={authLoading}
        error={authError}
        onClose={() => setShowAuth(false)}
        language={language}
      />
    </>
  );
}
// ===== src/App.jsx =====
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useAnalysis } from "./hooks/useAnalysis";
import Layout from "./components/Layout";
import Logo from "./components/Logo";
import { 
  Upload, Star, TrendingUp, Target, CheckCircle, AlertCircle, 
  Shield, Database, ArrowLeft, Crown, Sparkles 
} from "lucide-react";

// Traductions
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
    fullName: "Full Name",
    forgotPassword: "Forgot Password?",
    
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
    
    launchAnalysis: "Analyze with AI",
    startFree: "Start Free - No Credit Card",
    viewPricing: "View Pricing",
    
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
    
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    createAccount: "Create your account",
    welcomeBack: "Welcome back",
    
    freePlan: "Free",
    proPlan: "Pro Creator",
    premiumPlan: "Premium Studio"
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
    fullName: "Nom complet",
    forgotPassword: "Mot de passe oublié ?",
    
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
    
    launchAnalysis: "Analyser avec l'IA",
    startFree: "Commencer Gratuitement",
    viewPricing: "Voir les Tarifs",
    
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
    
    noAccount: "Pas de compte ?",
    haveAccount: "Vous avez déjà un compte ?",
    createAccount: "Créez votre compte",
    welcomeBack: "Bon retour",
    
    freePlan: "Gratuit",
    proPlan: "Pro Créateur", 
    premiumPlan: "Premium Studio"
  }
};

// Plans de pricing
const PRICING_PLANS = {
  free: { 
    name: "Free", 
    price: 0, 
    monthly_analyses: 3, 
    features: ["Basic AI scoring", "Platform recommendations", "Mobile friendly"],
    cta: "Start Free"
  },
  pro: { 
    name: "Pro Creator", 
    price: 29, 
    monthly_analyses: 30,
    long_form: 1,
    features: ["Advanced AI analytics", "Competitor insights", "Export reports", "Priority support"],
    cta: "Upgrade to Pro",
    popular: true
  },
  premium: { 
    name: "Premium Studio", 
    price: 79,
    monthly_analyses: "unlimited",
    long_form: 5, 
    features: ["All Pro features", "Priority processing", "Team collaboration", "Custom integrations"],
    cta: "Go Premium"
  }
};

// Composants

const AITrainingConsent = ({ consent, setConsent, language }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
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
              <Shield className="w-3 h-3 text-green-500" />
              <span>{t('aiConsentWith')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-500" />
              <span>{t('aiConsentWithout')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsageDisplay = ({ language }) => {
  const { user } = useAuth();
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  if (!user) return null;
  
  // Mock data - remplacez par les vraies données depuis votre API
  const usage = { analyses: 1, long_form: 0 };
  const tier = 'free';
  const limits = {
    free: { monthly_analyses: 3, long_form: 0 },
    pro: { monthly_analyses: 30, long_form: 1 },
    premium: { monthly_analyses: 999999, long_form: 5 }
  };
  
  const userLimits = limits[tier] || limits.free;
  const analysesLeft = Math.max(0, userLimits.monthly_analyses - usage.analyses);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
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
        <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
          <Crown className="w-4 h-4 inline mr-1" />
          Upgrade to Pro for unlimited analyses
        </div>
      )}
    </div>
  );
};

const AuthModal = ({ show, onClose, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn, signUp } = useAuth();
  
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  if (!show) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        onClose();
      } else {
        const result = await signUp(formData.email, formData.password, formData.fullName);
        if (result.user && !result.user.email_confirmed_at) {
          alert("Account created! Please check your email to confirm, then sign in.");
          setIsLogin(true);
          setFormData({ email: formData.email, password: "", fullName: "" });
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || (isLogin ? 'Sign in failed' : 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? t('login') : t('signup'))}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            {isLogin ? t('noAccount') : t('haveAccount')} {' '}
            <span className="font-medium">
              {isLogin ? t('signup') : t('login')}
            </span>
          </button>
        </div>
        
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Pages principales

const LandingPage = ({ language, onShowAuth, onNavigate }) => {
  const { user } = useAuth();
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  return (
    <div className="bg-gray-50">
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
              onClick={() => user ? onNavigate('upload') : onShowAuth()}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all shadow-md"
            >
              {user ? "Analyze Your Video" : t('startFree')}
            </button>
            <button 
              onClick={() => onNavigate('pricing')}
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-md font-medium hover:bg-indigo-50 transition-all"
            >
              {t('viewPricing')}
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Target className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 text-sm">Advanced algorithms analyze your content across multiple platforms simultaneously</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <TrendingUp className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">Viral Insights</h3>
              <p className="text-gray-600 text-sm">Get specific, actionable recommendations to maximize your viral potential</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Sparkles className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3">Multi-Platform</h3>
              <p className="text-gray-600 text-sm">Optimize for TikTok, YouTube, Instagram, LinkedIn, and X simultaneously</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const PricingPage = ({ language, onNavigate }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;

  return (
    <div className="bg-gray-50">
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600">Start free, upgrade when you need more power</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <div 
              key={key}
              className={`bg-white p-8 rounded-lg border ${
                plan.popular ? 'border-indigo-500 shadow-lg relative' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">
                  ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                </div>
                <p className="text-gray-600">
                  {typeof plan.monthly_analyses === 'number' 
                    ? `${plan.monthly_analyses} analyses/month`
                    : `${plan.monthly_analyses} analyses`
                  }
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => {
                  if (key === 'free') {
                    onNavigate('upload');
                  } else {
                    alert(`Upgrading to ${plan.name} plan! (Payment integration coming soon)`);
                  }
                }}
                className={`w-full px-4 py-2 rounded-md font-medium transition-all ${
                  plan.popular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => onNavigate('landing')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </section>
    </div>
  );
};

const UploadPage = ({ language, onNavigate }) => {
  const [formData, setFormData] = useState({ title: "", description: "", language: language });
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [aiConsent, setAiConsent] = useState(false);
  const { analyzeVideo, isAnalyzing, progress, error } = useAnalysis();
  const { user } = useAuth();
  
  const t = (key) => translations[language][key] || translations.en[key] || key;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        alert("File too large. Maximum size: 100MB");
        return;
      }
      setUploadedVideo(file);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedVideo || !formData.title || !formData.description) {
      alert("Please fill all fields and select a video");
      return;
    }
    
    try {
      const results = await analyzeVideo(uploadedVideo, formData, aiConsent);
      onNavigate('results', results);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Please sign in to continue</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to analyze videos.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <section className="container mx-auto px-6 py-20 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Upload Your Video</h2>
          <p className="text-gray-600">Get AI-powered insights to maximize your viral potential</p>
        </div>
        
        <UsageDisplay language={language} />
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('videoTitle')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t('videoTitlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('videoFile')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                    {uploadedVideo ? uploadedVideo.name : t('selectVideo')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 100MB</p>
                </label>
              </div>
            </div>
            
            <AITrainingConsent consent={aiConsent} setConsent={setAiConsent} language={language} />
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <button 
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !uploadedVideo || !formData.title || !formData.description}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing 
                ? `${t('analyzing')} ${progress > 0 ? `(${progress}%)` : ''}` 
                : t('launchAnalysis')
              }
            </button>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => onNavigate('landing')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </section>
    </div>
  );
};

const ResultsPage = ({ language, onNavigate, results }) => {
  const t = (key) => translations[language][key] || translations.en[key] || key;
  
  if (!results) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">No results available</h2>
        <button 
          onClick={() => onNavigate('upload')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Analyze a Video
        </button>
      </div>
    );
  }

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

  return (
    <div className="bg-gray-50">
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Analysis Results</h2>
          <button 
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze Another
          </button>
        </div>
        
        {/* Score Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-4">{t('viralScore')}</h3>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(results.viralityScore)}`}>
              {results.viralityScore}
            </div>
            <p className="text-sm text-gray-600">{getScoreMessage(results.viralityScore)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-4">{t('bestPlatform')}</h3>
            <div className="text-2xl font-semibold text-indigo-600 mb-2">
              {t(results.bestPlatform)}
            </div>
            <p className="text-sm text-gray-600">Highest viral potential here</p>
          </div>
        </div>
        
        {/* Platform Scores */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">{t('platformScores')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.platformScores || {}).map(([platform, score]) => (
              <div key={platform} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-700">{t(platform)}</span>
                <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Insights */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('insights')}</h3>
          <div className="space-y-3">
            {(results.insights || []).map((insight, i) => (
              <div key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// App principal

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("landing");
  const [language, setLanguage] = useState("en");
  const [showAuth, setShowAuth] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const { user, loading } = useAuth();

  const handleNavigate = (page, data = null) => {
    if (page === 'results') {
      setAnalysisResults(data);
    }
    setCurrentPage(page);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      language={language} 
      setLanguage={setLanguage} 
      onAuthClick={handleShowAuth}
    >
      {currentPage === "landing" && (
        <LandingPage 
          language={language} 
          onShowAuth={handleShowAuth} 
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === "pricing" && (
        <PricingPage 
          language={language} 
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === "upload" && (
        <UploadPage 
          language={language} 
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === "results" && (
        <ResultsPage 
          language={language} 
          onNavigate={handleNavigate}
          results={analysisResults}
        />
      )}
      
      <AuthModal 
        show={showAuth}
        onClose={handleCloseAuth}
        language={language}
      />
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
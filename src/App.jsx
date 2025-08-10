import React, { useState, useCallback } from "react";

// Dictionnaire de traductions complet
const translations = {
  en: {
    title: "📱 Video Analyzer",
    subtitle: "Discover the viral potential of your content",
    videoTitle: "📝 Video Title *",
    videoTitlePlaceholder: "Enter a catchy title...",
    description: "📄 Description *",
    descriptionPlaceholder: "Describe your video in detail...",
    videoFile: "🎥 Video File *",
    selectVideo: "Select a video",
    changeVideo: "Change video",
    fileInfo: "MP4, MOV, AVI, etc. (Max 100MB)",
    preview: "📹 Preview",
    fillAllFields: "Please fill in all fields",
    launchAnalysis: "🚀 Launch Analysis",
    analyzing: "Analyzing...",
    analysisInProgress: "Analysis in progress...",
    error: "Error",
    fileTooLarge: "File must be less than 100MB",
    invalidFileType: "Please select a valid video file",
    analysisComplete: "🎉 Analysis Complete!",
    recommendedPlatform: "🏆 Recommended Platform",
    platformScores: "📊 Platform Scores",
    recommended: "⭐ RECOMMENDED",
    improvementTips: "💡 Tips to Improve Virality",
    analysisDetails: "📈 Analysis Details",
    words: "Words",
    duration: "Duration",
    analyzeAnother: "🎬 Analyze Another Video",
    noDataAvailable: "No analysis data available",
    noScoresAvailable: "No scores available",
    noSpecificSuggestions: "No specific suggestions available",
    serverError: "Server error",
    unexpectedError: "Unexpected error during analysis",
    back: "Back",
    exceptionalViral: "Exceptional viral potential!",
    excellentViral: "Excellent viral potential!",
    goodViral: "Good viral potential",
    correctViral: "Correct viral potential",
    moderateViral: "Moderate viral potential",
    improvementsNeeded: "Improvements needed",
    // Traductions des plateformes
    TikTok: "TikTok",
    YouTube: "YouTube", 
    Instagram: "Instagram",
    Twitter: "Twitter",
    Facebook: "Facebook",
    LinkedIn: "LinkedIn",
    Snapchat: "Snapchat",
    "YouTube Shorts": "YouTube Shorts",
    "Instagram Reels": "Instagram Reels",
    undetermined: "Undetermined"
  },
  fr: {
    title: "📱 Analyseur Vidéo",
    subtitle: "Découvrez le potentiel viral de votre contenu",
    videoTitle: "📝 Titre de la vidéo *",
    videoTitlePlaceholder: "Entrez un titre accrocheur...",
    description: "📄 Description *",
    descriptionPlaceholder: "Décrivez votre vidéo en détail...",
    videoFile: "🎥 Fichier vidéo *",
    selectVideo: "Sélectionner une vidéo",
    changeVideo: "Changer la vidéo",
    fileInfo: "MP4, MOV, AVI, etc. (Max 100Mo)",
    preview: "📹 Aperçu",
    fillAllFields: "Veuillez remplir tous les champs",
    launchAnalysis: "🚀 Lancer l'analyse",
    analyzing: "Analyse en cours...",
    analysisInProgress: "Analyse en cours...",
    error: "Erreur",
    fileTooLarge: "Le fichier doit faire moins de 100Mo",
    invalidFileType: "Veuillez sélectionner un fichier vidéo valide",
    analysisComplete: "🎉 Analyse Terminée !",
    recommendedPlatform: "🏆 Plateforme Recommandée",
    platformScores: "📊 Scores par Plateforme",
    recommended: "⭐ RECOMMANDÉ",
    improvementTips: "💡 Conseils pour Améliorer la Viralité",
    analysisDetails: "📈 Détails de l'analyse",
    words: "Mots",
    duration: "Durée",
    analyzeAnother: "🎬 Analyser une autre vidéo",
    noDataAvailable: "Aucune donnée d'analyse disponible",
    noScoresAvailable: "Aucun score disponible",
    noSpecificSuggestions: "Aucune suggestion spécifique disponible",
    serverError: "Erreur serveur",
    unexpectedError: "Erreur inattendue lors de l'analyse",
    back: "Retour",
    exceptionalViral: "Potentiel viral exceptionnel !",
    excellentViral: "Excellent potentiel viral !",
    goodViral: "Bon potentiel viral",
    correctViral: "Potentiel viral correct",
    moderateViral: "Potentiel viral modéré",
    improvementsNeeded: "Améliorations nécessaires",
    // Traductions des plateformes
    TikTok: "TikTok",
    YouTube: "YouTube",
    Instagram: "Instagram", 
    Twitter: "Twitter",
    Facebook: "Facebook",
    LinkedIn: "LinkedIn",
    Snapchat: "Snapchat",
    "YouTube Shorts": "YouTube Shorts",
    "Instagram Reels": "Instagram Reels",
    undetermined: "Non déterminé"
  },
  tr: {
    title: "📱 Video Analizörü",
    subtitle: "İçeriğinizin viral potansiyelini keşfedin",
    videoTitle: "📝 Video Başlığı *",
    videoTitlePlaceholder: "Dikkat çekici bir başlık girin...",
    description: "📄 Açıklama *",
    descriptionPlaceholder: "Videonuzu detaylı olarak açıklayın...",
    videoFile: "🎥 Video Dosyası *",
    selectVideo: "Bir video seçin",
    changeVideo: "Video değiştir",
    fileInfo: "MP4, MOV, AVI, vb. (Maks 100MB)",
    preview: "📹 Önizleme",
    fillAllFields: "Lütfen tüm alanları doldurun",
    launchAnalysis: "🚀 Analizi Başlat",
    analyzing: "Analiz ediliyor...",
    analysisInProgress: "Analiz devam ediyor...",
    error: "Hata",
    fileTooLarge: "Dosya 100MB'dan küçük olmalı",
    invalidFileType: "Lütfen geçerli bir video dosyası seçin",
    analysisComplete: "🎉 Analiz Tamamlandı!",
    recommendedPlatform: "🏆 Önerilen Platform",
    platformScores: "📊 Platform Puanları",
    recommended: "⭐ ÖNERİLEN",
    improvementTips: "💡 Viral Potansiyeli Artırma İpuçları",
    analysisDetails: "📈 Analiz Detayları",
    words: "Kelimeler",
    duration: "Süre",
    analyzeAnother: "🎬 Başka Video Analiz Et",
    noDataAvailable: "Analiz verisi mevcut değil",
    noScoresAvailable: "Puan mevcut değil",
    noSpecificSuggestions: "Özel öneri mevcut değil",
    serverError: "Sunucu hatası",
    unexpectedError: "Analiz sırasında beklenmeyen hata",
    back: "Geri",
    exceptionalViral: "Olağanüstü viral potansiyel!",
    excellentViral: "Mükemmel viral potansiyel!",
    goodViral: "İyi viral potansiyel",
    correctViral: "Doğru viral potansiyel",
    moderateViral: "Orta viral potansiyel",
    improvementsNeeded: "İyileştirmeler gerekli",
    // Traductions des plateformes
    TikTok: "TikTok",
    YouTube: "YouTube",
    Instagram: "Instagram",
    Twitter: "Twitter", 
    Facebook: "Facebook",
    LinkedIn: "LinkedIn",
    Snapchat: "Snapchat",
    "YouTube Shorts": "YouTube Shorts",
    "Instagram Reels": "Instagram Reels",
    undetermined: "Belirsiz"
  }
};

export default function App() {
  const [page, setPage] = useState("upload");
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [language, setLanguage] = useState("en");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const BACKEND_URL = "https://clean-vp-backend-production.up.railway.app";

  // Fonction pour obtenir les traductions
  const t = (key) => translations[language][key] || translations.en[key] || key;

  // Validation des entrées
  const isFormValid = title.trim() && description.trim() && uploadedVideo;

  const analyzeVideo = useCallback(async (file) => {
    if (!file || !isFormValid) return;

    console.log("🚀 Début analyse - fichier:", file.name);
    setUploading(true);
    setError(null);
    setAnalysisResults(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);

      console.log("📤 Envoi requête vers:", `${BACKEND_URL}/analyze`);

      // Simulation du progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error(`${t('serverError')}: ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error(t('unexpectedError'));
      }

      setAnalysisResults(data);
      setPage("results");
      
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      setError(err.message || t('unexpectedError'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [title, description, isFormValid, language]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError(t('fileTooLarge'));
        return;
      }
      
      if (!file.type.startsWith('video/')) {
        setError(t('invalidFileType'));
        return;
      }

      setUploadedVideo(file);
      setError(null);
    }
  }, [language]);

  const reset = useCallback(() => {
    setPage("upload");
    setUploadedVideo(null);
    setAnalysisResults(null);
    setError(null);
    setTitle("");
    setDescription("");
    setUploadProgress(0);
  }, []);

  const getScoreEmoji = (score) => {
    if (score >= 90) return "🔥";
    if (score >= 80) return "🚀";
    if (score >= 70) return "⭐";
    if (score >= 60) return "👍";
    if (score >= 50) return "👌";
    return "💪";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return t('exceptionalViral');
    if (score >= 80) return t('excellentViral');
    if (score >= 70) return t('goodViral');
    if (score >= 60) return t('correctViral');
    if (score >= 50) return t('moderateViral');
    return t('improvementsNeeded');
  };

  // Fonction pour traduire les noms de plateformes
  const translatePlatform = (platform) => {
    return t(platform) || platform;
  };

  function AnalysisResults({ analysis }) {
    if (!analysis) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">⚠️ {t('noDataAvailable')}</div>
          <button
            onClick={reset}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('back')}
          </button>
        </div>
      );
    }

    const ScoreBar = ({ score, platform, isSelected = false }) => (
      <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-500 ${
        isSelected 
          ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
          : 'bg-white backdrop-blur-sm hover:bg-gray-50 border border-gray-200 hover:shadow-md'
      }`}>
        <div className="flex items-center space-x-3">
          <span className={`font-semibold text-lg ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
            {translatePlatform(platform)}
          </span>
          {isSelected && (
            <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-bold">
              {t('recommended')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                score >= 40 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={`font-bold text-xl min-w-[3rem] text-right ${
            score >= 80 ? 'text-green-600' : 
            score >= 60 ? 'text-yellow-600' : 
            score >= 40 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {score}
          </span>
        </div>
      </div>
    );

    const viralityScore = analysis.viralityScore ?? 0;

    return (
      <div className="space-y-6 w-full max-h-96 overflow-y-auto pr-2">
        {/* Score principal */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {t('analysisComplete')}
          </h2>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <span className="text-4xl">{getScoreEmoji(viralityScore)}</span>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {viralityScore}
              <span className="text-xl text-gray-500">/100</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {getScoreMessage(viralityScore)}
          </p>
        </div>

        {/* Meilleure plateforme */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-xl shadow-lg">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-bold text-lg text-center text-gray-800">
              {t('recommendedPlatform')}
            </h3>
            <p className="text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
              {translatePlatform(analysis.bestPlatform) || t('undetermined')}
            </p>
          </div>
        </div>

        {/* Scores par plateforme */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            {t('platformScores')}
          </h3>
          <div className="space-y-2">
            {analysis.platformScores && Object.keys(analysis.platformScores).length > 0 ? (
              Object.entries(analysis.platformScores)
                .sort(([,a], [,b]) => b - a)
                .map(([platform, score]) => (
                  <ScoreBar 
                    key={platform} 
                    platform={platform} 
                    score={score} 
                    isSelected={platform === analysis.bestPlatform}
                  />
                ))
            ) : (
              <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-600 text-sm">
                {t('noScoresAvailable')}
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-4 rounded-xl shadow-md">
          <h3 className="font-bold text-lg text-yellow-800 mb-3 flex items-center">
            <span className="mr-2 text-xl">💡</span>
            {t('improvementTips')}
          </h3>
          {(analysis.insights || []).length > 0 ? (
            <div className="space-y-2">
              {analysis.insights.slice(0, 3).map((tip, idx) => (
                <div key={idx} className="flex items-start bg-white p-3 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                  <span className="text-yellow-600 mr-2 font-bold">•</span>
                  <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-3 rounded-lg text-center text-gray-500 text-sm">
              {t('noSpecificSuggestions')}
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={reset}
        >
          {t('analyzeAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white">
        {/* Sélecteur de langue */}
        <div className="flex justify-end mb-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="en">🇺🇸 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="tr">🇹🇷 Türkçe</option>
          </select>
        </div>

        {page === "upload" && (
          <div className="space-y-5">
            {/* En-tête */}
            <div className="text-center">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-700 text-base">
                {t('subtitle')}
              </p>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('videoTitle')}
                </label>
                <input
                  type="text"
                  placeholder={t('videoTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('description')}
                </label>
                <textarea
                  placeholder={t('descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  rows={3}
                  disabled={uploading}
                />
              </div>

              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('videoFile')}
                </label>
                <label className="cursor-pointer">
                  <div className="w-full border-2 border-dashed border-blue-300 bg-white rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                    <div className="text-3xl mb-2">📁</div>
                    <div className="font-semibold text-blue-600 text-sm">
                      {uploadedVideo ? t('changeVideo') : t('selectVideo')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('fileInfo')}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Aperçu vidéo */}
            {uploadedVideo && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">{t('preview')}</h4>
                  <video
                    src={URL.createObjectURL(uploadedVideo)}
                    controls
                    className="w-full rounded-lg border"
                    style={{ maxHeight: 180 }}
                  />
                  <div className="mt-2 text-xs text-gray-600">
                    {uploadedVideo.name} • {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <button
                  onClick={() => analyzeVideo(uploadedVideo)}
                  disabled={uploading || !isFormValid}
                  className={`w-full px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 transform ${
                    !isFormValid 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : uploading
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-orange-500 hover:scale-105'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>{t('analyzing')}</span>
                    </div>
                  ) : !isFormValid ? (
                    t('fillAllFields')
                  ) : (
                    t('launchAnalysis')
                  )}
                </button>
              </div>
            )}

            {/* Barre de progression */}
            {uploading && (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-700">
                  {t('analysisInProgress')} {uploadProgress}%
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-xl text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg mr-2">⚠️</span>
                  <strong className="text-sm">{t('error')}</strong>
                </div>
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>
        )}

        {page === "results" && (
          <AnalysisResults analysis={analysisResults} />
        )}
      </div>
    </div>
  );
}
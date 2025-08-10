import React, { useState, useCallback } from "react";

// Styles CSS pour les animations personnalisées
const customStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-slideIn {
    animation: slideIn 0.4s ease-out;
  }

  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }

  .group:hover .group-hover\\:scale-102 {
    transform: scale(1.02);
  }

  /* Animation du gradient de fond */
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-gradient {
    animation: gradient 15s ease infinite;
  }
`;

// Injection des styles dans le document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

export default function App() {
  const [page, setPage] = useState("upload");
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const BACKEND_URL = "https://clean-vp-backend-production.up.railway.app";

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

      // Simulation du progrès (à remplacer par un vrai suivi si disponible)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Données reçues:", data);

      if (!data || typeof data !== 'object') {
        throw new Error("Réponse invalide du serveur");
      }

      setAnalysisResults(data);
      setPage("results");
      
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      setError(err.message || "Erreur inattendue lors de l'analyse");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [title, description, isFormValid]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation de la taille (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError("Le fichier doit faire moins de 100MB");
        return;
      }
      
      // Validation du type
      if (!file.type.startsWith('video/')) {
        setError("Veuillez sélectionner un fichier vidéo valide");
        return;
      }

      console.log("📁 Fichier sélectionné:", file.name, (file.size / 1024 / 1024).toFixed(2), "MB");
      setUploadedVideo(file);
      setError(null);
    }
  }, []);

  const reset = useCallback(() => {
    console.log("🔄 Reset application");
    setPage("upload");
    setUploadedVideo(null);
    setAnalysisResults(null);
    setError(null);
    setTitle("");
    setDescription("");
    setUploadProgress(0);
  }, []);

  function AnalysisResults({ analysis }) {
    if (!analysis) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">⚠️ Aucune donnée d'analyse disponible</div>
          <button
            onClick={reset}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retour
          </button>
        </div>
      );
    }

    const ScoreBar = ({ score, platform, isSelected = false }) => (
      <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 transform hover:scale-102 ${
        isSelected 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg' 
          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className={`font-semibold text-lg ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
            {platform}
          </span>
          {isSelected && (
            <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
              ⭐ RECOMMANDÉ
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 
                score >= 40 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-red-400 to-red-500'
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

    const getScoreEmoji = (score) => {
      if (score >= 90) return "🔥";
      if (score >= 80) return "🚀";
      if (score >= 70) return "⭐";
      if (score >= 60) return "👍";
      if (score >= 50) return "👌";
      return "💪";
    };

    const getScoreMessage = (score) => {
      if (score >= 90) return "Viral potentiel exceptionnel !";
      if (score >= 80) return "Excellent potentiel viral !";
      if (score >= 70) return "Bon potentiel viral";
      if (score >= 60) return "Potentiel viral correct";
      if (score >= 50) return "Potentiel viral modéré";
      return "Améliorations nécessaires";
    };

    const viralityScore = analysis.viralityScore ?? 0;

    return (
      <div className="space-y-6 w-full animate-fadeIn">
        {/* Score principal avec animation */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🎉 Analyse Terminée !
          </h2>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <span className="text-5xl animate-bounce">{getScoreEmoji(viralityScore)}</span>
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {viralityScore}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {getScoreMessage(viralityScore)}
          </p>
        </div>

        {/* Meilleure plateforme */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-xl">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-bold text-xl text-center text-gray-800">
              🏆 Plateforme Recommandée
            </h3>
            <p className="text-center text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text mt-2">
              {analysis.bestPlatform || "Non déterminé"}
            </p>
          </div>
        </div>

        {/* Scores par plateforme */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-gray-800 flex items-center">
            📊 Scores par Plateforme
          </h3>
          <div className="space-y-3">
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
              <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
                Aucun score disponible
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-5 rounded-xl">
          <h3 className="font-bold text-lg text-yellow-800 mb-4 flex items-center">
            <span className="mr-2 text-xl">💡</span>
            Conseils pour Améliorer la Viralité
          </h3>
          {(analysis.insights || []).length > 0 ? (
            <div className="space-y-3">
              {analysis.insights.map((tip, idx) => (
                <div key={idx} className="flex items-start bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                  <span className="text-yellow-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-700 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg text-center text-gray-500">
              Aucune suggestion spécifique disponible
            </div>
          )}
        </div>

        {/* Métadonnées */}
        {analysis.metadata && (
          <div className="bg-gray-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2">📈 Détails de l'analyse</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">📝</span>
                <span>Mots: {analysis.metadata.wordCount || 0}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                <span>Durée: {analysis.metadata.estimatedDuration || 0}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={reset}
          >
            🎬 Analyser une autre vidéo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-white/95 border border-white/20">
        {page === "upload" && (
          <div className="flex flex-col space-y-6">
            {/* En-tête */}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                📱 Video Analyzer
              </h1>
              <p className="text-gray-600 text-lg">
                Découvrez le potentiel viral de votre contenu
              </p>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Titre de la vidéo *
                </label>
                <input
                  type="text"
                  placeholder="Entrez un titre accrocheur..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📄 Description *
                </label>
                <textarea
                  placeholder="Décrivez votre vidéo en détail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  rows={4}
                  disabled={uploading}
                />
              </div>

              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎥 Fichier vidéo *
                </label>
                <label className="cursor-pointer group">
                  <div className="w-full border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group-hover:scale-102">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="font-semibold text-blue-600">
                      {uploadedVideo ? "Changer la vidéo" : "Sélectionner une vidéo"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      MP4, MOV, AVI, etc. (Max 100MB)
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
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-700 mb-2">📹 Aperçu</h4>
                  <video
                    src={URL.createObjectURL(uploadedVideo)}
                    controls
                    className="w-full rounded-lg border shadow-sm"
                    style={{ maxHeight: 240 }}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    {uploadedVideo.name} • {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <button
                  onClick={() => analyzeVideo(uploadedVideo)}
                  disabled={uploading || !isFormValid}
                  className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                    !isFormValid 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : uploading
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-pink-600 hover:to-orange-500'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Analyse en cours...</span>
                    </div>
                  ) : !isFormValid ? (
                    "Veuillez remplir tous les champs"
                  ) : (
                    "🚀 Lancer l'analyse"
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
                <div className="text-center text-sm text-gray-600">
                  Analyse en cours... {uploadProgress}%
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xl mr-2">⚠️</span>
                  <strong>Erreur</strong>
                </div>
                <div>{error}</div>
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
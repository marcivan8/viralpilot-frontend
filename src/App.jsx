import React, { useState } from "react";

export default function App() {
  const [page, setPage] = useState("upload");
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const BACKEND_URL = "https://clean-vp-backend-production.up.railway.app";

  async function analyzeVideo(file) {
    if (!file) return;

    console.log("🚀 Début analyse - fichier:", file.name);
    setUploading(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);

      console.log("📤 Envoi requête vers:", `${BACKEND_URL}/analyze`);
      console.log("📝 Titre:", title);
      console.log("📝 Description:", description);

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📥 Données reçues:");
      console.log(JSON.stringify(data, null, 2));

      // Vérification que les données sont valides
      if (!data || typeof data !== 'object') {
        throw new Error("Réponse invalide du serveur");
      }

      console.log("✅ Mise à jour état avec:", data);
      setAnalysisResults(data);
      
      // CHANGEMENT IMPORTANT: On change de page seulement après avoir mis à jour les résultats
      console.log("🔄 Changement vers page results");
      setPage("results");
      
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      setError(err.message || "Unexpected error during video analysis");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      console.log("📁 Fichier sélectionné:", file.name, file.size, "bytes");
      setUploadedVideo(file);
    }
  }

  function reset() {
    console.log("🔄 Reset application");
    setPage("upload");
    setUploadedVideo(null);
    setAnalysisResults(null);
    setError(null);
    setTitle("");
    setDescription("");
  }

  function AnalysisResults({ analysis }) {
    console.log("🎨 Render AnalysisResults avec:", analysis);

    if (!analysis) {
      console.log("⚠️ Aucune donnée d'analyse disponible");
      return <p>No analysis data available.</p>;
    }

    return (
      <div className="space-y-4 w-full">
        <h2 className="text-2xl font-bold text-green-600 text-center">
          Analysis Complete!
        </h2>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg">
            <strong>Best Platform:</strong>{" "}
            <span className="text-blue-600 font-semibold">
              {analysis.bestPlatform || "N/A"}
            </span>
          </p>

          <p className="text-lg">
            <strong>Virality Score:</strong>{" "}
            <span className="text-green-600 font-bold text-xl">
              {analysis.viralityScore ?? 0}/100
            </span>
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Platform Scores:</h3>
          {analysis.platformScores && Object.keys(analysis.platformScores).length > 0 ? (
            <ul className="space-y-1">
              {Object.entries(analysis.platformScores).map(([platform, score]) => (
                <li key={platform} className="flex justify-between">
                  <span>{platform}:</span>
                  <span className="font-semibold">{score}/100</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No platform scores available</p>
          )}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Improvement Suggestions:</h3>
          {(analysis.insights || []).length > 0 ? (
            <ul className="space-y-1">
              {analysis.insights.map((tip, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No suggestions available</p>
          )}
        </div>

        {/* DEBUG INFO - À retirer en production */}
        <details className="bg-gray-100 p-2 rounded text-xs">
          <summary className="cursor-pointer text-gray-600">Debug Info</summary>
          <pre className="mt-2 overflow-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </details>

        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition shadow-md font-medium mt-4"
          onClick={reset}
        >
          Analyze Another Video
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        {page === "upload" && (
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-extrabold text-blue-700 text-center">
              Upload Your Video
            </h1>
            <p className="text-gray-600 text-center">
              Get your virality score, best platform, and improvement tips—instantly!
            </p>

            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />

            <textarea
              name="description"
              placeholder="Video Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={uploading}
            />

            <label className="cursor-pointer border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition font-semibold px-6 py-3 rounded-full shadow-md focus:ring-4 focus:outline-none focus:ring-blue-300 text-center">
              {uploadedVideo ? "Change Video" : "Choose Video"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>

            {uploadedVideo && (
              <div className="w-full space-y-4">
                <video
                  src={URL.createObjectURL(uploadedVideo)}
                  controls
                  className="w-full rounded-md border"
                  style={{ maxHeight: 200 }}
                />
                <button
                  onClick={() => analyzeVideo(uploadedVideo)}
                  className="w-full bg-gradient-to-r from-pink-600 to-yellow-400 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition"
                  disabled={uploading}
                >
                  {uploading ? "Analyzing..." : "Analyze Video"}
                </button>
              </div>
            )}

            {uploading && (
              <div className="text-blue-600 font-medium text-center animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="mt-2">Analyzing your video...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md text-center">
                {error}
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
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

    setUploading(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server error during analysis");
      }

      const data = await response.json();

      setAnalysisResults(data.analysis);
      setPage("results");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Unexpected error during video analysis");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setUploadedVideo(file);
    }
  }

  function reset() {
    setPage("upload");
    setUploadedVideo(null);
    setAnalysisResults(null);
    setError(null);
    setTitle("");
    setDescription("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        {/* Upload Page */}
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
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />

            <textarea
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
              <div className="text-blue-600 font-medium text-center">
                Analyzing your video...
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
          </div>
        )}

        {/* Results Page */}
        {page === "results" && analysisResults && (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold text-green-600 text-center">
              Analysis Complete!
            </h2>
            <video
              src={uploadedVideo ? URL.createObjectURL(uploadedVideo) : ""}
              controls
              className="w-full rounded-md border"
              style={{ maxHeight: 200 }}
            />
            <div className="w-full text-left space-y-3 mt-4">
              <div>
                <span className="font-semibold text-gray-700">Virality Score: </span>
                <span className="text-blue-600 font-bold">
                  {analysisResults.viralityScore}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Best Platform: </span>
                <span className="text-blue-600 font-bold">
                  {analysisResults.platformSuggestion}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Improvement Suggestions:</span>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {analysisResults.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition shadow-md font-medium mt-4"
              onClick={reset}
            >
              Analyze Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
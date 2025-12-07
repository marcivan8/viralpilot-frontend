import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalysisProvider, useAnalysisContext } from "./contexts/AnalysisContext";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import LoadingState from "./components/LoadingState";
import CookieConsent from "./components/CookieConsent";

// Main App Component
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [uploadedFile, setUploadedFile] = useState(null);
  const { analyzeVideo, isAnalyzing, analysisResults, progress, error, resetAnalysis } = useAnalysisContext();

  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploadedFile(file);

    try {
      // Start analysis immediately upon file selection
      await analyzeVideo(file);
      setCurrentPage('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      // Error is handled by context and displayed in Home
    }
  };

  const handleBack = () => {
    resetAnalysis();
    setUploadedFile(null);
    setCurrentPage('home');
  };

  return (
    <>
      {isAnalyzing && (
        <LoadingState progress={progress} status="Analyzing video content..." />
      )}

      {currentPage === 'auth' && (
        <Auth onBack={() => setCurrentPage('home')} />
      )}

      {currentPage === 'home' && (
        <Home
          onFileSelect={handleFileSelect}
          isAnalyzing={isAnalyzing}
          error={error}
          onLogin={() => setCurrentPage('auth')}
        />
      )}

      {currentPage === 'results' && (
        <Results
          results={analysisResults}
          videoFile={uploadedFile}
          onBack={handleBack}
          onLogin={() => setCurrentPage('auth')}
        />
      )}

      <CookieConsent />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <AppContent />
      </AnalysisProvider>
    </AuthProvider>
  );
};

export default App;
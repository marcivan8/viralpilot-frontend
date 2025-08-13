import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

export const useAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const { getAccessToken } = useAuth();

  const analyzeVideo = useCallback(async (file, formData, aiConsent = false) => {
    if (!file || !formData.title || !formData.description) {
      throw new Error('Missing required data');
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Animation de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 85));
    }, 500);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      // Préparer FormData
      const uploadData = new FormData();
      uploadData.append('video', file);
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('language', formData.language || 'en');
      uploadData.append('ai_training_consent', aiConsent.toString());

      const results = await ApiService.analyzeVideo(uploadData, accessToken);
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResults(results);
      
      return results;
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed');
      throw err;
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [getAccessToken]);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    error,
    progress,
    analyzeVideo,
    resetAnalysis
  };
};

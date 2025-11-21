import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';
import EmotionService from '../services/emotionService';
import VisionService from '../services/visionService';
import AudioService from '../services/audioService';

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

      // Analyser avec les différents services en parallèle (si possible)
      setProgress(20);

      // Lancer les analyses en parallèle
      const [emotions, vision, audio, backendResults] = await Promise.allSettled([
        EmotionService.analyzeEmotions(file).catch(err => {
          console.warn('Emotion analysis failed:', err);
          return null;
        }),
        VisionService.analyzeObjectsAndScenes(file, accessToken).catch(err => {
          console.warn('Vision analysis failed:', err);
          return null;
        }),
        AudioService.analyzeAudio(file).catch(err => {
          console.warn('Audio analysis failed:', err);
          return null;
        }),
        ApiService.analyzeVideo(uploadData, accessToken),
      ]);

      setProgress(90);

      // Combiner les résultats
      if (backendResults.status === 'rejected') {
        throw backendResults.reason;
      }
      const results = backendResults.value || {};

      // Ajouter les analyses additionnelles
      if (emotions.status === 'fulfilled' && emotions.value) {
        results.emotionAnalysis = emotions.value;
      }

      if (vision.status === 'fulfilled' && vision.value) {
        results.visionAnalysis = vision.value;
      }

      if (audio.status === 'fulfilled' && audio.value) {
        results.audioAnalysis = audio.value;
      }

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

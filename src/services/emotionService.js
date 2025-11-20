// Service pour face-api.js pour l'analyse des émotions
import * as faceapi from 'face-api.js';

class EmotionService {
  static modelsLoaded = false;
  static loadingPromise = null;

  /**
   * Charge les modèles face-api.js
   * @returns {Promise<void>}
   */
  static async loadModels() {
    if (this.modelsLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        console.log('📦 Loading face-api.js models...');
        
        const MODEL_URL = '/models'; // Les modèles doivent être dans public/models
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        this.modelsLoaded = true;
        console.log('✅ face-api.js models loaded successfully');
      } catch (error) {
        console.error('❌ Error loading face-api.js models:', error);
        // Fallback: utiliser des modèles depuis CDN si les fichiers locaux ne sont pas disponibles
        try {
          const MODEL_URL_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL_CDN),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL_CDN),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL_CDN),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL_CDN),
          ]);
          this.modelsLoaded = true;
          console.log('✅ face-api.js models loaded from CDN');
        } catch (cdnError) {
          console.error('❌ Error loading models from CDN:', cdnError);
          throw new Error('Could not load face-api.js models');
        }
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Extrait des frames d'une vidéo pour l'analyse
   * @param {HTMLVideoElement} video - Élément vidéo
   * @param {number} frameCount - Nombre de frames à extraire
   * @returns {Promise<ImageData[]>} - Tableau de frames
   */
  static async extractVideoFrames(videoFile, frameCount = 10) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames = [];
      
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const duration = video.duration;
        const interval = duration / (frameCount + 1);
        
        let loadedFrames = 0;
        
        const captureFrame = (time) => {
          video.currentTime = time;
        };
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push(imageData);
          
          loadedFrames++;
          if (loadedFrames < frameCount) {
            captureFrame((loadedFrames + 1) * interval);
          } else {
            resolve(frames);
          }
        };
        
        video.onerror = (error) => {
          reject(error);
        };
        
        if (duration > 0) {
          captureFrame(interval);
        } else {
          reject(new Error('Could not determine video duration'));
        }
      };
      
      video.onerror = (error) => {
        reject(error);
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Analyse les émotions dans une vidéo
   * @param {File} videoFile - Fichier vidéo
   * @returns {Promise<Object>} - Résultats de l'analyse émotionnelle
   */
  static async analyzeEmotions(videoFile) {
    try {
      console.log('😊 Starting emotion analysis with face-api.js...');
      
      // Charger les modèles si nécessaire
      await this.loadModels();
      
      // Extraire des frames de la vidéo
      const frames = await this.extractVideoFrames(videoFile, 10);
      
      const allEmotions = {
        happy: [],
        sad: [],
        angry: [],
        surprised: [],
        disgusted: [],
        fearful: [],
        neutral: [],
      };
      
      const detections = [];
      
      // Analyser chaque frame
      for (const frame of frames) {
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(frame, 0, 0);
        
        // Détecter les visages et expressions
        const frameDetections = await faceapi
          .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        
        detections.push(...frameDetections);
        
        // Collecter les émotions détectées
        frameDetections.forEach(detection => {
          const expressions = detection.expressions;
          allEmotions.happy.push(expressions.happy);
          allEmotions.sad.push(expressions.sad);
          allEmotions.angry.push(expressions.angry);
          allEmotions.surprised.push(expressions.surprised);
          allEmotions.disgusted.push(expressions.disgusted);
          allEmotions.fearful.push(expressions.fearful);
          allEmotions.neutral.push(expressions.neutral);
        });
      }
      
      // Calculer les moyennes
      const averageEmotions = {};
      Object.keys(allEmotions).forEach(emotion => {
        const values = allEmotions[emotion];
        if (values.length > 0) {
          averageEmotions[emotion] = values.reduce((a, b) => a + b, 0) / values.length;
        } else {
          averageEmotions[emotion] = 0;
        }
      });
      
      // Déterminer l'émotion dominante
      const dominantEmotion = Object.keys(averageEmotions).reduce((a, b) => 
        averageEmotions[a] > averageEmotions[b] ? a : b
      );
      
      console.log('✅ Emotion analysis completed:', {
        averageEmotions,
        dominantEmotion,
        faceCount: detections.length,
      });
      
      return {
        averageEmotions,
        dominantEmotion,
        faceCount: detections.length,
        frameAnalysisCount: frames.length,
        detections: detections.slice(0, 10), // Limiter pour éviter des données trop volumineuses
      };
    } catch (error) {
      console.error('❌ Emotion analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyse les émotions dans une image
   * @param {HTMLImageElement|HTMLCanvasElement} image - Image à analyser
   * @returns {Promise<Object>} - Résultats de l'analyse
   */
  static async analyzeImageEmotions(image) {
    try {
      await this.loadModels();
      
      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      if (detections.length === 0) {
        return {
          faceCount: 0,
          emotions: null,
          message: 'No faces detected',
        };
      }
      
      // Calculer les moyennes pour toutes les détections
      const allExpressions = {
        happy: [],
        sad: [],
        angry: [],
        surprised: [],
        disgusted: [],
        fearful: [],
        neutral: [],
      };
      
      detections.forEach(detection => {
        const expressions = detection.expressions;
        Object.keys(allExpressions).forEach(emotion => {
          allExpressions[emotion].push(expressions[emotion]);
        });
      });
      
      const averageEmotions = {};
      Object.keys(allExpressions).forEach(emotion => {
        const values = allExpressions[emotion];
        averageEmotions[emotion] = values.reduce((a, b) => a + b, 0) / values.length;
      });
      
      const dominantEmotion = Object.keys(averageEmotions).reduce((a, b) => 
        averageEmotions[a] > averageEmotions[b] ? a : b
      );
      
      return {
        faceCount: detections.length,
        averageEmotions,
        dominantEmotion,
        detections: detections.map(d => ({
          expressions: d.expressions,
          landmarks: d.landmarks,
        })),
      };
    } catch (error) {
      console.error('❌ Image emotion analysis error:', error);
      throw error;
    }
  }
}

export default EmotionService;


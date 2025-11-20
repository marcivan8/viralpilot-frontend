// Service pour GPT-4o-mini-vision pour l'analyse des objets et scènes

class VisionService {
  /**
   * Analyse les objets et scènes dans une vidéo en utilisant GPT-4o-mini-vision
   * @param {File|Blob} videoFile - Le fichier vidéo à analyser
   * @param {string} accessToken - Token d'accès pour l'API
   * @returns {Promise<Object>} - Résultats de l'analyse (objets détectés, scènes, contexte)
   */
  static async analyzeObjectsAndScenes(videoFile, accessToken) {
    try {
      console.log('🔍 Starting vision analysis with GPT-4o-mini-vision...');
      
      // Extraire des frames de la vidéo pour l'analyse
      const frames = await this.extractVideoFrames(videoFile, 5); // Extraire 5 frames
      
      // Préparer les données pour l'API
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Ajouter les frames comme images
      frames.forEach((frame, index) => {
        formData.append(`frame_${index}`, frame, `frame_${index}.png`);
      });
      
      // Appeler l'API backend qui utilisera GPT-4o-mini-vision
      // Note: Utiliser directement l'API_BASE_URL depuis apiService
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:3000' 
          : 'https://clean-vp-backend-production.up.railway.app');
      
      const response = await fetch(`${API_BASE_URL}/analyze/vision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Vision analysis failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      console.log('✅ Vision analysis completed:', results);
      
      return {
        objects: results.objects || [],
        scenes: results.scenes || [],
        context: results.context || '',
        dominantElements: results.dominantElements || [],
        settings: results.settings || {},
      };
    } catch (error) {
      console.error('❌ Vision analysis error:', error);
      throw error;
    }
  }

  /**
   * Extrait des frames d'une vidéo
   * @param {File} videoFile - Fichier vidéo
   * @param {number} frameCount - Nombre de frames à extraire
   * @returns {Promise<Blob[]>} - Tableau de blobs d'images
   */
  static async extractVideoFrames(videoFile, frameCount = 5) {
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
          canvas.toBlob((blob) => {
            if (blob) {
              frames.push(blob);
            }
            loadedFrames++;
            
            if (loadedFrames < frameCount) {
              captureFrame((loadedFrames + 1) * interval);
            } else {
              resolve(frames);
            }
          }, 'image/png');
        };
        
        video.onerror = (error) => {
          reject(error);
        };
        
        // Commencer la capture
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
   * Analyse une image avec GPT-4o-mini-vision
   * @param {Blob} imageBlob - Image à analyser
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<Object>} - Résultats de l'analyse
   */
  static async analyzeImage(imageBlob, accessToken) {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:3000' 
          : 'https://clean-vp-backend-production.up.railway.app');
      
      const response = await fetch(`${API_BASE_URL}/analyze/vision/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Image analysis error:', error);
      throw error;
    }
  }
}

export default VisionService;


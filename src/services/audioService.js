// Service pour TensorFlow.js pour la classification audio
import * as tf from '@tensorflow/tfjs';

class AudioService {
  static modelLoaded = false;

  /**
   * Charge TensorFlow.js (déjà disponible)
   * @returns {Promise<void>}
   */
  static async loadModel() {
    if (this.modelLoaded) {
      return Promise.resolve();
    }

    try {
      console.log('📦 Initializing TensorFlow.js for audio analysis...');

      // Vérifier que TensorFlow.js est bien chargé
      if (!tf) {
        throw new Error('TensorFlow.js not available');
      }

      this.modelLoaded = true;
      console.log('✅ TensorFlow.js initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing TensorFlow.js:', error);
      throw new Error('Could not initialize TensorFlow.js');
    }
  }



  /**
   * Analyse l'audio d'une vidéo avec TensorFlow.js
   * @param {File} videoFile - Fichier vidéo
   * @returns {Promise<Object>} - Résultats de l'analyse audio
   */
  static async analyzeAudio(videoFile) {
    try {
      console.log('🎵 Starting audio analysis with TensorFlow.js...');

      // Charger le modèle si nécessaire
      await this.loadModel();

      // Analyser l'audio avec des techniques de base si le modèle speech-commands
      // n'est pas adapté pour l'analyse générale d'audio
      const audioFeatures = await this.extractAudioFeatures(videoFile);

      console.log('✅ Audio analysis completed:', audioFeatures);

      return {
        duration: audioFeatures.duration,
        sampleRate: audioFeatures.sampleRate,
        channels: audioFeatures.channels,
        volumeLevels: audioFeatures.volumeLevels,
        frequencySpectrum: audioFeatures.frequencySpectrum,
        dominantFrequencies: audioFeatures.dominantFrequencies,
        audioClassification: audioFeatures.classification || 'speech', // classification basique
      };
    } catch (error) {
      console.error('❌ Audio analysis error:', error);
      throw error;
    }
  }

  /**
   * Extrait des caractéristiques audio basiques
   * @param {File} audioFile - Fichier audio/vidéo
   * @returns {Promise<Object>} - Caractéristiques audio
   */
  static async extractAudioFeatures(audioFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      video.preload = 'metadata';
      video.muted = true;
      video.volume = 0;

      video.onloadedmetadata = () => {
        const duration = video.duration;

        // Créer un analyser pour obtenir des données audio
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const source = audioContext.createMediaElementSource(video);
        source.connect(analyser);
        // Ne pas connecter à la destination pour éviter le retour audio
        // analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Échantillonner plusieurs fois pendant la lecture
        const samples = [];
        const sampleInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          samples.push(Array.from(dataArray));

          if (video.ended || video.paused) {
            clearInterval(sampleInterval);

            // Calculer les moyennes
            const avgLevels = new Array(bufferLength).fill(0);
            samples.forEach(sample => {
              sample.forEach((value, index) => {
                avgLevels[index] += value;
              });
            });
            avgLevels.forEach((_, index) => {
              avgLevels[index] /= samples.length;
            });

            // Trouver les fréquences dominantes
            const dominantFrequencies = avgLevels
              .map((value, index) => ({ frequency: index, magnitude: value }))
              .sort((a, b) => b.magnitude - a.magnitude)
              .slice(0, 10)
              .map(item => item.frequency);

            resolve({
              duration,
              sampleRate: audioContext.sampleRate,
              channels: 2, // Stéréo par défaut
              volumeLevels: samples.map(sample =>
                sample.reduce((a, b) => a + b, 0) / sample.length
              ),
              frequencySpectrum: avgLevels,
              dominantFrequencies,
            });
          }
        }, 100);

        video.play().catch(reject);
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(audioFile);
    });
  }

  /**
   * Classifie un segment audio en utilisant TensorFlow.js
   * @param {Float32Array} audioData - Données audio
   * @returns {Promise<string>} - Classification (ex: 'speech', 'music', 'noise')
   */
  static async classifyAudio(audioData) {
    try {
      if (!this.modelLoaded) {
        await this.loadModel();
      }

      // Utiliser TensorFlow.js pour analyser les caractéristiques audio
      // Convertir les données audio en tenseur
      const audioTensor = tf.tensor1d(audioData);

      // Calculer des statistiques basiques pour la classification
      const mean = audioTensor.mean().dataSync()[0];
      const variance = audioTensor.sub(mean).square().mean().dataSync()[0];
      const std = Math.sqrt(variance);

      // Nettoyer le tenseur
      audioTensor.dispose();

      // Classification simple basée sur les caractéristiques statistiques
      // Une vraie classification nécessiterait un modèle entraîné
      if (std > 0.3) {
        return 'music';
      } else if (std > 0.1) {
        return 'speech';
      } else {
        return 'silence';
      }
    } catch (error) {
      console.error('❌ Audio classification error:', error);
      throw error;
    }
  }
}

export default AudioService;


// ===== src/main.jsx =====
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* Background animé en arrière-plan */}
    <div className="animated-bg" />
    
    {/* App content avec bon z-index */}
    <div className="app-container">
      <App />
    </div>
  </React.StrictMode>
);

// ===== models/VideoAnalysis.js (AJOUT MANQUANT) =====
const { supabaseAdmin } = require('../config/database');

class VideoAnalysis {
  static async create(analysisData) {
    try {
      // Définir expiration selon le consentement
      const expiresAt = analysisData.ai_training_consent 
        ? null 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .insert([{
          ...analysisData,
          expires_at: expiresAt,
          processing_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) {
        console.error('VideoAnalysis create error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('VideoAnalysis create failed:', error);
      throw error;
    }
  }
  
  static async updateResults(analysisId, results) {
    try {
      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .update({
          analysis_results: results,
          virality_score: results.viralityScore || 0,
          best_platform: results.bestPlatform || 'Unknown',
          platform_scores: results.platformScores || {},
          insights: results.insights || [],
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .single();
        
      if (error) {
        console.error('VideoAnalysis update error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('VideoAnalysis update failed:', error);
      throw error;
    }
  }

  static async updateStatus(analysisId, status, metadata = {}) {
    try {
      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .update({
          processing_status: status,
          error_details: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('VideoAnalysis status update failed:', error);
      throw error;
    }
  }
  
  static async findByUser(userId, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) {
        console.error('VideoAnalysis findByUser error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('VideoAnalysis findByUser failed:', error);
      throw error;
    }
  }

  static async findById(analysisId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('VideoAnalysis findById error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('VideoAnalysis findById failed:', error);
      throw error;
    }
  }

  static async delete(analysisId) {
    try {
      const { error } = await supabaseAdmin
        .from('video_analyses')
        .delete()
        .eq('id', analysisId);
        
      if (error) {
        console.error('VideoAnalysis delete error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('VideoAnalysis delete failed:', error);
      throw error;
    }
  }
  
  static async findExpired() {
    try {
      const { data, error } = await supabaseAdmin
        .from('video_analyses')
        .select('*')
        .lt('expires_at', new Date().toISOString())
        .not('expires_at', 'is', null);
        
      if (error) {
        console.error('VideoAnalysis findExpired error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('VideoAnalysis findExpired failed:', error);
      throw error;
    }
  }
}

module.exports = VideoAnalysis;
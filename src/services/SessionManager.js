// services/SessionManager.js - Auto logout and activity tracking
import { useState, useEffect, useRef } from 'react';

class SessionManager {
  constructor() {
    this.INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    this.WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout
    this.CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
    
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.logoutTimer = null;
    this.warningTimer = null;
    this.activityListeners = [];
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return; // Server-side check
    
    // Initialize from localStorage if available
    const storedActivity = localStorage.getItem('lastActivity');
    if (storedActivity) {
      this.lastActivity = parseInt(storedActivity, 10);
    }
    
    // Track user activity
    this.trackActivity();
    
    // Start inactivity check
    this.startInactivityCheck();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for storage events (multi-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  trackActivity() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });
  }

  updateActivity() {
    const now = Date.now();
    
    // Don't update too frequently
    if (now - this.lastActivity < 1000) return;
    
    this.lastActivity = now;
    this.warningShown = false;
    
    // Store in localStorage for multi-tab sync
    localStorage.setItem('lastActivity', now.toString());
    
    // Reset timers
    this.resetTimers();
    
    // Notify listeners
    this.notifyListeners('activity', { timestamp: now });
  }

  startInactivityCheck() {
    this.checkInterval = setInterval(() => {
      this.checkInactivity();
    }, this.CHECK_INTERVAL);
  }

  checkInactivity() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    const timeUntilLogout = this.INACTIVITY_TIMEOUT - timeSinceActivity;
    
    // Update UI with remaining time
    this.notifyListeners('timeUpdate', {
      remaining: Math.max(0, timeUntilLogout),
      percentage: Math.max(0, (timeUntilLogout / this.INACTIVITY_TIMEOUT) * 100)
    });
    
    // Show warning if needed
    if (timeUntilLogout <= this.WARNING_TIME && timeUntilLogout > 0 && !this.warningShown) {
      this.showWarning(timeUntilLogout);
    }
    
    // Perform logout if timeout reached
    if (timeUntilLogout <= 0) {
      this.performLogout('inactivity');
    }
  }

  showWarning(timeRemaining) {
    this.warningShown = true;
    
    this.notifyListeners('warning', {
      timeRemaining: Math.round(timeRemaining / 1000),
      message: `You will be logged out due to inactivity in ${Math.round(timeRemaining / 1000)} seconds`
    });
    
    // Auto-dismiss warning if user becomes active
    this.warningTimer = setTimeout(() => {
      if (Date.now() - this.lastActivity < this.WARNING_TIME) {
        this.hideWarning();
      }
    }, 5000);
  }

  hideWarning() {
    this.warningShown = false;
    this.notifyListeners('warningDismissed', {});
  }

  resetTimers() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    // Set new logout timer
    this.logoutTimer = setTimeout(() => {
      this.checkInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  performLogout(reason = 'manual') {
    // Clear all timers
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Clear session data
    this.clearSession();
    
    // Notify listeners
    this.notifyListeners('logout', { reason });
    
    // Store logout event for multi-tab sync
    if (typeof window !== 'undefined') {
      localStorage.setItem('logout', Date.now().toString());
      setTimeout(() => {
        localStorage.removeItem('logout'); // Trigger storage event
      }, 100);
    }
  }

  clearSession() {
    // Clear all auth-related data
    const authKeys = [
      'accessToken',
      'refreshToken',
      'user',
      'lastActivity',
      'sessionId'
    ];
    
    // Clear Supabase auth tokens
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.startsWith('supabase.auth.token')
    );
    
    [...authKeys, ...supabaseKeys].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, store the hide time
      localStorage.setItem('pageHiddenAt', Date.now().toString());
    } else {
      // Page is visible again, check how long it was hidden
      const hiddenAt = parseInt(localStorage.getItem('pageHiddenAt') || '0', 10);
      const hiddenDuration = Date.now() - hiddenAt;
      
      if (hiddenDuration > this.INACTIVITY_TIMEOUT) {
        // Page was hidden for too long
        this.performLogout('inactivity');
      } else {
        // Update activity
        this.updateActivity();
      }
    }
  }

  handleStorageChange(event) {
    // Sync activity across tabs
    if (event.key === 'lastActivity') {
      this.lastActivity = parseInt(event.newValue || '0', 10);
      this.resetTimers();
    }
    
    // Handle logout from another tab
    if (event.key === 'logout') {
      this.performLogout('multi-tab');
    }
  }

  extendSession() {
    this.updateActivity();
    this.hideWarning();
    
    this.notifyListeners('sessionExtended', {
      newExpiry: this.lastActivity + this.INACTIVITY_TIMEOUT
    });
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.activityListeners[event]) {
      this.activityListeners[event] = [];
    }
    this.activityListeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.activityListeners[event]) {
      this.activityListeners[event] = this.activityListeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  notifyListeners(event, data) {
    if (this.activityListeners[event]) {
      this.activityListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in session listener:', error);
        }
      });
    }
  }

  // Get session info
  getSessionInfo() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    const timeRemaining = Math.max(0, this.INACTIVITY_TIMEOUT - timeSinceActivity);
    
    return {
      lastActivity: this.lastActivity,
      timeRemaining: timeRemaining,
      isActive: timeSinceActivity < this.INACTIVITY_TIMEOUT,
      warningActive: this.warningShown,
      percentage: (timeRemaining / this.INACTIVITY_TIMEOUT) * 100
    };
  }

  // Configuration
  setInactivityTimeout(timeout) {
    this.INACTIVITY_TIMEOUT = timeout;
    this.resetTimers();
  }

  setWarningTime(time) {
    this.WARNING_TIME = time;
  }

  // Cleanup
  destroy() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.activityListeners = {};
  }
}

// React Hook for Session Management
export const useSessionManager = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const sessionManagerRef = useRef(null);

  useEffect(() => {
    // Initialize session manager
    sessionManagerRef.current = new SessionManager();
    const manager = sessionManagerRef.current;

    // Listen for events
    manager.addEventListener('activity', () => {
      setSessionInfo(manager.getSessionInfo());
      setShowWarning(false);
    });

    manager.addEventListener('warning', (data) => {
      setShowWarning(true);
      setWarningMessage(data.message);
      setSessionInfo(manager.getSessionInfo());
    });

    manager.addEventListener('warningDismissed', () => {
      setShowWarning(false);
    });

    manager.addEventListener('timeUpdate', () => {
      setSessionInfo(manager.getSessionInfo());
    });

    manager.addEventListener('logout', (data) => {
      console.log('Logging out due to:', data.reason);
      // The logout will be handled by the component that uses this hook
      // We'll navigate to landing page and clear auth state
      if (typeof window !== 'undefined') {
        window.location.reload(); // Reload to clear all state
      }
    });

    // Initial session info
    setSessionInfo(manager.getSessionInfo());

    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.destroy();
      }
    };
  }, []);

  const extendSession = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.extendSession();
    }
  };

  const logout = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.performLogout('manual');
    }
  };

  return {
    sessionInfo,
    showWarning,
    warningMessage,
    extendSession,
    logout
  };
};

// Session Warning Component for React
export const SessionWarning = ({ onExtend, onLogout }) => {
  const { showWarning, warningMessage, sessionInfo, extendSession, logout } = useSessionManager();
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (showWarning && sessionInfo) {
      const interval = setInterval(() => {
        const remaining = Math.round(sessionInfo.timeRemaining / 1000);
        setCountdown(Math.max(0, remaining));
        
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(120);
    }
  }, [showWarning, sessionInfo]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Timeout Warning</h2>
          <p className="text-gray-600">
            You've been inactive for a while. Your session will expire in:
          </p>
          
          <div className="text-4xl font-bold text-amber-600 my-4">
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-amber-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (countdown / 120) * 100)}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              extendSession();
              onExtend?.();
            }}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Continue Working
          </button>
          
          <button
            onClick={() => {
              logout();
              onLogout?.();
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;


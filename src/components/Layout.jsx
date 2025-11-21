import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo'; // Fixed import - was importing from wrong path

import { User, LogOut, Globe, Target } from 'lucide-react';

const Header = ({ language, setLanguage, onAuthClick, onNavigate }) => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div
          onClick={() => onNavigate('landing')}
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="tr">🇹🇷 Türkçe</option>
            </select>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn-liquid-glass-secondary flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              >
                <Target className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-700 font-medium">Dashboard</span>
              </button>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-gray-700 font-medium max-w-32 truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm transition-colors disabled:opacity-50 p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="btn-liquid-glass px-6 py-2 rounded-lg font-medium transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = ({ language, onNavigate }) => {
  const translations = {
    en: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved"
    },
    fr: {
      privacy: "Politique de Confidentialité",
      terms: "Conditions d'Utilisation",
      rights: "Tous droits réservés"
    },
    tr: {
      privacy: "Gizlilik Politikası",
      terms: "Kullanım Koşulları",
      rights: "Tüm hakları saklıdır"
    }
  };

  const t = (key) => translations[language]?.[key] || translations.en[key];

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-6 py-8 text-center text-gray-500 text-sm">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-gray-900 transition-colors"
          >
            {t('privacy')}
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-gray-900 transition-colors"
          >
            {t('terms')}
          </button>
        </div>
        <p>© 2025 Viral Pilot. {t('rights')}.</p>
      </div>
    </footer>
  );
};

const Layout = ({ children, language, setLanguage, onAuthClick, onNavigate }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-slate-50 to-gray-50 flex flex-col overflow-x-hidden">
      <Header
        language={language}
        setLanguage={setLanguage}
        onAuthClick={onAuthClick}
        onNavigate={onNavigate}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer
        language={language}
        onNavigate={onNavigate}
      />

    </div>
  );
};

export default Layout;
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo'; // Fixed import - was importing from wrong path
import { User, LogOut, Globe } from 'lucide-react';

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 max-w-32 truncate">
                  {user.email}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-all"
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
    <footer className="bg-white border-t border-gray-200 mt-auto">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
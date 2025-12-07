import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LogIn, UserPlus, CheckSquare, Square } from "lucide-react";
import { TermsOfService, PrivacyPolicy } from "./components/LegalDocs";

// ===== Supabase Config =====
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ===== Translations =====
const translations = {
  en: {
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    loginBtn: "Log In",
    signupBtn: "Sign Up",
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    chooseLang: "Choose Language",
  },
  fr: {
    login: "Connexion",
    signup: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    fullName: "Nom complet",
    haveAccount: "Vous avez déjà un compte ?",
    noAccount: "Pas de compte ?",
    loginBtn: "Se connecter",
    signupBtn: "S'inscrire",
    welcomeBack: "Bon retour",
    createAccount: "Créez votre compte",
    chooseLang: "Choisir la langue",
  },
  tr: {
    login: "Giriş Yap",
    signup: "Kayıt Ol",
    email: "E-posta",
    password: "Şifre",
    fullName: "Tam Ad",
    haveAccount: "Zaten bir hesabınız var mı?",
    noAccount: "Hesabınız yok mu?",
    loginBtn: "Giriş Yap",
    signupBtn: "Kayıt Ol",
    welcomeBack: "Tekrar hoşgeldiniz",
    createAccount: "Hesabınızı oluşturun",
    chooseLang: "Dil Seçin",
  },
};
const useT = (language) => (key) =>
  translations[language]?.[key] || translations.en[key] || key;

// ===== Auth Component =====
export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const t = useT(language);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && !agreedToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        localStorage.setItem("viral_pilot_token", data.session.access_token);
        localStorage.setItem(
          "viral_pilot_user",
          JSON.stringify(data.user.user_metadata)
        );
        onAuthSuccess();
      } else {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
          },
        });

        if (error) throw error;

        // SEAMLESS LOGIN LOGIC
        // If session is present, user is already logged in (email confirmation might be disabled or optional)
        if (data.session) {
          localStorage.setItem("viral_pilot_token", data.session.access_token);
          localStorage.setItem(
            "viral_pilot_user",
            JSON.stringify(data.user.user_metadata)
          );
          onAuthSuccess();
        } else {
          // Attempt immediate login just in case
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

          if (loginData?.session) {
            localStorage.setItem("viral_pilot_token", loginData.session.access_token);
            localStorage.setItem(
              "viral_pilot_user",
              JSON.stringify(loginData.user.user_metadata)
            );
            onAuthSuccess();
          } else {
            // Fallback: Email confirmation is strictly required
            alert("Signup successful! Confirmation email sent. Please check your inbox to verify your account, then log in.");
            setIsLogin(true);
          }
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">
            {isLogin ? t("welcomeBack") : t("createAccount")}
          </h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="tr">🇹🇷 Türkçe</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder={t("fullName")}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          )}
          <input
            type="email"
            placeholder={t("email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="password"
            placeholder={t("password")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded p-2"
            required
          />

          {!isLogin && (
            <div className="flex items-start gap-2 mt-4 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="mt-0.5 text-blue-600 flex-shrink-0"
              >
                {agreedToTerms ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
              <div className="leading-snug">
                I agree to the{" "}
                <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 hover:underline font-medium">Terms of Service</button>
                {" "}and{" "}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-blue-600 hover:underline font-medium">Privacy Policy</button>.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 flex items-center justify-center"
          >
            {loading && <span className="mr-2 animate-spin">⏳</span>}
            {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {isLogin ? t("loginBtn") : t("signupBtn")}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          {isLogin ? (
            <p>
              {t("noAccount")}{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                {t("signup")}
              </button>
            </p>
          ) : (
            <p>
              {t("haveAccount")}{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                {t("login")}
              </button>
            </p>
          )}
        </div>
      </div>

      <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}

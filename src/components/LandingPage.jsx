import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, TrendingUp, Target, CheckCircle, 
  BarChart3, Clock, Users, Sparkles
} from 'lucide-react';

const LandingPage = ({ language, onShowAuth, onNavigate }) => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [isThreeJsLoaded, setIsThreeJsLoaded] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  
  const t = (key) => {
    const translations = {
      en: {
        subtitle: "Professional AI Video Intelligence for Creators",
        tagline: "Turn any video into viral content with AI insights",
        startFree: "Start Free Trial",
        analyzeVideo: "Analyze Your Video",
        features: "Powerful Features",
        featuresSubtitle: "Everything you need to create viral content",
        deepAnalysis: "Deep Video Analysis",
        deepAnalysisDesc: "Comprehensive AI-powered analysis of emotions, objects, scenes, audio, and visual elements. Get professional-grade insights in seconds.",
        insightRecommendation: "Video Insight Recommendations",
        insightRecommendationDesc: "Receive personalized recommendations based on analysis data to improve your content's viral potential and engagement.",
        platformRecommendation: "Best Platform Recommendations",
        platformRecommendationDesc: "AI determines the optimal platforms for your content (TikTok, YouTube, Instagram, etc.) based on performance metrics.",
        trainAiTitle: "AI Learning",
        trainAiDesc: "Our AI continuously learns from analysis data gathered from video insights to provide better recommendations. Your videos are not stored - only aggregated analysis metrics are used for model improvement.",
      },
      fr: {
        subtitle: "Intelligence Vidéo IA Professionnelle pour Créateurs",
        tagline: "Transformez vos vidéos en contenu viral grâce à l'IA",
        startFree: "Commencer Gratuitement",
        analyzeVideo: "Analyser votre Vidéo",
        features: "Fonctionnalités Puissantes",
        featuresSubtitle: "Tout ce dont vous avez besoin pour créer du contenu viral",
        deepAnalysis: "Analyse Vidéo Approfondie",
        deepAnalysisDesc: "Analyse complète alimentée par l'IA des émotions, objets, scènes, audio et éléments visuels. Obtenez des insights professionnels en secondes.",
        insightRecommendation: "Recommandations d'Insights Vidéo",
        insightRecommendationDesc: "Recevez des recommandations personnalisées basées sur les données d'analyse pour améliorer le potentiel viral et l'engagement de votre contenu.",
        platformRecommendation: "Meilleures Recommandations de Plateforme",
        platformRecommendationDesc: "L'IA détermine les plateformes optimales pour votre contenu (TikTok, YouTube, Instagram, etc.) basé sur les métriques de performance.",
        trainAiTitle: "Apprentissage IA",
        trainAiDesc: "Notre IA apprend continuellement à partir des données d'analyse recueillies à partir des insights vidéo pour fournir de meilleures recommandations. Vos vidéos ne sont pas stockées - seules les métriques d'analyse agrégées sont utilisées pour l'amélioration du modèle.",
      },
      tr: {
        subtitle: "İçerik Üreticileri için Profesyonel AI Video İstihbaratı",
        tagline: "Herhangi bir videoyu AI içgörüleriyle viral içeriğe dönüştürün",
        startFree: "Ücretsiz Başla",
        analyzeVideo: "Videonuzu Analiz Edin",
        features: "Güçlü Özellikler",
        featuresSubtitle: "Viral içerik oluşturmak için ihtiyacınız olan her şey",
        deepAnalysis: "Derin Video Analizi",
        deepAnalysisDesc: "Duygular, nesneler, sahneler, ses ve görsel öğelerin kapsamlı AI destekli analizi. Saniyeler içinde profesyonel düzeyde içgörüler elde edin.",
        insightRecommendation: "Video İçgörü Önerileri",
        insightRecommendationDesc: "İçeriğinizin viral potansiyelini ve etkileşimini artırmak için analiz verilerine dayalı kişiselleştirilmiş öneriler alın.",
        platformRecommendation: "En İyi Platform Önerileri",
        platformRecommendationDesc: "AI, performans metriklerine dayanarak içeriğiniz için en uygun platformları (TikTok, YouTube, Instagram, vb.) belirler.",
        trainAiTitle: "AI Öğrenme",
        trainAiDesc: "AI'mız, daha iyi öneriler sunmak için video içgörülerinden toplanan analiz verilerinden sürekli öğrenir. Videolarınız saklanmaz - yalnızca toplu analiz metrikleri model iyileştirmesi için kullanılır.",
      }
    };
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Load Three.js dynamically
  useEffect(() => {
    const loadThreeJs = async () => {
      if (window.THREE) {
        setIsThreeJsLoaded(true);
        return;
      }
      
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.async = true;
        script.onload = () => setIsThreeJsLoaded(true);
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Three.js:', error);
      }
    };
    
    loadThreeJs();
  }, []);

  // Initialize 3D background with deep room effect
  useEffect(() => {
    if (!isThreeJsLoaded || !canvasRef.current || !window.THREE) return;

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // Colorful palette for shapes
    const colors = [
      0x667eea, // Indigo
      0x764ba2, // Purple
      0xf093fb, // Pink
      0x4facfe, // Blue
      0x00f2fe, // Cyan
      0x43e97b, // Green
      0xfa709a, // Rose
      0xfeca57, // Yellow
      0xff6b6b, // Red
      0xa855f7, // Violet
    ];

    // Create geometric shapes at different depths for deep room effect
    const geometries = [
      new window.THREE.IcosahedronGeometry(1, 0),
      new window.THREE.OctahedronGeometry(1, 0),
      new window.THREE.TetrahedronGeometry(1, 0),
      new window.THREE.BoxGeometry(1, 1, 1),
    ];
    
    const shapes = [];
    const shapeCount = 25; // More shapes for depth perception
    
    for (let i = 0; i < shapeCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Create material with gradient-like effect and higher opacity
      const material = new window.THREE.MeshBasicMaterial({ 
        color: color,
        wireframe: Math.random() > 0.5, // Mix wireframe and filled
        opacity: 0.25 + Math.random() * 0.3, // Vary opacity for depth
        transparent: true,
        side: window.THREE.DoubleSide
      });
      
      const mesh = new window.THREE.Mesh(geometry, material);
      
      // Create deep room effect with varied z positions (-50 to 50)
      const depth = (Math.random() - 0.5) * 100; // Wider z-range for depth
      const size = 0.5 + Math.random() * 1.5; // Vary sizes
      mesh.scale.set(size, size, size);
      
      mesh.position.set(
        (Math.random() - 0.5) * 30, // Wider spread
        (Math.random() - 0.5) * 30,
        depth // Deep room effect
      );
      
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Store original positions for floating animation
      mesh.userData = {
        originalY: mesh.position.y,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002,
          z: (Math.random() - 0.5) * 0.002
        },
        floatSpeed: 0.0005 + Math.random() * 0.001,
        floatAmplitude: 0.5 + Math.random() * 1.5
      };
      
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Position camera for deep room perspective
    camera.position.z = 15;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    // Animation with floating effect
    let animationId;
    const startTime = Date.now();
    
    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsed = Date.now() - startTime;
      
      shapes.forEach((shape, i) => {
        // Rotation at different speeds
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        
        // Floating animation - different phases for each shape
        shape.position.y = shape.userData.originalY + 
          Math.sin(elapsed * shape.userData.floatSpeed + i) * shape.userData.floatAmplitude;
        
        // Subtle forward/backward movement for parallax
        shape.position.z += Math.sin(elapsed * 0.0003 + i) * 0.02;
        
        // Parallax effect based on depth - closer objects move more
        const depthFactor = (shape.position.z + 50) / 100; // Normalize -50 to 50 range
        shape.position.x += Math.sin(elapsed * 0.0002 + i * 0.5) * 0.01 * (1 - depthFactor);
      });
      
      renderer.render(scene, camera);
    }
    animate();

    // Window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (canvasRef.current && renderer.domElement.parentNode) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isThreeJsLoaded]);

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.index) {
          setVisibleCards(prev => {
            if (!prev.includes(entry.target.dataset.index)) {
              return [...prev, entry.target.dataset.index];
            }
            return prev;
          });
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // Mouse move effect on feature cards
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
      });
    };
  }, [visibleCards]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only 3 key features
  const features = [
    {
      icon: <Brain className="w-16 h-16 text-indigo-600" strokeWidth={2} />,
      title: t('deepAnalysis'),
      description: t('deepAnalysisDesc')
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-purple-600" strokeWidth={2} />,
      title: t('insightRecommendation'),
      description: t('insightRecommendationDesc')
    },
    {
      icon: <Target className="w-16 h-16 text-pink-600" strokeWidth={2} />,
      title: t('platformRecommendation'),
      description: t('platformRecommendationDesc')
    }
  ];


  // Social media logos - using larger SVG icons
  const socialPlatforms = [
    { 
      name: 'tiktok', 
      delay: 0, 
      top: '15%', 
      left: '8%', 
      x: '100px', 
      y: '-50px',
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    },
    { 
      name: 'youtube', 
      delay: 2, 
      top: '25%', 
      right: '12%', 
      x: '-80px', 
      y: '60px',
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: 'instagram', 
      delay: 4, 
      bottom: '28%', 
      left: '12%', 
      x: '120px', 
      y: '-70px',
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'linkedin', 
      delay: 6, 
      bottom: '22%', 
      right: '18%', 
      x: '-100px', 
      y: '80px',
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#0077B5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      name: 'twitter', 
      delay: 8, 
      top: '38%', 
      left: '22%', 
      x: '90px', 
      y: '-40px',
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Hero Section with 3D Background */}
      <section className="hero relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 via-gray-50 to-slate-100">
        <div ref={canvasRef} id="canvas-container" className="absolute inset-0 z-0" />
        
        {/* Floating Social Media Icons - Bigger */}
        <div className="platforms-showcase absolute inset-0 w-full h-full pointer-events-none z-10">
          {socialPlatforms.map((platform, index) => (
            <div
              key={index}
              className="platform-icon absolute w-20 h-20 rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur-lg border border-gray-200 shadow-xl animate-float-random opacity-0"
              style={{
                [platform.top ? 'top' : 'bottom']: platform.top || platform.bottom,
                [platform.left ? 'left' : 'right']: platform.left || platform.right,
                '--x': platform.x,
                '--y': platform.y,
                animationDelay: `${platform.delay}s`,
              }}
            >
              <div className="w-12 h-12">
                {platform.svg}
              </div>
            </div>
          ))}
        </div>
        
        <div className="hero-content relative z-20 text-center px-8 max-w-6xl mx-auto">
          <div className="logo-3d mb-8 mx-auto w-48 h-48 flex items-center justify-center animate-float">
            <img 
              src="/logo.png" 
              alt="Viral Pilot Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 futuristic-3d-text-enhanced animate-slide-in-top">
            {t('subtitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto animate-slide-in-bottom">
            {t('tagline')}
          </p>
          <div className="cta-buttons flex gap-6 justify-center flex-wrap animate-fade-in">
            <button 
              onClick={() => user ? onNavigate('upload') : onShowAuth()}
              className="btn-liquid-glass px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {user ? t('analyzeVideo') : t('startFree')}
            </button>
          </div>
        </div>
      </section>

      {/* Insights Preview */}
      <div className="insights-preview fixed top-1/2 right-5 transform -translate-y-1/2 z-30 hidden lg:flex flex-col gap-4 animate-slide-in-right">
        {[
          { title: "Emotion Analysis", value: "87% Positive" },
          { title: "Optimal Length", value: "Cut to 47s" },
          { title: "Best Platform", value: "TikTok - 92%" }
        ].map((insight, index) => (
          <div
            key={index}
            className="insight-popup bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-md rounded-2xl p-4 max-w-xs shadow-xl text-white transform translate-x-96 opacity-0"
            style={{
              animation: `insight-slide 15s ease-in-out infinite`,
              animationDelay: `${index * 3}s`
            }}
          >
            <h4 className="text-sm font-medium mb-1 opacity-90">{insight.title}</h4>
            <p className="text-lg font-bold">{insight.value}</p>
          </div>
        ))}
      </div>

      {/* Features Section - Only 3 Features */}
      <section className="features py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-black mb-4 futuristic-3d-text-enhanced">
          {t('features')}
        </h2>
        <p className="text-center text-gray-600 text-xl mb-12">
          {t('featuresSubtitle')}
        </p>
        
        <div className="features-grid grid md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`feature-card bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-300 relative overflow-hidden group ${
                visibleCards.includes(String(index)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="feature-icon mb-6 flex items-center justify-center w-20 h-20">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl group-hover:scale-110 transition-transform border border-indigo-100">
                  {feature.icon}
                </div>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4 futuristic-3d-text-enhanced-small">
                {feature.title}
              </h3>
              <p className="feature-description text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Learning Section - More Subtle */}
      <section className="ai-learning py-16 px-6 bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-indigo-600 opacity-60" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('trainAiTitle')}</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {t('trainAiDesc')}
            </p>
          </div>
        </div>
      </section>


      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateY(0); }
          50% { transform: translateY(-20px) rotateY(180deg); }
        }
        
        @keyframes float-random {
          0%, 100% { 
                transform: translate(0, 0) scale(1);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            50% { 
                transform: translate(var(--x), var(--y)) scale(1.2);
                opacity: 0.8;
            }
            90% {
                opacity: 1;
            }
        }
        
        @keyframes slide-in-top {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-bottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes insight-slide {
          0%, 85%, 100% { 
            transform: translateX(400px);
            opacity: 0;
          }
          10%, 75% { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-random {
          animation: float-random 20s ease-in-out infinite;
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 1s ease-out;
        }
        
        .animate-slide-in-bottom {
          animation: slide-in-bottom 1s ease-out 0.2s both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out 1s both;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out 0.4s both;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(102, 126, 234, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .feature-card:hover::before {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .insights-preview {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

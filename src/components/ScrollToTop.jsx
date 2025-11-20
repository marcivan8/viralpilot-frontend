import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Get scroll position - try multiple methods for compatibility
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0;
      
      // Show button when page is scrolled down
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      // Check if we're at the bottom
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      setIsAtBottom(distanceFromBottom < 50); // Within 50px of bottom
      
      // Calculate scroll progress
      const height = scrollHeight - clientHeight;
      if (height > 0) {
        const scrolled = (scrollTop / height) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));
      } else {
        setScrollProgress(0);
      }
    };

    const handleScroll = () => {
      setIsScrolling(true);
      toggleVisibility();
      
      // Reset scrolling state after scroll ends
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Initial check
    toggleVisibility();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen to resize to recalculate
    window.addEventListener('resize', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', toggleVisibility);
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      // Fallback for browsers that don't support smooth scroll
      if (!('scrollBehavior' in document.documentElement.style)) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    } catch (error) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    try {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      window.scrollTo({
        top: scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
      // Fallback
      if (!('scrollBehavior' in document.documentElement.style)) {
        document.documentElement.scrollTop = scrollHeight;
        document.body.scrollTop = scrollHeight;
      }
    } catch (error) {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      document.documentElement.scrollTop = scrollHeight;
      document.body.scrollTop = scrollHeight;
    }
  };

  const scrollDown = () => {
    try {
      const scrollAmount = window.innerHeight * 0.8;
      window.scrollBy({
        top: scrollAmount,
        left: 0,
        behavior: 'smooth'
      });
      // Fallback
      if (!('scrollBehavior' in document.documentElement.style)) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        window.scrollTo(0, currentScroll + scrollAmount);
      }
    } catch (error) {
      const scrollAmount = window.innerHeight * 0.8;
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      window.scrollTo(0, currentScroll + scrollAmount);
    }
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {isVisible && !isAtBottom && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-fade-in"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
      
      {/* Scroll to Bottom Button (when scrolled down but not at bottom) */}
      {isVisible && !isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-50 p-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group border border-gray-200"
          aria-label="Scroll to bottom"
          title="Go to bottom"
        >
          <ChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <ChevronDown className="w-5 h-5 -mt-1 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Scroll Down/Bottom Buttons */}
      {!isVisible && !isScrolling && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
          <button
            onClick={scrollDown}
            className="p-4 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce-vertical border border-gray-200"
            aria-label="Scroll down"
            title="Scroll down"
          >
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={scrollToBottom}
            className="p-3 bg-indigo-100/80 backdrop-blur-sm hover:bg-indigo-200 text-indigo-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border border-indigo-200"
            aria-label="Scroll to bottom"
            title="Go to bottom"
          >
            <ChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ChevronDown className="w-5 h-5 -mt-2 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150"
          style={{
            width: `${scrollProgress}%`
          }}
        />
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-vertical {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-bounce-vertical {
          animation: bounce-vertical 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ScrollToTop;


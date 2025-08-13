import React from 'react';
import { Zap } from 'lucide-react';

// Si vous avez un logo PNG, décommentez et utilisez cette version:
/*
import logoImg from '../assets/logo.png';

const Logo = ({ size = 'md', className = '', showText = true }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={logoImg} 
        alt="Viral Pilot Logo" 
        className={`${sizes[size]} w-auto`}
      />
      {showText && (
        <span className="text-xl font-bold text-gray-900">Viral Pilot</span>
      )}
    </div>
  );
};
*/

// Version avec icône Lucide (temporaire jusqu'à ce que vous ajoutiez votre logo PNG)
const Logo = ({ size = 'md', className = '', showText = true }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`bg-indigo-600 rounded-md flex items-center justify-center ${sizes[size]}`}>
        <Zap className={`text-white ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`} />
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizes[size]}`}>
          Viral Pilot
        </span>
      )}
    </div>
  );
};

export default Logo;
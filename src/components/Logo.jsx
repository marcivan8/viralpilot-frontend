import React from 'react';

// Logo component using logo.png
const Logo = ({ size = 'md', className = '', showText = true }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-32 h-32'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Viral Pilot Logo" 
        className={`object-contain ${sizes[size]}`}
      />
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizes[size]}`}>
          Viral Pilot
        </span>
      )}
    </div>
  );
};

export default Logo;
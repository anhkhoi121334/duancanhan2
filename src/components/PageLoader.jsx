import React, { useEffect, useState } from 'react';
import logoAnkh from '@assets/logoankh.png';
import '../index.css';

/**
 * PageLoader Component
 * Modern loading animation with brand colors
 */
const PageLoader = ({ duration = 1500, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-white"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      {/* Spinner ring */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
        {/* Outer spinning ring */}
        <div className="page-loader-spinner"></div>
        
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={logoAnkh} 
            alt="ANKH Logo" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain page-loader-logo"
          />
        </div>
      </div>
      
      {/* Loading dots */}
      <div className="flex items-center gap-2">
        <div className="page-loader-dot dot-1"></div>
        <div className="page-loader-dot dot-2"></div>
        <div className="page-loader-dot dot-3"></div>
      </div>
    </div>
  );
};

export default PageLoader;


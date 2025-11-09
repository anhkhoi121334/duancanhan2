import React, { useState, useEffect } from 'react';

const TypewriterText = ({ 
  text, 
  speed = 100, 
  delay = 0,
  className = '',
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset animation when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Handle initial delay
  useEffect(() => {
    if (delay > 0 && displayedText === '') {
      const delayTimer = setTimeout(() => {
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(delayTimer);
    }
  }, [delay, displayedText]);

  // Typing animation
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, text, speed, isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse text-white">|</span>
      )}
    </span>
  );
};

export default TypewriterText;


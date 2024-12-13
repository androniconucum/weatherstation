import React from 'react';
import { motion } from 'framer-motion';

// Component to create a flickering danger effect
const DangerIndicator = ({ 
  isRisky, 
  children, 
  dangerThreshold, 
  currentValue, 
  className = '' 
}) => {
  // Determine if the current value exceeds the danger threshold
  const isDangerous = currentValue > dangerThreshold;

  // Animation variants for the flickering effect
  const flickerVariants = {
    normal: { 
      opacity: 1, 
      scale: 1,
      boxShadow: '0 0 0px rgba(0,0,0,0)'
    },
    danger: { 
      opacity: [1, 0.5, 1, 0.7, 1],
      scale: [1, 1.02, 1, 1.01, 1],
      boxShadow: [
        '0 0 0px rgba(255,0,0,0)',
        '0 0 10px rgba(255,0,0,0.5)',
        '0 0 0px rgba(255,0,0,0)',
        '0 0 5px rgba(255,0,0,0.3)',
        '0 0 0px rgba(255,0,0,0)'
      ],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={flickerVariants}
      animate={isDangerous ? 'danger' : 'normal'}
      className={`
        ${className}
        ${isDangerous ? 'border-2 border-red-500 bg-red-50' : ''}
        transition-all duration-300 ease-in-out
      `}
    >
      {children}
      {isDangerous && (
        <div className="absolute top-0 right-0 m-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              transition: { 
                duration: 1,
                repeat: Infinity 
              }
            }}
            className="text-red-600 font-bold text-xs"
          >
            ⚠️ DANGER
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DangerIndicator;
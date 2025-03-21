import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LightningEffect: React.FC = () => {
  const [lightnings, setLightnings] = useState<{ id: number; position: string }[]>([]);

  useEffect(() => {
    const createLightning = () => {
      const positions = [
        'top-0 left-0 rotate-45',
        'top-0 right-0 -rotate-45',
        'bottom-0 left-0 -rotate-45',
        'bottom-0 right-0 rotate-45'
      ];
      
      const newLightning = {
        id: Date.now(),
        position: positions[Math.floor(Math.random() * positions.length)]
      };

      setLightnings(prev => [...prev, newLightning]);
      setTimeout(() => {
        setLightnings(prev => prev.filter(l => l.id !== newLightning.id));
      }, 200);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of lightning
        createLightning();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {lightnings.map(({ id, position }) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`absolute w-32 h-1 bg-gradient-to-r from-blue-400 to-transparent ${position}`}
          style={{ filter: 'blur(2px)' }}
        />
      ))}
    </AnimatePresence>
  );
};
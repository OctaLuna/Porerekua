import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useSoundManager } from '../../utils/SoundManager';

interface BirdProps {
  species: string;
  isFlying: boolean;
  onInteraction?: () => void;
}

// Definimos las variantes de animación para el ave
const birdVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: { // Estado inicial "posado"
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
  flying: { // Estado de "vuelo"
    opacity: 0,
    scale: 1.2, // El ave se agranda un poco antes de desaparecer
    y: -250, // Vuela hacia arriba
    x: -300, // Vuela hacia la izquierda
    rotate: -25, // Se inclina hacia la izquierda al volar
    transition: {
      duration: 1.5,
      ease: "easeIn",
    },
  },
  hover: { // Estado de hover con micro-animaciones
    scale: 1.05,
    y: -2,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const Bird: React.FC<BirdProps> = ({ species, isFlying, onInteraction }) => {
  const { playInteractive } = useSoundManager();
  const animationState = isFlying ? 'flying' : 'visible';

  const handleInteraction = () => {
    console.log('🦜 Interacción con ave:', species);
    // Reproducir sonido de aleteo
    playInteractive('birdFlutter');
    
    // Llamar callback adicional si existe
    onInteraction?.();
  };

  return (
    <motion.div
      className="absolute cursor-pointer w-16 h-16 gpu-optimized will-change-transform"
      style={{ willChange: 'transform, opacity' }}
      variants={birdVariants}
      initial="hidden"
      animate={animationState}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      onClick={handleInteraction}
      onMouseEnter={handleInteraction}
    >
      <img 
        src={`/assets/background/birds/${species}.svg`} 
        alt={`Ave ${species}`} 
        className="w-full h-full select-none"
        draggable={false}
      />
    </motion.div>
  );
};

export default Bird;
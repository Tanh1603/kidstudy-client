// components/memory-card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Lightbulb } from 'lucide-react';

export interface CardType {
  id: string;
  wordId: number;
  type: 'image' | 'text';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardProps {
  card: CardType;
  onClick: (card: CardType) => void;
  imageAltText?: string;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, onClick, imageAltText }) => {
  // Define common transition properties for a smoother spring animation
  const flipTransition = {
    type: "spring",
    stiffness: 300, // Controls the "strength" of the spring. Higher = faster to target.
    damping: 25,    // Controls how much the spring oscillates. Lower = more bouncy.
    mass: 1,        // Controls the weight of the animating element. Higher = slower to react.
    // You can adjust these values to fine-tune the feel.
    // Experiment with stiffness (higher for snappier), damping (lower for more bounce).
  };

  return (
    <motion.div
      className={`relative w-25 h-25 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer transform transition-all duration-300
        ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'scale-100'}
      `}
      onClick={() => onClick(card)}
      // Set perspective on the parent to enable 3D transform for the flip
      style={{ perspective: 1000 }}
      // Small scale effect on hover for better user feedback
      whileHover={{ scale: card.isMatched ? 0.9 : 1.05 }}
    >
      {/* Card Front (Content - Image or Text) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-white rounded-lg backface-hidden"
        // Animate the rotation: 0 degrees when flipped, 180 degrees when unflipped (hidden)
        animate={{ rotateY: card.isFlipped ? 0 : 180 }}
        transition={flipTransition} // Apply the smooth spring transition
        // Z-index ensures the currently visible side is on top during the flip
        style={{ zIndex: card.isFlipped ? 2 : 1 }}
      >
        {card.type === 'image' ? (
          <Image
            src={card.content}
            alt={imageAltText || "Memory Card Image"}
            width={80} // Adjust width and height as needed for image content
            height={80}
            objectFit="contain" // Ensures image scales within its container without cropping
          />
        ) : (
          <span className="text-xl md:text-2xl font-bold text-gray-800 uppercase text-center p-2">
            {card.content}
          </span>
        )}
      </motion.div>

      {/* Card Back (Cover - Lightbulb) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-yellow-500 rounded-lg text-white font-bold text-3xl backface-hidden"
        // Animate the rotation: 180 degrees when flipped (hidden), 0 degrees when unflipped (visible)
        animate={{ rotateY: card.isFlipped ? 180 : 0 }}
        transition={flipTransition} // Apply the same smooth spring transition
        // Z-index ensures the currently visible side is on top during the flip
        style={{ zIndex: card.isFlipped ? 1 : 2 }}
      >
        <Lightbulb className="w-12 h-12 text-yellow-100" />
      </motion.div>
    </motion.div>
  );
};

export default MemoryCard;
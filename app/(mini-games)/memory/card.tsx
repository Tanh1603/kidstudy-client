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
  return (
    <motion.div
      className={`relative w-28 h-28 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer transform transition-all duration-300
        ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'scale-100'}
      `}
      onClick={() => onClick(card)}
      // Removed initial/animate from the parent, now only the perspective is here.
      // This allows the front/back children to control their own rotation more directly.
      style={{ perspective: 1000 }}
      whileHover={{ scale: card.isMatched ? 0.9 : 1.05 }}
    >
      {/* Card Front (Content - Image or Text) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-white rounded-lg backface-hidden"
        // Animate the front: if flipped, show (rotateY: 0), else hide (rotateY: 180)
        animate={{ rotateY: card.isFlipped ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        // Set z-index to bring the front forward when it's visible
        style={{ zIndex: card.isFlipped ? 2 : 1 }}
      >
        {card.type === 'image' ? (
          <Image
            src={card.content}
            alt={imageAltText || "Memory Card Image"}
            width={80}
            height={80}
            objectFit="contain"
          />
        ) : (
          <span className="text-xl md:text-2xl font-bold text-gray-800 uppercase text-center p-2">
            {card.content}
          </span>
        )}
      </motion.div>

      {/* Card Back (Cover - Lightbulb) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-blue-500 rounded-lg text-white font-bold text-3xl backface-hidden"
        // Animate the back: if flipped, hide (rotateY: 180), else show (rotateY: 0)
        animate={{ rotateY: card.isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        // Set z-index to bring the back forward when it's visible
        style={{ zIndex: card.isFlipped ? 1 : 2 }}
      >
        <Lightbulb className="w-12 h-12 text-blue-100" />
      </motion.div>
    </motion.div>
  );
};

export default MemoryCard;
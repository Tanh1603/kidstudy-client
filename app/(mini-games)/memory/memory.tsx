// app/(mini-games)/memory/game.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Ensure motion and AnimatePresence are imported
import { Header } from "@/components/ui/header-game";
import GameEndScreen from "./game-end-screen";
import { shuffleArray } from "@/lib/utils";
// import MemoryCard, { CardType } from "./card"; // REMOVED: We're defining MemoryCard directly now
import { Footer } from "@/components/ui/footer-game";
import { Lightbulb } from 'lucide-react'; // NEW: Import Lightbulb icon

// --- MemoryCard Component Definition (Moved from ./card.tsx) ---
// Define CardType and MemoryCardProps interfaces here if not already in a shared type file
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
  };

  return (
    <motion.div
      className={`relative w-25 h-25 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer transform transition-all duration-300
        ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'scale-100'}
      `}
      onClick={() => onClick(card)}
      style={{ perspective: 1000 }}
      whileHover={{ scale: card.isMatched ? 0.9 : 1.05 }}
    >
      {/* Card Front (Content - Image or Text) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-white rounded-lg backface-hidden"
        animate={{ rotateY: card.isFlipped ? 0 : 180 }}
        transition={flipTransition}
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
        className="absolute inset-0 flex items-center justify-center bg-yellow-500 rounded-lg text-white font-bold text-3xl backface-hidden"
        animate={{ rotateY: card.isFlipped ? 180 : 0 }}
        transition={flipTransition}
        style={{ zIndex: card.isFlipped ? 1 : 2 }}
      >
        <Lightbulb className="w-12 h-12 text-yellow-100" />
      </motion.div>
    </motion.div>
  );
};
// --- End MemoryCard Component Definition ---


type WordData = {
  id: number;
  word: string;
  image: string;
};

const words: WordData[] = [
  { id: 1, word: "CAT", image: "/animation/cat.jpg" },
  { id: 2, word: "DOG", image: "/animation/dog.jpg" },
  { id: 3, word: "BIRD", image: "/images/bird.png" },
  { id: 4, word: "FISH", image: "/images/fish.png" },
  { id: 5, word: "APPLE", image: "/images/apple.png" },
  { id: 6, word: "BANANA", image: "/images/banana.png" },
  { id: 7, word: "CARROT", image: "/images/carrot.png" },
  { id: 8, word: "HOUSE", image: "/images/house.png" },
  { id: 9, word: "TREE", image: "/images/tree.png" },
  { id: 10, word: "SUN", image: "/images/sun.png" },
];

const totalPairs = words.length;
const generateMemoryCards = (wordData: WordData[]): CardType[] => {
  let cards: CardType[] = [];
  wordData.forEach((item) => {
    cards.push({
      id: `${item.id}-image-${Math.random()}`,
      wordId: item.id,
      type: 'image',
      content: item.image,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `${item.id}-text-${Math.random()}`,
      wordId: item.id,
      type: 'text',
      content: item.word,
      isFlipped: false,
      isMatched: false,
    });
  });
  return shuffleArray(cards);
};

const Game = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    restartGame();
  }, []);

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setIsRunning(false);
      setHasWon(true);
      setIsGameOver(true);
    }
  }, [matchedPairs, totalPairs]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleCardClick = useCallback((clickedCard: CardType) => {
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }

    setMoves(prev => prev + 1);

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards((prevFlipped) => {
      const newFlipped = [...prevFlipped, clickedCard];

      if (newFlipped.length === 2) {
        const [firstCard, secondCard] = newFlipped;

        if (firstCard.wordId === secondCard.wordId) {
          setMatchedPairs((prev) => prev + 1);
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setFlippedCards([]);
        } else {
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === firstCard.id || card.id === secondCard.id
                  ? { ...card, isFlipped: false }
                  : card
              )
            );
            setFlippedCards([]);
          }, 1000);
        }
      }
      return newFlipped;
    });
  }, [flippedCards]);

  const restartGame = () => {
    setIsGameOver(false);
    setMatchedPairs(0);
    setMoves(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
    setFlippedCards([]);
    setCards(generateMemoryCards(words));
  };

  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative"
      style={{
        backgroundImage: "url('/animation/anagram-bg.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-5 z-0"></div>

      <Header
        currentWordIndex={matchedPairs}
        totalWords={totalPairs}
      />

      <div className="relative z-10 flex flex-col items-center w-full flex-grow overflow-x-hidden">
        {isGameOver ? (
          <GameEndScreen
            score={matchedPairs}
            time={time}
            onRestart={restartGame}
            hasWon={hasWon}
          />
        ) : (
          <>
            <div
              className="flex flex-col items-center flex-grow mx-auto w-fit
                         min-w-[380px] md:min-w-[700px] lg:min-w-[900px] max-w-full
                         px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8
                         md:flex-row justify-center gap-4 md:gap-6 lg:gap-8
                         mt-8 mb-8 p-4 md:p-6 rounded-xl shadow-2xl relative "
              style={{
                backgroundImage: "url('/animation/anagram-bg2.jpg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "local",
              }}
            >
              <div className="absolute inset-0 bg-white opacity-10 rounded-xl z-10"></div>

              <div className="relative z-20 flex flex-col items-center gap-3 order-first md:order-last flex-shrink">
                  {/* UPDATED TIMER CONTAINER */}
                  <div
                      className="relative w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[350px] aspect-video mb-3 rounded-lg overflow-hidden"
                      style={{
                          backgroundImage: "url('/animation/timer-background.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                      }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white text-game-display">
                              {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                          </div>
                      </div>
                  </div>

                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-yellow-400 text-game-display mb-1">
                      Moves: {moves}
                  </div>

                  {/* UPDATED MATCHED PAIRS CONTAINER */}
                  <div
                      className="relative w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[350px] aspect-video mb-3 rounded-lg overflow-hidden"
                      style={{
                          backgroundImage: "url('/animation/score-board.png')",
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                      }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white text-game-display">
                            {matchedPairs}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="relative z-20 flex-grow grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 bg-gray-100 rounded-lg shadow-inner max-w-4xl mx-auto">
                <AnimatePresence>
                  {cards.map((card) => (
                    <MemoryCard
                      key={card.id}
                      card={card}
                      onClick={handleCardClick}
                      imageAltText={words.find(w => w.id === card.wordId)?.word || "Memory Card"}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Game;
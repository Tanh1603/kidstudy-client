import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/ui/header-game";
import GameEndScreen from "./game-end-screen";
import { shuffleArray } from "@/lib/utils";
import MemoryCard, { CardType } from "./card"; // Assuming './card' is the path to your MemoryCard component

// Update this section in your Game.tsx
type WordData = {
  id: number;
  word: string;
  image: string;
};

// Expanded words array for 10 pairs (20 cards for 4x5 grid)
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
  // Add more unique words (total of 10 for 20 cards)
];

const totalPairs = words.length; // This will be 10 for our 4x5 grid
const generateMemoryCards = (wordData: WordData[]): CardType[] => {
  let cards: CardType[] = [];
  wordData.forEach((item) => {
    // Create image card
    cards.push({
      id: `${item.id}-image-${Math.random()}`,
      wordId: item.id,
      type: 'image',
      content: item.image,
      isFlipped: false,
      isMatched: false,
    });
    // Create text card
    cards.push({
      id: `${item.id}-text-${Math.random()}`,
      wordId: item.id,
      type: 'text',
      content: item.word,
      isFlipped: false,
      isMatched: false,
    });
  });
  return shuffleArray(cards); // Shuffle all cards to randomize positions
};

const Game = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardType[]>([]); // Stores up to 2 flipped cards
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0); // Tracks how many turns taken
  const [score, setScore] = useState(0); // Keeping score for GameEndScreen

  const [isGameOver, setIsGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Initialize cards when component mounts or game restarts
  useEffect(() => {
    restartGame(); // Call restartGame to initialize the board on first load
  }, []);

  // Check for game win condition
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setIsRunning(false);
      setHasWon(true);
      setIsGameOver(true);
    }
  }, [matchedPairs, totalPairs]);


  // Timer logic
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

  // Card click handler
  const handleCardClick = useCallback((clickedCard: CardType) => {
    // Ignore clicks if:
    // 1. Two cards are already flipped (waiting for them to flip back)
    // 2. The clicked card is already flipped
    // 3. The clicked card is already matched
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }

    setMoves(prev => prev + 1); // Increment moves

    // Update the clicked card to be flipped
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards((prevFlipped) => {
      const newFlipped = [...prevFlipped, clickedCard];

      if (newFlipped.length === 2) {
        // Two cards are flipped, check for match
        const [firstCard, secondCard] = newFlipped;

        if (firstCard.wordId === secondCard.wordId) {
          // Match found!
          setMatchedPairs((prev) => prev + 1);
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setFlippedCards([]); // Clear flipped cards
        } else {
          // No match, flip them back after a delay
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === firstCard.id || card.id === secondCard.id
                  ? { ...card, isFlipped: false }
                  : card
              )
            );
            setFlippedCards([]); // Clear flipped cards
          }, 1000); // 1-second delay before flipping back
        }
      }
      return newFlipped;
    });
  }, [flippedCards]); // Depend on flippedCards to ensure correct state checking


  // No keyboard event listener needed for memory game usually
  useEffect(() => {
    // No keyboard event listener needed for memory game usually
  }, []);

  const restartGame = () => {
    setIsGameOver(false);
    setScore(0); // Reset score
    setMatchedPairs(0);
    setMoves(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
    setFlippedCards([]);
    setCards(generateMemoryCards(words)); // Generate a new set of shuffled cards
  };

  return (
    <>
      {/* 👈 ADDED 'w-full' to the main container div */}
      <div className="flex flex-col items-center w-full min-h-screen">
        {isGameOver ? (
          <GameEndScreen
            score={matchedPairs} // Score is matched pairs for memory game
            time={time}
            onRestart={restartGame}
            hasWon={hasWon}
          />
        ) : (
          <>
            {/* Header shows matched pairs out of total pairs */}
            <Header
              currentWordIndex={matchedPairs}
              totalWords={totalPairs}
            />

            {/* Main game content area, now with consistent padding */}
            <div className="flex flex-col md:flex-row w-full max-w-6xl items-center justify-around gap-10 mt-8 px-4 py-4 flex-grow">

              {/* Scoreboard and Timer Section */}
              <div className="flex flex-col items-center gap-4 order-first md:order-last min-w-[200px]">

                  {/* Timer Display */}
                  <div className="relative w-[200px] h-[100px] mb-4 overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/animation/timer-background.png"
                          alt="Timer Background"
                          className="object-cover"
                          fill
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold font-mono text-white text-game-display">
                              {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                          </div>
                      </div>
                  </div>

                  {/* Moves Counter */}
                  <div className="text-3xl font-bold font-mono text-yellow-400 text-game-display mb-2">
                      Moves: {moves}
                  </div>

                  {/* Matched Pairs Display */}
                  <div className="relative w-[200px] h-[100px] mb-4 overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/animation/score-board.jpg"
                          alt="Score Board"
                          className="object-contain" fill
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold font-mono text-white text-game-display">
                            {matchedPairs} / {totalPairs}
                          </div>
                      </div>
                  </div>

                  {/* No attempts left counter for memory game typically */}
              </div>


              {/* Memory Card Grid Section */}
              <div className="flex-grow grid grid-cols-4 md:grid-cols-5 gap-3 p-4 bg-gray-100 rounded-lg shadow-inner max-w-4xl mx-auto">
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
            {/* No status messages or submit/reset buttons for memory game */}
          </>
        )}
        {/* Footer is outside the conditional rendering, so it always appears */}
        {/* If you want the footer only when the game is active, move it inside the else block */}
        {/* If you want it only on game over, move it inside the isGameOver block */}
        {/* For full-screen layout, it's often better to have the footer fixed or part of the main flex container */}
        {/* For now, keeping it here at the bottom of the main flex container */}
      </div>
    </>
  );
};

export default Game;
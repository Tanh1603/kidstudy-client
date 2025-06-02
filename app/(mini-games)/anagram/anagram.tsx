'use client';

import { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo

import { motion, AnimatePresence, Reorder } from "framer-motion";
import { AlertTriangle, Lightbulb } from "lucide-react";
import Image from "next/image";


import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer-game";
import { Header } from "@/components/ui/header-game";
import { shuffleArray } from "@/lib/utils";

import GameEndScreen from "./game-end-screen";

// --- NEW PROPS INTERFACES ---
export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM", // Corrected this line
  HARD = "HARD",
}

export enum GameType {
  ANAGRAM = "ANAGRAM",
  // Add other game types like "QUIZ", "MATCHING" etc., if needed
}

// WordData structure remains similar, but reflects incoming prop names
export type GameWordData = {
  id: number;
  word: string; // The correct word
  imageSrc: string; // The path to the image
  letters: string; // The scrambled letters for the anagram
};

interface GameProps {
  topicId: number;
  difficulty: Difficulty;
  gameType: GameType;
  words: GameWordData[]; // Array of words for this specific game
}
// --- END NEW PROPS INTERFACES ---


const MAX_INCORRECT_ATTEMPTS = 5;

// Accept GameProps here
const Game = ({ words: initialWordsData }: GameProps) => {
  // --- STATE DECLARATIONS (MUST BE AT THE TOP) ---
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswerLetters, setUserAnswerLetters] = useState<
    { letter: string; originalIndex: number; id: string }[]
  >([]);
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [incorrect, setIncorrect] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  // --- END STATE DECLARATIONS ---

  // Use memo to ensure typedWords reference stability if initialWordsData doesn't change
  const typedWords: GameWordData[] = useMemo(() => initialWordsData, [initialWordsData]);

  // Derived state: currentWord
  // This will be undefined if typedWords is empty or index is out of bounds
  const currentWord = useMemo(() => typedWords[currentWordIndex], [typedWords, currentWordIndex]);

  // Effect to initialize letters for the current word
  useEffect(() => {
    // Only proceed if a currentWord exists and game is not over/won
    if (currentWord && !isGameOver && !hasWon) {
      const initialLetters = currentWord.letters.split('').map((letter, index) => ({
        letter,
        originalIndex: index,
        id: `${currentWord.id}-${index}-${letter}`,
      }));
      setUserAnswerLetters(shuffleArray(initialLetters));
      setStatus("none");
      // Start timer only on the very first word of the game
      if (currentWordIndex === 0 && typedWords.length > 0) { // Check typedWords length as well
        setTime(0);
        setIsRunning(true);
      }
    } else if (!currentWord && currentWordIndex === 0 && typedWords.length === 0) {
      // If there are no words provided at all, stop running and mark game over.
      // This handles the edge case where the component receives an empty `words` array.
      setIsRunning(false);
      setIsGameOver(true);
      setHasWon(false); // Can't win if no words
    }
  }, [currentWordIndex, currentWord, isGameOver, hasWon, typedWords.length]); // Depend on currentWord object and typedWords.length


  // Timer effect
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

  // Memoized submit handler
  const handleSubmit = useCallback(() => {
    if (!currentWord) return; // Prevent submission if no current word

    const userWord = userAnswerLetters.map((item) => item.letter).join("");

    if (userWord === currentWord.word) {
      setStatus("correct");
      setScore((prevScore) => prevScore + 1);

      if (currentWordIndex === typedWords.length - 1) {
        setIsRunning(false);
        setHasWon(true);
        setIsGameOver(true);
      } else {
        setTimeout(() => {
          setCurrentWordIndex((prevIndex) => prevIndex + 1);
        }, 1000);
      }
    } else {
      setStatus("wrong");
      setIncorrect((prev) => {
        const newAttempt = prev + 1;
        if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
          setIsGameOver(true);
          setIsRunning(false);
        }
        return newAttempt;
      });
    }
  }, [userAnswerLetters, currentWord, currentWordIndex, typedWords.length]);

  // Memoized reset handler
  const handleReset = useCallback(() => {
    if (!currentWord) return; // Prevent reset if no current word
    const initialLetters = currentWord.letters.split('').map((letter, index) => ({
      letter,
      originalIndex: index,
      id: `${currentWord.id}-${index}-${letter}`,
    }));
    setUserAnswerLetters(shuffleArray(initialLetters));
    setStatus("none");
  }, [currentWord]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isGameOver && !hasWon) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSubmit, isGameOver, hasWon]);

  // Memoized restart game handler
  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setCurrentWordIndex(0);
    setIncorrect(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);

    // Re-initialize letters for the first word in the new game
    if (typedWords.length > 0) {
      const firstWord = typedWords[0];
      const initialLetters = firstWord.letters.split('').map((letter, index) => ({
        letter,
        originalIndex: index,
        id: `${firstWord.id}-${index}-${letter}`,
      }));
      setUserAnswerLetters(shuffleArray(initialLetters));
      setStatus("none"); // Reset status on restart
    } else {
      // If no words available after restart, ensure game over state
      setIsGameOver(true);
      setIsRunning(false);
    }
  }, [typedWords]); // Depend on typedWords


  // --- CONDITIONAL RENDERING (AFTER ALL HOOKS) ---
  // If there are no words provided at all, render a message
  if (typedWords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-white">
        No words available for this game!
        {/* You could add a button to go back or select another game */}
      </div>
    );
  }

  // If currentWord is undefined (e.g., currentWordIndex is out of bounds due to typedWords changing),
  // which ideally shouldn't happen if typedWords.length check above passes and index management is correct.
  // This can act as a further safeguard or a temporary loading state.
  if (!currentWord) {
      return (
          <div className="flex items-center justify-center min-h-screen text-2xl text-white">
              Loading current word...
          </div>
      );
  }


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
        currentWordIndex={currentWordIndex}
        totalWords={typedWords.length}
      />

      <div className="relative z-10 flex flex-col items-center w-full flex-grow overflow-x-hidden">
        {isGameOver ? (
          <GameEndScreen
            score={score}
            time={time}
            onRestart={restartGame}
            hasWon={hasWon}
          />
        ) : (
          <>
            <div
              className="flex flex-col items-center flex-grow mx-auto w-fit min-w-[320px] md:min-w-[600px] max-w-full
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

              {/* STATS SECTION (Timer, Score, Attempts) */}
              <div className="relative z-20 flex flex-col items-center gap-3 order-first md:order-last flex-shrink">

                  {/* Timer Display */}
                  <div
                      className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[200px] lg:max-w-[250px]
                                 aspect-video mb-3 rounded-lg overflow-hidden"
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
                      Score
                  </div>

                  {/* Score Board */}
                  <div
                      className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[200px] lg:max-w-[250px]
                                 aspect-video mb-3 rounded-lg overflow-hidden"
                      style={{
                          backgroundImage: "url('/animation/score-board.png')",
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                      }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white text-game-display">
                            {score}
                          </div>
                      </div>
                  </div>

                  {(() => {
                      const attemptsLeft = MAX_INCORRECT_ATTEMPTS - incorrect; // Use MAX_INCORRECT_ATTEMPTS here
                      let containerClasses = "flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold transition-colors duration-300 transform scale-100";
                      const textClasses = "text-sm sm:text-base md:text-lg";
                      let icon = null;
                      const iconClasses = "mr-1 h-4 w-4 sm:h-5 sm:w-5";

                      if (attemptsLeft <= 0) {
                          containerClasses += " bg-gray-200 border-gray-400 text-gray-600 border-2";
                          icon = <Lightbulb className={`${iconClasses} text-gray-500`} />;
                      } else if (attemptsLeft <= 2) {
                          containerClasses += " bg-red-100 border-red-400 text-red-700 border-2";
                          icon = <AlertTriangle className={`${iconClasses} text-red-600`} />;
                          if (attemptsLeft === 1) {
                              containerClasses += " animate-pulse-fast";
                          }
                      } else {
                          containerClasses += " bg-green-50 border-green-200 text-green-600 border-2";
                          icon = <Lightbulb className={`${iconClasses} text-green-500`} />;
                      }

                      return (
                          <motion.div
                              key={attemptsLeft}
                              initial={{ opacity: 0, y: -20, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className={`${containerClasses} ${textClasses}`}
                          >
                              {icon}
                              <span>You have {attemptsLeft} attempts left</span>
                          </motion.div>
                      );
                  })()}
              </div>

              {/* GAME INTERACTION SECTION (Image, Letters, Buttons) */}
              <div className="relative z-20 flex flex-col items-center order-last md:order-first flex-shrink">
                {/* Frame for the word image */}
                <div
                  className="mb-6 p-3 border-3 border-yellow-500 rounded-lg shadow-xl bg-white flex-shrink-0
                             w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px]"
                >
                  <Image
                    src={currentWord.imageSrc} // Use imageSrc from props
                    alt={currentWord.word}
                    width={450}
                    height={337}
                    className="object-cover w-full h-auto"
                  />
                </div>

                {/* Wrapper for Reorder.Group to handle horizontal scrolling */}
                <div className="w-full overflow-x-auto">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentWord.id} // Key off currentWord.id to re-trigger AnimatePresence on word change
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-full flex justify-center min-w-0"
                    >
                      <Reorder.Group
                        axis="x"
                        values={userAnswerLetters}
                        onReorder={setUserAnswerLetters}
                        className="flex flex-nowrap gap-1 sm:gap-2 mb-6 p-3 border-2 border-dashed border-gray-300 rounded-md justify-start items-center"
                      >
                        {userAnswerLetters.map((item) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-8 h-8 text-base flex items-center justify-center font-bold cursor-grab flex-shrink-0
                                       sm:w-10 sm:h-10 sm:text-lg md:w-12 md:h-12 md:text-xl lg:w-14 lg:h-14 lg:text-2xl"
                            style={{ zIndex: 10 }}
                          >
                            <Button variant={"secondary"} className="text-white text-base sm:text-lg md:text-xl w-full h-full">
                              {item.letter}
                            </Button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                  }}
                  whileTap={{ scale: 0.9, rotate: 3 }}
                >
                  <Button
                    onClick={handleSubmit}
                    variant={"super"}
                    className="mb-4 text-lg sm:text-xl px-6 py-2 sm:px-8 sm:py-3"
                  >
                    Submit
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                  }}
                  whileTap={{ scale: 0.9, rotate: 3 }}
                >
                  <Button onClick={handleReset} variant={"super"}
                    className="text-lg sm:text-xl px-6 py-2 sm:px-8 sm:py-3">
                    Reset
                  </Button>
                </motion.div>
              </div>
            </div>

            {status === "correct" && <div className="mt-3 text-lg sm:text-xl text-green-500 font-bold">Correct!</div>}
            {status === "wrong" && (
              <div className="mt-3 text-lg sm:text-xl text-red-500 font-bold">
                Try Again!
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Game;
// app/(mini-games)/anagram/anagram.tsx
"use client"; // MUST be at the very top!

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Header } from "@/components/ui/header-game";
import { AlertTriangle, Lightbulb } from "lucide-react";
import GameEndScreen from "./game-end-screen";
import { shuffleArray } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-game";

import { DifficultyEnum } from "@/app/models/Game";

export enum GameType {
  ANAGRAM = "ANAGRAM",
}


interface GameProps {
  topicId: number;
  difficulty: DifficultyEnum;
  gameType: GameType;
  words: GameWordData[]; // Game still expects the full GameWordData with 'id' and 'letters'
}
// app/(mini-games)/anagram/anagram.tsx (or in your types file)

export type GameWordData = {
  id: string; // The unique ID you generate
  word: string;
  imageSrc: string;
  letters: string;
};

// Also simplify the base type for your source words, as they don't have 'letters' yet
export type BaseWordData = {
  word: string;
  imageSrc: string;
};

const MAX_INCORRECT_ATTEMPTS = 5;

const Game = ({ topicId, difficulty, gameType, words: initialWordsData }: GameProps) => {
  // Defensive check for initialWordsData:
  // This check correctly identifies if `initialWordsData` is not an array (e.g., undefined, null)
  // or if it's an empty array.
  if (!Array.isArray(initialWordsData) || initialWordsData.length === 0) {
    // If it's not an array (like undefined), show a 'loading/error' state
    if (!Array.isArray(initialWordsData)) {
      return (
        <div className="flex min-h-screen items-center justify-center text-red-500 text-2xl">
          Loading game data... (Invalid data format received)
        </div>
      );
    } else {
      // If it's an empty array, it means no words match the difficulty
      return (
        <div className="flex items-center justify-center min-h-screen text-2xl text-white">
          No words available for this difficulty!
        </div>
      );
    }
  }

  // --- State Declarations (moved to the top as fixed previously) ---
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

  // --- Derived State (after hooks) ---
  const typedWords: GameWordData[] = initialWordsData;
  const currentWord = typedWords[currentWordIndex];

  // --- Memoized Callbacks (useCallback) ---
  const initializeCurrentWordLetters = useCallback(() => {
    if (currentWord) {
      const initialLetters = currentWord.letters.split('').map((letter, index) => ({
        letter,
        originalIndex: index,
        id: `${index}-${letter}`,
      }));
      setUserAnswerLetters(shuffleArray(initialLetters));
      setStatus("none");
    }
  }, [currentWord]);

  const handleSubmit = useCallback(() => { /* ... (your existing handleSubmit logic) ... */
    if (!currentWord) return;
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

  const handleReset = useCallback(() => {
    initializeCurrentWordLetters();
  }, [initializeCurrentWordLetters]);

  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setCurrentWordIndex(0);
    setIncorrect(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
  }, []);


  // --- Effects (useEffect) ---
  useEffect(() => {
    if (!isGameOver && !hasWon) {
      initializeCurrentWordLetters();
      if (currentWordIndex === 0) {
        setTime(0);
        setIsRunning(true);
      }
    }
  }, [currentWordIndex, isGameOver, hasWon, initializeCurrentWordLetters]);

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

  // --- Conditional Renders for specific states within Game ---
  // The initial check for `initialWordsData` already covers if `currentWord` would be undefined due to no words.
  // This `if (!currentWord)` check is only strictly necessary if `currentWordIndex` could somehow go out of bounds
  // after the game has started, which is unlikely with proper state management.
  // You can probably remove this if your `initialWordsData.length === 0` handles the empty array case.
  /*
  if (!currentWord) {
    return null; // or a more specific error/loading for an internal word-loading issue
  }
  */

  // --- Main JSX ---
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

              <div className="relative z-20 flex flex-col items-center gap-3 order-first md:order-last flex-shrink">
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
                      const attemptsLeft = MAX_INCORRECT_ATTEMPTS - incorrect;
                      let containerClasses = "flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold transition-colors duration-300 transform scale-100";
                      let textClasses = "text-sm sm:text-base md:text-lg";
                      let icon = null;
                      let iconClasses = "mr-1 h-4 w-4 sm:h-5 sm:w-5";

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

              <div className="relative z-20 flex flex-col items-center order-last md:order-first flex-shrink">
                <div
                  className="mb-6 p-3 border-3 border-yellow-500 rounded-lg shadow-xl bg-white flex-shrink-0
                             w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px]"
                >
                  <Image
                    src={currentWord.imageSrc}
                    alt={currentWord.word}
                    width={450}
                    height={337}
                    className="object-cover w-full h-auto"
                  />
                </div>

                <div className="w-full overflow-x-auto">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
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

            {status === "correct" && <div className="mt-3 text-lg sm:text-xl text-green-500 font-bold" aria-live="polite">Correct!</div>}
            {status === "wrong" && (
              <div className="mt-3 text-lg sm:text-xl text-red-500 font-bold" aria-live="polite">
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
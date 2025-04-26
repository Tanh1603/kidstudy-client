import { useState, useEffect } from "react";
import { words } from "@/data/word";
import { shuffleArray } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";

const Game = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>([]); //set of letters
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [score, setScore] = useState(0); // New state for score
  const currentWord = words[currentWordIndex];
  const [isGameOver, setIsGameOver] = useState(false); //State for game over
  const [incorrect, setIncorrect] = useState(0); //State for incorrect answer
  const [usedLetterIndexes, setUsedLetterIndexes] = useState<number[]>([]);

  // Shuffle the letters
  useEffect(() => {
    setLetters(shuffleArray(currentWord.letters));
    setUserAnswer([]);
    setUsedLetterIndexes([]);
    setStatus("none");
  }, [currentWordIndex]);

  type GameOverScreenProps = {
    score: number;
    onRestart: () => void;
  };
  const GameOverScreen = ({ score, onRestart }: GameOverScreenProps) => (
    <div className="text-center">
      <h2 className="text-2xl mb-4">Game Over!</h2>
      <p className="text-lg">Your final score is: {score}</p>
      <Button onClick={onRestart} variant={"primary"}>
        Restart Game
      </Button>
    </div>
  );

  const handleLetterClick = (letter: string, index: number) => {
    setUserAnswer((prev) => [...prev, letter]);
    setUsedLetterIndexes((prev) => [...prev, index]);
  };

  const handleSubmit = () => {
    const userWord = userAnswer.join("");
    if (userWord === currentWord.word) {
      setStatus("correct");
      setScore((prevScore) => prevScore + 1); // Increment score
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, 1000);
    } else {
      setStatus("wrong");
      setIncorrect((prev) =>
      {
        const newAttempt = prev + 1;
        if(newAttempt >= 5) {
          setIsGameOver(true);
        }
        return newAttempt;
      })
    }
  };

  const handleReset = () => {
    setUserAnswer([]);
    setStatus("none");
    setUsedLetterIndexes([]);
  };

  return (
    <div className="flex flex-col items-center">

    {isGameOver ? (

      <GameOverScreen score={score} onRestart={() => {
        setIsGameOver(false);
        setScore(0);
        setCurrentWordIndex(0);
        setIncorrect(0);
        handleReset();
      }} />
    ) : (
        <>
          <div className="mb-6">
            <Image src={currentWord.image} alt={currentWord.word} width={500} height={400}  />
          </div>

          <div className="flex gap-4 mb-6">
          {letters.map((letter, index) => {
            const isUsed = usedLetterIndexes.includes(index);
            return (
              <Button
                key={index}
                onClick={() => handleLetterClick(letter, index)}
                variant={isUsed ? "secondary" : "primary"}
                disabled={isUsed}
                className={isUsed ? "bg-gray-400 text-white cursor-not-allowed" : ""}
              >
                {letter}
              </Button>
            );
          })}

          </div>
          {/* <DndContext collisionDetection={closestCorners} >

          </DndContext> */}

          <div className="flex gap-2 mb-6">
            {userAnswer.map((letter, i) => (
              <div
                key={i}
                onClick={() => {
                  // Remove from both userAnswer and usedLetterIndexes by index
                  setUserAnswer((prev) => prev.filter((_, j) => j !== i));
                  setUsedLetterIndexes((prev) => prev.filter((_, j) => j !== i));
                }}
                className="text-xl p-3 bg-blue-200 rounded-full cursor-pointer hover:bg-blue-300"
                title="Click to remove"
              >
                {letter}
              </div>
            ))}
          </div>
          <Button
            onClick={handleSubmit}
            variant={"primary"}
            className="mb-4"
          >
            Submit
          </Button>
          <Button
            onClick={handleReset}
            variant={"primary"}
          >
            Reset
          </Button>
          {status === "correct" && <div className="mt-4 text-green-500">Correct!</div>}
          {status === "wrong" && (
            <div className="mt-4 text-red-500">
              Try Again! The correct word was: <strong>{currentWord.word}</strong>
            </div>
          )}
          <div className="mt-4 text-lg">Score: {score}</div>
          <div className="mt-4 text-lg">Incorrect Attempts: {incorrect}</div> {/* Display incorrect attempts */}
        </>
      )}
    </div>
  );
};

export default Game;
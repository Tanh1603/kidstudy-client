// app/(mini-games)/anagram/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
// Import your Game component from its dedicated file
import Game, { GameType, GameWordData, BaseWordData } from "./anagram"; // Assuming 'anagram.tsx' holds your Game component
import Loading from "@/components/loading";
import DifficultySelector from "@/components/difficulty-selector";
import { DifficultyEnum } from "@/app/models/Game";

// Helper function to scramble a word
const scrambleWord = (word: string): string => {
  const a = word.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
};

// Your static word source
// app/(mini-games)/anagram/page.tsx

// Updated type for the source array
// It now matches the BaseWordData type
const ALL_ANAGRAM_WORDS_SOURCE: BaseWordData[] = [
  { word: "CAT", imageSrc: "/animation/cat.jpg" },
  { word: "PARK", imageSrc: "/animation/park.jpg" },
  { word: "DOG", imageSrc: "/animation/dog.jpg" },
  { word: "ELEPHANT", imageSrc: "/animation/elephant.jpg" },
  { word: "KEYBOARD", imageSrc: "/animation/keyboard.jpg" },
  { word: "TELEVISION", imageSrc: "/animation/television.jpg" },
  { word: "REFRIGERATOR", imageSrc: "/animation/refrigerator.jpg" },
  { word: "SUN", imageSrc: "/animation/sun.jpg" },
  { word: "FLOWER", imageSrc: "/animation/flower.jpg" },
  { word: "COMPUTER", imageSrc: "/animation/computer.jpg" },
];
const Anagram = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyEnum | null>(null);
  const [gameWords, setGameWords] = useState<GameWordData[]>([]);

  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // console.log("Authentication token:", token); // Keep this for debugging if needed
      } catch (error) {
        console.error("Failed to retrieve authentication token:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchAuthToken();
  }, [userId, getToken]);

// app/(mini-games)/anagram/page.tsx

const filterWordsByDifficulty = useCallback((difficulty: DifficultyEnum): GameWordData[] => {
  let filteredBaseWords: BaseWordData[] = []; // Use BaseWordData here
  switch (difficulty) {
    case DifficultyEnum.EASY:
      filteredBaseWords = ALL_ANAGRAM_WORDS_SOURCE.filter(word => word.word.length <= 4);
      break;
    case DifficultyEnum.MEDIUM:
      filteredBaseWords = ALL_ANAGRAM_WORDS_SOURCE.filter(word => word.word.length > 4 && word.word.length <= 8);
      break;
    case DifficultyEnum.HARD:
      filteredBaseWords = ALL_ANAGRAM_WORDS_SOURCE.filter(word => word.word.length > 8);
      break;
    default:
      filteredBaseWords = ALL_ANAGRAM_WORDS_SOURCE;
  }

  // Map to GameWordData, adding 'letters' and a unique 'id'
  // We'll use a simple index-based ID combined with the word, or you could use a more robust unique ID generator if needed.
  return filteredBaseWords.map((data, index) => ({
    ...data,
    letters: scrambleWord(data.word), // Scramble the word to get the initial letters
    id: `${data.word}-${index}`, // Create a unique ID for each word
  }));
}, []);

  const handleDifficultySelect = useCallback((difficulty: DifficultyEnum) => {
    setSelectedDifficulty(difficulty);
    setGameWords(filterWordsByDifficulty(difficulty));
  }, [filterWordsByDifficulty]);

  if (loading) return <Loading />;

  // Render DifficultySelector if no difficulty is selected
  if (!selectedDifficulty) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
      </main>
    );
  }

  // Render the Game component once a difficulty is selected and words are prepared
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Game
        topicId={1}
        difficulty={selectedDifficulty}
        gameType={GameType.ANAGRAM}
        words={gameWords} // Pass the prepared words to the Game component
      />
    </main>
  );
};

export default Anagram;
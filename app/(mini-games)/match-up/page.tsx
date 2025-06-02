// app/(mini-games)/match-up/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Game } from "./match-up"; // CHANGED: Import as named export
import Loading from "@/components/loading";
import DifficultySelector from "@/components/difficulty-selector";
import TopicSelector from "@/components/topic-selector";
import { DifficultyEnum, GameTypeEnum } from "@/app/models/Game";

// --- Types for Match-Up Game ---
// Raw question data from your database/model
export type MatchUpRawQuestion = {
  word: string; // The correct word for the image
  imageSrc: string;
  topicId: number;
  difficulty: DifficultyEnum;
};

// Prepared data for the Game component
export type MatchUpGameData = {
  id: string; // Unique ID for React keys
  imageSrc: string;
  correctWord: string;
  choices: string[]; // Array of word options, including the correct one and distractors
};
// --- End Types ---


// --- Simulate raw data fetched from your database for Match-Up ---
// app/(mini-games)/match-up/page.tsx

// ... (previous imports and types)

// --- Simulate raw data fetched from your database for Match-Up ---
const ALL_MATCH_UP_RAW_QUESTIONS: MatchUpRawQuestion[] = [
    // Animals Topic (id: 1) - EASY
    { word: "CAT", imageSrc: "/animation/cat.jpg", topicId: 1, difficulty: DifficultyEnum.EASY },
    { word: "DOG", imageSrc: "/animation/dog.jpg", topicId: 1, difficulty: DifficultyEnum.EASY },
    { word: "BIRD", imageSrc: "/animation/bird.jpg", topicId: 1, difficulty: DifficultyEnum.EASY }, // Added
    { word: "FISH", imageSrc: "/animation/fish.jpg", topicId: 1, difficulty: DifficultyEnum.EASY }, // Added
    { word: "PIG", imageSrc: "/animation/pig.jpg", topicId: 1, difficulty: DifficultyEnum.EASY },   // Added
    { word: "COW", imageSrc: "/animation/cow.jpg", topicId: 1, difficulty: DifficultyEnum.EASY },   // Added
    { word: "SHEEP", imageSrc: "/animation/sheep.jpg", topicId: 1, difficulty: DifficultyEnum.EASY }, // Added
    { word: "DUCK", imageSrc: "/animation/duck.jpg", topicId: 1, difficulty: DifficultyEnum.EASY },  // Added
  
    // Animals Topic (id: 1) - MEDIUM
    { word: "LION", imageSrc: "/animation/lion.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM },
    { word: "TIGER", imageSrc: "/animation/tiger.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM },
    { word: "BEAR", imageSrc: "/animation/bear.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "WOLF", imageSrc: "/animation/wolf.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "FOX", imageSrc: "/animation/fox.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "ZEBRA", imageSrc: "/animation/zebra.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "MONKEY", imageSrc: "/animation/monkey.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "GIRAFFE", imageSrc: "/animation/giraffe.jpg", topicId: 1, difficulty: DifficultyEnum.MEDIUM }, // Added
  
    // Animals Topic (id: 1) - HARD
    { word: "ELEPHANT", imageSrc: "/animation/elephant.jpg", topicId: 1, difficulty: DifficultyEnum.HARD },
    { word: "RHINOCEROS", imageSrc: "/animation/rhinoceros.jpg", topicId: 1, difficulty: DifficultyEnum.HARD },
    { word: "HIPPOPOTAMUS", imageSrc: "/animation/hippopotamus.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
    { word: "CROCODILE", imageSrc: "/animation/crocodile.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
    { word: "GORILLA", imageSrc: "/animation/gorilla.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
    { word: "KANGAROO", imageSrc: "/animation/kangaroo.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
    { word: "PENGUIN", imageSrc: "/animation/penguin.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
    { word: "CHIMPANZEE", imageSrc: "/animation/chimpanzee.jpg", topicId: 1, difficulty: DifficultyEnum.HARD }, // Added
  
  
    // Objects Topic (id: 2) - EASY
    { word: "SUN", imageSrc: "/animation/sun.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },
    { word: "CHAIR", imageSrc: "/animation/chair.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },
    { word: "BOOK", imageSrc: "/animation/book.jpg", topicId: 2, difficulty: DifficultyEnum.EASY }, // Added
    { word: "CUP", imageSrc: "/animation/cup.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },   // Added
    { word: "BALL", imageSrc: "/animation/ball.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },   // Added
    { word: "TREE", imageSrc: "/animation/tree.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },   // Added
    { word: "DOOR", imageSrc: "/animation/door.jpg", topicId: 2, difficulty: DifficultyEnum.EASY }, // Added
    { word: "CAR", imageSrc: "/animation/car.jpg", topicId: 2, difficulty: DifficultyEnum.EASY },  // Added
  
  
    // Objects Topic (id: 2) - MEDIUM
    { word: "FLOWER", imageSrc: "/animation/flower.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM },
    { word: "COMPUTER", imageSrc: "/animation/computer.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM },
    { word: "TABLE", imageSrc: "/animation/table.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "PHONE", imageSrc: "/animation/phone.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "GLASSES", imageSrc: "/animation/glasses.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "CLOCK", imageSrc: "/animation/clock.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "CAMERA", imageSrc: "/animation/camera.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    { word: "PICTURE", imageSrc: "/animation/picture.jpg", topicId: 2, difficulty: DifficultyEnum.MEDIUM }, // Added
    // Objects Topic (id: 2) - HARD
    { word: "KEYBOARD", imageSrc: "/animation/keyboard.jpg", topicId: 2, difficulty: DifficultyEnum.HARD },
    { word: "TELEVISION", imageSrc: "/animation/television.jpg", topicId: 2, difficulty: DifficultyEnum.HARD },
    { word: "REFRIGERATOR", imageSrc: "/animation/refrigerator.jpg", topicId: 2, difficulty: DifficultyEnum.HARD },
    { word: "MICROPHONE", imageSrc: "/animation/microphone.jpg", topicId: 2, difficulty: DifficultyEnum.HARD }, // Added
    { word: "HEADPHONES", imageSrc: "/animation/headphones.jpg", topicId: 2, difficulty: DifficultyEnum.HARD }, // Added
    { word: "CALCULATOR", imageSrc: "/animation/calculator.jpg", topicId: 2, difficulty: DifficultyEnum.HARD }, // Added
    { word: "WASHINGMACHINE", imageSrc: "/animation/washing_machine.jpg", topicId: 2, difficulty: DifficultyEnum.HARD }, // Added
    { word: "MICROWAVE", imageSrc: "/animation/microwave.jpg", topicId: 2, difficulty: DifficultyEnum.HARD }, // Added
  ];
  
  // ... (rest of the page.tsx code)
// Helper to shuffle an array (can be reused from utils if available)
const shuffleArray = <T extends any[]>(array: T): T => {
  const newArray = [...array] as T;
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Main MatchUp Component ---
const MatchUp = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyEnum | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [gameQuestions, setGameQuestions] = useState<MatchUpGameData[]>([]);

  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // console.log("Authentication token:", token);
      } catch (error) {
        console.error("Failed to retrieve authentication token:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchAuthToken();
  }, [userId, getToken]);

  // Function to get unique topics from the raw question data
  const getAvailableTopics = useCallback(() => {
    const topicsMap = new Map<number, { id: number; name: string }>();
    ALL_MATCH_UP_RAW_QUESTIONS.forEach(q => {
      if (!topicsMap.has(q.topicId)) {
        let topicName = `Topic ${q.topicId}`; // Fallback name
        if (q.topicId === 1) topicName = "Animals";
        if (q.topicId === 2) topicName = "Objects";
        topicsMap.set(q.topicId, { id: q.topicId, name: topicName });
      }
    });
    return Array.from(topicsMap.values());
  }, []);

  // Function to filter and prepare questions based on selected difficulty AND topic
  const getFilteredAndPreparedQuestions = useCallback((difficulty: DifficultyEnum, topicId: number): MatchUpGameData[] => {
    const questionsForTopicAndDifficulty = ALL_MATCH_UP_RAW_QUESTIONS.filter(
      q => q.topicId === topicId && q.difficulty === difficulty
    );

    // Get all words from the current difficulty/topic to use as potential distractors
    const allWordsInCurrentContext = questionsForTopicAndDifficulty.map(q => q.word);

    return questionsForTopicAndDifficulty.map((data, index) => {
      const correctWord = data.word;
      // Generate distractors: pick 2-3 other words from the same context
      // Ensure distractors are not the correct word and are unique
      let distractors = shuffleArray(allWordsInCurrentContext)
        .filter(word => word !== correctWord)
        .slice(0, 2); // Get 2 distractors

      // Combine correct word and distractors, then shuffle for choices
      const choices = shuffleArray([correctWord, ...distractors]);

      return {
        id: `${data.word}-${data.topicId}-${data.difficulty}-${index}`, // Robust ID
        imageSrc: data.imageSrc,
        correctWord: data.word,
        choices: choices,
      };
    });
  }, []);

  const handleDifficultySelect = useCallback((difficulty: DifficultyEnum) => {
    setSelectedDifficulty(difficulty);
    setSelectedTopicId(null); // Reset topic selection when difficulty changes
    setGameQuestions([]); // Clear game questions
  }, []);

  const handleTopicSelect = useCallback((topicId: number) => {
    if (selectedDifficulty === null) {
        console.error("Difficulty not selected before topic.");
        return;
    }
    setSelectedTopicId(topicId);
    const newGameQuestions = getFilteredAndPreparedQuestions(selectedDifficulty, topicId);
    setGameQuestions(newGameQuestions);
  }, [selectedDifficulty, getFilteredAndPreparedQuestions]);

  // Unified wrapper for all main content (background and responsive layout)
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex flex-col items-center w-full min-h-screen relative"
      style={{
        backgroundImage: "url('/animation/anagram-bg.jpg')", // Consistent background
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-5 z-0"></div>
      <main className="relative z-10 flex flex-col items-center w-full flex-grow overflow-x-hidden">
        {children}
      </main>
    </div>
  );

  if (loading) {
    return (
      <ContentWrapper>
        <Loading />
      </ContentWrapper>
    );
  }

  // --- Conditional Rendering Flow ---
  if (!selectedDifficulty) {
    return (
      <ContentWrapper>
        <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
      </ContentWrapper>
    );
  }

  if (!selectedTopicId) {
    const availableTopics = getAvailableTopics();
    if (availableTopics.length === 0) {
      return (
        <ContentWrapper>
          <div className="flex items-center justify-center min-h-screen text-2xl text-white">
            No topics available for Match-Up.
          </div>
        </ContentWrapper>
      );
    }
    return (
      <ContentWrapper>
        <TopicSelector topics={availableTopics} onSelectTopic={handleTopicSelect} />
      </ContentWrapper>
    );
  }

  // Render the Game component only when both difficulty and topic are selected
  return (
    <Game
      topicId={selectedTopicId}
      difficulty={selectedDifficulty}
      gameType={GameTypeEnum.MATCH_UP} // Ensure GameType.MATCH_UP is correctly passed
      questions={gameQuestions} // Pass the prepared questions
    />
  );
};

export default MatchUp;
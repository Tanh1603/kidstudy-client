"use client";
import React from "react";

import { useMemoryStore } from "@/store/use-game-memory";

import { DifficultyScreen } from "./difficulty-screen";
import MemoryGameScreen from "./memory";
import { TopicsScreen } from "./topic-screen";



const MemoryGame: React.FC = () => {
  const { currentScreen } = useMemoryStore();

  switch (currentScreen) {
    case "difficulty":
      return <DifficultyScreen />;
    case "topics":
      return <TopicsScreen />;
    case "game":
      return <MemoryGameScreen />;
    default:
      return <DifficultyScreen />;
  }
};

export default MemoryGame;
/* eslint-disable import/order */
"use client";
import { useMemoryStore } from "@/store/use-game-memory";
import React from "react";
import { DifficultyScreen } from "./difficulty-screen";
import { TopicsScreen } from "./topic-screen";
import MemoryGameScreen from "./memory";

const SpellingBeeGame: React.FC = () => {
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

export default SpellingBeeGame;
/* eslint-disable import/order */
"use client";
import { useAnagramStore } from "@/store/use-game-anagram";
import React from "react";
import { DifficultyScreen } from "./difficulty-screen";
import { TopicsScreen } from "./topic-screen";
import { GameScreen } from "./anagram";

const AnagramGame: React.FC = () => {
  const { currentScreen } = useAnagramStore();

  switch (currentScreen) {
    case "difficulty":
      return <DifficultyScreen />;
    case "topics":
      return <TopicsScreen />;
    case "game":
      return <GameScreen />;
    default:
      return <DifficultyScreen />;
  }
};

export default AnagramGame;
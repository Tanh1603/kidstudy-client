"use client";
import React from "react";

import { useSpellingBeeStore } from "@/store/use-game-spellingbee";

import { DifficultyScreen } from "../../difficulty-screen";
import { TopicsScreen } from "../../topic-screen";

import { GameScreen } from "./game-screen";


const SpellingBeeGame: React.FC = () => {
  const { currentScreen } = useSpellingBeeStore();

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

export default SpellingBeeGame;
/* eslint-disable import/order */
"use client";
import { useMatchUpStore } from "@/store/use-game-matchup";
import React from "react";
import { DifficultyScreen } from "./difficulty-screen";
import { TopicsScreen } from "./topic-screen";
import { GameScreen } from "./match-up";

const SpellingBeeGame: React.FC = () => {
  const { currentScreen } = useMatchUpStore();

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
/* eslint-disable import/order */
import { DifficultyEnum, GameTypeEnum } from "@/app/models/Game"; // Assuming these are defined here
import api from "./api"; // Your Axios instance or similar

// --- Define specific types for this service's data ---

/**
 * Represents a game type fetched from the backend.
 */
export type FetchedGameType = {
  id: number;
  name: string;
  enumValue: GameTypeEnum; // The enum value matching your GameTypeEnum
};

/**
 * Represents a game topic fetched from the backend.
 */
export type FetchedGameTopic = {
  id: number;
  name: string;
  gameTypeId?: number; // Optional: If topics can be global or specific to a gameType
};

/**
 * Payload for submitting a game result to the backend.
 */
export type GameResultPayload = {
  gameType: GameTypeEnum;
  score: number;
  timeTakenSeconds: number;
  difficulty: DifficultyEnum;
  topicId?: number; // Optional, if applicable to the game
  // Any other relevant game data like 'correctAnswers', 'wrongAnswers' can be added here
};

/**
 * Response structure after successfully submitting a game result.
 */
export type GameResultResponse = {
  id: number;
  message: string;
  // Potentially include the submitted data or updated user stats
};

// --- API Service Functions ---

/**
 * Fetches all available game types from the backend.
 * @param token Authentication token.
 * @returns An array of FetchedGameType objects.
 */
const getGameTypes = async (token: string): Promise<FetchedGameType[]> => {
  try {
    const response = await api.get(`user/game-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as FetchedGameType[];
  } catch (error) {
    console.error("Error fetching game types:", error);
    throw error;
  }
};

/**
 * Fetches game topics from the backend, optionally filtered by game type.
 * @param token Authentication token.
 * @param gameTypeId Optional: Filter topics by a specific game type ID.
 * @returns An array of FetchedGameTopic objects.
 */
const getGameTopics = async (
  token: string,
  gameTypeId?: number
): Promise<FetchedGameTopic[]> => {
  try {
    const params = gameTypeId ? `?gameTypeId=${gameTypeId}` : '';
    const response = await api.get(`user/game-topics${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as FetchedGameTopic[];
  } catch (error) {
    console.error("Error fetching game topics:", error);
    throw error;
  }
};

/**
 * Submits a user's game result to the backend.
 * @param token Authentication token.
 * @param resultPayload The payload containing the game's outcome data.
 * @returns A GameResultResponse object indicating success.
 */
const submitGameResult = async (
  token: string,
  resultPayload: GameResultPayload
): Promise<GameResultResponse> => {
  try {
    const response = await api.post(`user/game-results`, resultPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Typically JSON for results
      },
    });
    return response.data as GameResultResponse;
  } catch (error) {
    console.error("Error submitting game result:", error);
    throw error;
  }
};

export { getGameTypes, getGameTopics, submitGameResult };
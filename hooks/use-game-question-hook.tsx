/* eslint-disable import/order */
"use client";
import { DifficultyEnum, GameTypeEnum } from "@/app/models/Game";
import {
  createGameQuestion,
  deleteGameQuestion,
  getGameQuestionsByGameType,
  getRandomGameQuestion,
  updateGameQuestion,
} from "@/app/services/admin/minigame-service";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useGetGameQuestionByGameType = (gameType: GameTypeEnum) => {
  const { getToken } = useAuth();
  if (!gameType) {
    throw new Error("Game type is required");
  }

  return useQuery({
    queryKey: ["game-questions", gameType],
    queryFn: async () => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await getGameQuestionsByGameType(token, gameType);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useGetRandomGameQuestionByGameType = (
  gameType: GameTypeEnum,
  difficulty: DifficultyEnum,
  topicId: number,
  limit: number = 10
) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["random-game-questions", gameType, difficulty, topicId, limit],
    queryFn: async () => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await getRandomGameQuestion(
        token,
        gameType,
        difficulty,
        topicId,
        limit
      );
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useCreateGameQuestion = (gameType: GameTypeEnum) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newQuestion: FormData) => {
      const token = (await getToken()) as string;
      if (!token) throw new Error("Token is required");
      return await createGameQuestion(token, newQuestion);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Game question created successfully!");
      void queryClient.invalidateQueries({
        queryKey: ["game-questions", gameType],
      });
    },
  });
};

const useUpdateGameQuestion = (gameType: GameTypeEnum) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newQuestion,
    }: {
      id: number;
      newQuestion: FormData;
    }) => {
      const token = (await getToken()) as string;
      if (!token) throw new Error("Token is required");
      return await updateGameQuestion(token, id, newQuestion);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["game-questions", gameType],
      });
      toast.success("Game question created successfully!");
    },
  });
};

const useDeleteGameQuestion = (gameType: GameTypeEnum) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = (await getToken()) as string;
      if (!token) throw new Error("Token is required");
      return await deleteGameQuestion(token, id);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["game-questions", gameType],
      });
      toast.success("Game question deleted successfully!");
    },
  });
};

export {
  useGetGameQuestionByGameType,
  useGetRandomGameQuestionByGameType,
  useCreateGameQuestion,
  useUpdateGameQuestion,
  useDeleteGameQuestion,
};

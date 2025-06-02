/* eslint-disable import/order */
"use client";

import UserProgressDTO, { UserProgressDTOCreate } from "@/app/models/UserProgressDTO";
import {
  getLeaderboard,
  getUserProgress,
  refillHearts,
  upsertUserProgress,
} from "@/app/services/user-progress";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useCurrentUserProgress = () => {
  const { getToken, userId } = useAuth();
  return useQuery<UserProgressDTO>({
    queryKey: ["current-user-progress", userId],
    queryFn: async (): Promise<UserProgressDTO> => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      if (!userId) {
        throw new Error("UserId is required");
      }
      return await getUserProgress(token, userId);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useUpsertUserProgress = () => {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userProgress: UserProgressDTOCreate) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      if (!userId) {
        throw new Error("UserId is required");
      }

      return await upsertUserProgress(token, userProgress);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["current-user-progress", userId],
      });
      toast.success("Purchase ticket successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useGetLeaderboard = () => {
  const { getToken } = useAuth();
  return useQuery<UserProgressDTO[]>({
    queryKey: ["user-progress-leader-board"],
    queryFn: async (): Promise<UserProgressDTO[]> => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await getLeaderboard(token, 10);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useRefillHeart = () => {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      if (!userId) {
        throw new Error("UserId is required");
      }

      return await refillHearts(token, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["current-user-progress", userId],
      });
      toast.success("Refill heart successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export {
  useCurrentUserProgress,
  useRefillHeart,
  useGetLeaderboard,
  useUpsertUserProgress,
};

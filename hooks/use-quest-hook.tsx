/* eslint-disable import/order */
"use client";
import QuestDTO, { QuestUserDTO } from "@/app/models/QuestDTO";
import {
  getQuest,
  createQuest,
  updateQuest,
  deleteQuest,
  getDailyQuest,
  addPointToquest,
  resetDailyQuest,
} from "@/app/services/admin/quests-service";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetQuests = () => {
  const { getToken } = useAuth();

  useQuery<QuestDTO[]>({
    queryKey: ["admin-quests"],
    queryFn: async (): Promise<QuestDTO[]> => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return getQuest(token);
    },
    enabled: !!getToken,
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useCreateQuest = () => {
  const { getToken } = useAuth();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quest: QuestDTO) => {
      const token = (await getToken()) as string;

      if (!token) {
        throw new Error("Token is required");
      }
      return await createQuest(token, quest);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Create quest successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateQuest = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quest: QuestDTO) => {
      const token = (await getToken()) as string;

      if (!token) {
        throw new Error("Token is required");
      }

      return await updateQuest(token, quest);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Update quest successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteQuest = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }

      await deleteQuest(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Delete quest successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// user

export const useDailyQuests = () => {
  const { getToken, userId } = useAuth();

  return useQuery<QuestUserDTO[]>({
    queryKey: ["user-quests", userId],
    queryFn: async (): Promise<QuestUserDTO[]> => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      if (!userId) {
        throw new Error("UserId is required");
      }
      return await getDailyQuest(token, userId);
    },
    enabled: !!getToken && !!userId,
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useAddPointToQuest = () => {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (points: number) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      if (!userId) {
        throw new Error("UserId is required");
      }
      await addPointToquest(token, userId, points);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-quests", userId] });
      void queryClient.refetchQueries({
        queryKey: ["user-quests", userId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useResetDailyQuest = () => {
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
      await resetDailyQuest(token, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-quests", userId] });
      void queryClient.refetchQueries({
        queryKey: ["user-quests", userId],
      });
    },
    onError: (error) => {
      toast.error("Failed to reset daily quests. Please try again later.");
      console.error("Reset daily quest error:", error);
    },
  });
};

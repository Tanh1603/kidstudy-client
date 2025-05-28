/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
"use client";

import ChallengeDTO, { ChallengeForm } from "@/app/models/ChallengeDTO";
import ChallengeOptionDTO, { ChallengeOptionForm } from "@/app/models/ChallengeOptionDTO";
import {
  createChallengeOptions,
  deleteChallengeOptions,
  getChallengeOptionsByChallengeId,
  updateChallengeOptions,
} from "@/app/services/admin/challenge-options";
import {
  createChallenge,
  deleteChallenge,
  getChallenges,
  updateChallenge,
} from "@/app/services/admin/challenges";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useGetChallenge = () => {
  const { getToken } = useAuth();

  return useQuery<ChallengeDTO[]>({
    queryKey: ["challenges"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await getChallenges(token);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useCreateChallenge = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (create: ChallengeForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await createChallenge(token, create);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Create challenge successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateChallenge = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ChallengeForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateChallenge(token, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Update challenge successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useDeleteChallenge = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await deleteChallenge(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Delete challenges successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// challenge options
const useGetChallengeOptionsByChallengeId = (challengeId: number) => {
  const { getToken } = useAuth();

  return useQuery<ChallengeOptionDTO[]>({
    queryKey: ["challenge-options", challengeId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await getChallengeOptionsByChallengeId(token, challengeId);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    enabled: challengeId ? true : false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useCreateChallengeOption = (challengeId: number) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (create: ChallengeOptionForm) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await createChallengeOptions(create, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["challenge-options", challengeId],
      });
      toast.success("Create challenge successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateChallengeOption = (challengeId: number) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ChallengeOptionForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateChallengeOptions(update, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["challenge-options", challengeId],
      });
      toast.success("Update challenge successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useDeleteChallengeOption = (challengeId: number) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await deleteChallengeOptions(id, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["challenge-options", challengeId],
      });
      toast.success("Delete challenges successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export {
  useGetChallenge,
  useCreateChallenge,
  useUpdateChallenge,
  useDeleteChallenge,
  useGetChallengeOptionsByChallengeId,
  useCreateChallengeOption,
  useUpdateChallengeOption,
  useDeleteChallengeOption,
};

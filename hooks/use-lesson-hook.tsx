/* eslint-disable import/order */
"use client";

import LessonDTO, { LessonForm } from "@/app/models/Lesson";
import {
  createLesson,
  deleteLessonById,
  getLessons,
  updateLessonById,
} from "@/app/services/admin/lessons";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useGetLesson = () => {
  const { getToken } = useAuth();

  return useQuery<LessonDTO[]>({
    queryKey: ["lessons"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await getLessons(token);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
};

const useCreateLesson = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (create: LessonForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await createLesson(token, create);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Create lesson successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateLesson = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: LessonForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateLessonById(token, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Update lesson successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useDeleteLesson = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await deleteLessonById(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Delete lesson successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { useGetLesson, useCreateLesson, useUpdateLesson, useDeleteLesson };

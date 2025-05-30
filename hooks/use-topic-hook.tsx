/* eslint-disable import/order */
"use client";

import TopicDTO from "@/app/models/TopicDTO";
import {
  createTopic,
  deleteTopic,
  getTopicsForAdmin,
  updateIcon,
  updateTitle,
} from "@/app/services/admin/topic-service";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useGetTopicAdmin = () => {
  const { getToken } = useAuth();

  return useQuery<TopicDTO[]>({
    queryKey: ["topic-admin"],
    queryFn: async () => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await getTopicsForAdmin(token);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useGetTopicUser = () => {
  const { getToken } = useAuth();

  return useQuery<TopicDTO[]>({
    queryKey: ["topic-user"],
    queryFn: async () => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await getTopicsForAdmin(token);
    },
    throwOnError: (error) => {
      toast.error(error.message);
      return false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useUpdateTopicTitle = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateTitle(token, id, title);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topic-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["topic-user"] });
      toast.success("Topic created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateTopicIcon = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, icon }: { id: number; icon: File }) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateIcon(token, id, icon);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topic-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["topic-user"] });
      toast.success("Topic created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useDeleteTopic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await deleteTopic(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topic-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["topic-user"] });
      toast.success("Topic created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useCreateTopic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: FormData) => {
      const token = (await getToken()) as string;
      if (!token) {
        throw new Error("Token is required");
      }
      return await createTopic(token, topic);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topic-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["topic-user"] });
      toast.success("Topic created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export {
  useGetTopicAdmin,
  useGetTopicUser,
  useCreateTopic,
  useDeleteTopic,
  useUpdateTopicTitle,
  useUpdateTopicIcon,
};

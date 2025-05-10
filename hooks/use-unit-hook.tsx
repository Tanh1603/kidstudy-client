/* eslint-disable import/order */
"use client";
import UnitDTO, { UnitForm } from "@/app/models/UnitDTO";
import {
  createUnit,
  deleteUnitById,
  getUnits,
  updateUnitById,
} from "@/app/services/admin/units";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useUnit = () => {
  const { getToken } = useAuth();

  return useQuery<UnitDTO[]>({
    queryKey: ["units"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await getUnits(token);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useCreateUnit = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (create: UnitForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await createUnit(token, create);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Create unit successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateUnit = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: UnitForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await updateUnitById(token, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["units"] });
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Update unit successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useDeleteUnit = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is required");
      }
      return await deleteUnitById(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["units"] });
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Delete unit successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { useUnit, useCreateUnit, useUpdateUnit, useDeleteUnit };

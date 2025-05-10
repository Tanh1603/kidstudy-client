import { create } from "zustand";

// Định nghĩa TData có thể là bất kỳ loại dữ liệu nào
type AdminModalState<TData = unknown> = {
  type?: "unit" | "lesson" | "challenge" | "challenge-options";
  action?: "create" | "update";
  data?: TData;
  isOpen: boolean;
  onOpen: (
    type: "unit" | "lesson" | "challenge" | "challenge-options",
    action: "create" | "update",
    data?: TData
  ) => void;
  onClose: () => void;
};

export const useAdminModal = create<AdminModalState>((set) => ({
  type: undefined,
  action: undefined,
  data: undefined,
  isOpen: false,
  onOpen: (type, action, data) => set({ isOpen: true, type, action, data }),
  onClose: () =>
    set({ type: undefined, action: undefined, data: undefined, isOpen: false }),
}));

import { StateCreator } from "zustand"
import { AppUISlice } from "../types"

export const createAppUISlice: StateCreator<AppUISlice> = (set) => ({
  // UI State
  isCreateModalOpen: false,
  isDevelopModalOpen: false,
  selectedApp: null,
  isDeleteModalOpen: false,
  appToDelete: null,

  // UI Actions
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setDevelopModalOpen: (isOpen) => set({ isDevelopModalOpen: isOpen }),
  setSelectedApp: (app) => set({ selectedApp: app }),
  setDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  setAppToDelete: (app) => set({ appToDelete: app }),
  reset: () =>
    set({
      isCreateModalOpen: false,
      isDevelopModalOpen: false,
      selectedApp: null,
      isDeleteModalOpen: false,
      appToDelete: null,
    }),
})
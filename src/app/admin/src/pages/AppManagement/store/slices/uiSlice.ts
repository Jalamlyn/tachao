import { StateCreator } from "zustand"
import { AppStore, AppUISlice } from "../types"

export const createAppUISlice: StateCreator<
  AppStore,
  [],
  [],
  AppUISlice
> = (set) => ({
  // UI State
  isCreateModalOpen: false,
  isDevelopModalOpen: false,
  selectedApp: null,
  isDeleteModalOpen: false,
  appToDelete: null,
  isRenameModalOpen: false,
  appToRename: null,

  // UI Actions
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setDevelopModalOpen: (isOpen) => set({ isDevelopModalOpen: isOpen }),
  setSelectedApp: (app) => set({ selectedApp: app }),
  setDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  setAppToDelete: (app) => set({ appToDelete: app }),
  setRenameModalOpen: (isOpen) => set({ isRenameModalOpen: isOpen }),
  setAppToRename: (app) => set({ appToRename: app }),
  reset: () =>
    set({
      isCreateModalOpen: false,
      isDevelopModalOpen: false,
      selectedApp: null,
      isDeleteModalOpen: false,
      appToDelete: null,
      isRenameModalOpen: false,
      appToRename: null,
    }),
})
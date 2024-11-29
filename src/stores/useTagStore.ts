import { create } from 'zustand'

interface TagStore {
  lastUpdate: number
  tagsVersion: number
  updateTags: () => void
}

export const useTagStore = create<TagStore>((set) => ({
  lastUpdate: Date.now(),
  tagsVersion: 0,
  updateTags: () => set((state) => ({ 
    lastUpdate: Date.now(),
    tagsVersion: state.tagsVersion + 1
  })),
}))
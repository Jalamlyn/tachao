import { create } from "zustand"
import { AppStore } from "./types"
import { createAppUISlice } from "./slices/uiSlice"
import { createAppDataSlice } from "./slices/dataSlice"

export const useAppStore = create<AppStore>()((set, get) => ({
  ...createAppUISlice(set, get),
  ...createAppDataSlice(set, get),
}))

export type { AppIndex, CreateAppInput, UpdateAppConfigInput } from "./types"
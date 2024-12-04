import { create } from "zustand"
import { AppStore } from "./types"
import { createAppUISlice } from "./slices/uiSlice"
import { createAppDataSlice } from "./slices/dataSlice"

export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createAppUISlice(set, get, store),
  ...createAppDataSlice(set, get, store),
}))

export type { AppIndex, CreateAppInput, UpdateAppConfigInput } from "./types"

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TagStore {
  lastUpdate: number
  tagsVersion: number
  hasChanges: boolean
  updateTags: () => void
  setHasChanges: (value: boolean) => void
  resetChanges: () => void
}

export const useTagStore = create<TagStore>()(
  devtools(
    (set) => ({
      lastUpdate: Date.now(),
      tagsVersion: 0,
      hasChanges: false,
      updateTags: () => 
        set(
          (state) => ({ 
            lastUpdate: Date.now(),
            tagsVersion: state.tagsVersion + 1,
            hasChanges: false // 更新后重置状态
          }),
          false,
          'tags/updateTags'
        ),
      setHasChanges: (value: boolean) => 
        set(
          { hasChanges: value },
          false,
          'tags/setHasChanges'
        ),
      resetChanges: () => 
        set(
          { hasChanges: false },
          false,
          'tags/resetChanges'
        )
    }),
    {
      name: 'TagStore',
    }
  )
)
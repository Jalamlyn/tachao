import { create } from 'zustand'
import { ReactNode } from 'react'
import { useMetadata } from '@/hooks/useMetadata'
import message from '@/components/Message'

interface Message {
  role: string
  content: string | ReactNode
  id: string
  timestamp: string
  status?: string
}

interface SavePendingState {
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void
  save: (title: string) => Promise<void>
}

interface VersionSavePendingState {
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void
  save: (useCurrentVersion: boolean) => Promise<void>
}

interface AIFormState {
  // 消息相关
  messages: Message[]
  selectedTab: string
  previewContent: string
  
  // 模态框状态
  isTitleModalOpen: boolean
  isVersionSelectModalOpen: boolean
  isSuccessModalOpen: boolean
  
  // 表单状态
  newTitle: string
  savedTemplateId: string | null
  pendingSave: SavePendingState | null
  pendingVersionSave: VersionSavePendingState | null
  
  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedTab: (tab: string) => void
  setPreviewContent: (content: string) => void
  updateLastMessage: (update: Partial<Message>) => void
  
  // 模态框 actions
  setTitleModalOpen: (isOpen: boolean) => void
  setVersionSelectModalOpen: (isOpen: boolean) => void
  setSuccessModalOpen: (isOpen: boolean) => void
  
  // 表单 actions
  setNewTitle: (title: string) => void
  setSavedTemplateId: (id: string | null) => void
  setPendingSave: (state: SavePendingState | null) => void
  setPendingVersionSave: (state: VersionSavePendingState | null) => void
  
  // 复合 actions
  handleTitleConfirm: () => Promise<void>
  handleTitleCancel: () => void
  handleVersionSelectConfirm: (useCurrentVersion: boolean) => Promise<void>
  handleVersionSelectCancel: () => void
}

// 创建一个全局的消息缓冲区和定时器
let messageBuffer: string = '';
let updateTimeout: NodeJS.Timeout | null = null;
let isUpdating: boolean = false;

// 清理函数
const cleanup = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
  messageBuffer = '';
  isUpdating = false;
};

// 在组件卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}

export const useAIFormStore = create<AIFormState>((set, get) => ({
  // 初始状态
  messages: [],
  selectedTab: "preview",
  previewContent: "",
  
  isTitleModalOpen: false,
  isVersionSelectModalOpen: false,
  isSuccessModalOpen: false,
  
  newTitle: "",
  savedTemplateId: null,
  pendingSave: null,
  pendingVersionSave: null,

  // 基础 actions
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  setPreviewContent: (content) => set({ previewContent: content }),
  
  updateLastMessage: (update) => {
    const state = get();
    const lastIndex = state.messages.length - 1;
    
    if (lastIndex < 0) return;

    // 如果是文本内容更新，使用缓冲区
    if (typeof update.content === 'string' && !update.status) {
      messageBuffer += update.content;

      // 如果已经在更新中，不需要设置新的定时器
      if (isUpdating) return;

      // 设置更新标志
      isUpdating = true;

      // 清除之前的定时器
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // 设置新的定时器
      updateTimeout = setTimeout(() => {
        const currentState = get();
        const messages = [...currentState.messages];
        const currentLastIndex = messages.length - 1;

        if (currentLastIndex >= 0) {
          messages[currentLastIndex] = {
            ...messages[currentLastIndex],
            content: typeof messages[currentLastIndex].content === 'string'
              ? (messages[currentLastIndex].content as string) + messageBuffer
              : messageBuffer
          };

          set({ messages });
          
          // 重置缓冲区和更新标志
          messageBuffer = '';
          isUpdating = false;
        }
      }, 50); // 50ms 的防抖时间
    } else {
      // 对于非文本内容或状态更新，直接更新
      const messages = [...state.messages];
      messages[lastIndex] = {
        ...messages[lastIndex],
        ...update
      };
      set({ messages });
    }
  },

  // 模态框 actions
  setTitleModalOpen: (isOpen) => set({ isTitleModalOpen: isOpen }),
  setVersionSelectModalOpen: (isOpen) => set({ isVersionSelectModalOpen: isOpen }),
  setSuccessModalOpen: (isOpen) => set({ isSuccessModalOpen: isOpen }),

  // 表单 actions
  setNewTitle: (title) => set({ newTitle: title }),
  setSavedTemplateId: (id) => set({ savedTemplateId: id }),
  setPendingSave: (state) => set({ pendingSave: state }),
  setPendingVersionSave: (state) => set({ pendingVersionSave: state }),

  // 复合 actions
  handleTitleConfirm: async () => {
    const state = get();
    const trimmedTitle = state.newTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    if (state.pendingSave) {
      try {
        await state.pendingSave.save(trimmedTitle);
        state.pendingSave.resolve();
      } catch (error) {
        state.pendingSave.reject(error);
        throw error;
      } finally {
        set({ 
          pendingSave: null,
          isTitleModalOpen: false
        });
      }
    }
  },

  handleTitleCancel: () => {
    const state = get();
    if (state.pendingSave) {
      state.pendingSave.reject(new Error("用户取消保存"));
      set({ 
        pendingSave: null,
        isTitleModalOpen: false
      });
    }
  },

  handleVersionSelectConfirm: async (useCurrentVersion) => {
    const state = get();
    if (state.pendingVersionSave) {
      try {
        await state.pendingVersionSave.save(useCurrentVersion);
        state.pendingVersionSave.resolve();
        set({ isVersionSelectModalOpen: false });
      } catch (error) {
        state.pendingVersionSave.reject(error);
      } finally {
        set({ pendingVersionSave: null });
      }
    }
  },

  handleVersionSelectCancel: () => {
    const state = get();
    if (state.pendingVersionSave) {
      state.pendingVersionSave.reject(new Error("用户取消选择版本"));
      set({ 
        pendingVersionSave: null,
        isVersionSelectModalOpen: false
      });
    }
  }
}));

// 添加清理函数到 store
useAIFormStore.subscribe(() => {
  return () => cleanup();
});
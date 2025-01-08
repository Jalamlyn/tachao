import { StateCreator } from "zustand"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { AppStore, AppDataSlice, AppIndex, UpdateAppConfigInput, RenameAppInput } from "../types"

const QUERY_KEYS = {
  apps: ["apps"] as const,
}

interface UpdateAppConfigParams {
  appId: string
  input: UpdateAppConfigInput
}

export const createAppDataSlice: StateCreator<AppStore, [], [], AppDataSlice> = (set, get, store) => ({
  useApps: () => {
    const query = useQuery({
      queryKey: QUERY_KEYS.apps,
      queryFn: async () => {
        const result = await getMetadata(["app_index"])
        return result.data?.[0]?.value ? (JSON.parse(result.data[0].value) as AppIndex[]) : []
      },
    })

    return {
      apps: query.data || [],
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refetch: async () => {
        await query.refetch()
      },
    }
  },

  useCreateApp: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<string, Error, { title: string; template?: string }>({
      mutationFn: async (input) => {
        const newApp: AppIndex = {
          id: `app_${Date.now()}`,
          title: input.title,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          template: input.template || "enterprise",
          indexFields: {
            templateIds: [],
            reportIds: [],
          },
          pages: [],
        }

        const result = await getMetadata(["app_index"])
        const currentData = result.data?.[0]?.value ? (JSON.parse(result.data[0].value) as AppIndex[]) : []

        queryClient.setQueryData(QUERY_KEYS.apps, [...currentData, newApp])

        try {
          const updatedData = [...currentData, newApp]
          await setMetadata("app_index", JSON.stringify(updatedData))
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
          return newApp.id
        } catch (error) {
          queryClient.setQueryData(QUERY_KEYS.apps, currentData)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to create app:", error)
        message.error("创建应用失败")
      },
    })

    return {
      createApp: mutation.mutateAsync,
      isCreating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useUpdateAppConfig: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<void, Error, UpdateAppConfigParams>({
      mutationFn: async ({ appId, input }) => {
        if (!appId) {
          throw new Error("应用ID不能为空")
        }

        const result = await getMetadata(["app_index"])
        if (!result.data?.[0]?.value) {
          throw new Error("无法获取应用数据")
        }

        const currentData = JSON.parse(result.data[0].value) as AppIndex[]
        if (!Array.isArray(currentData) || currentData.length === 0) {
          throw new Error("应用数据格式错误")
        }

        const targetApp = currentData.find((app) => app.id === appId)
        if (!targetApp) {
          throw new Error(`未找到目标应用(ID: ${appId})`)
        }

        const updatedData = currentData.map((app) => {
          if (app.id === appId) {
            return {
              ...app,
              template: input.template || app.template,
              indexFields: {
                ...app.indexFields,
                templateIds: input.templateIds,
                reportIds: input.reportIds,
              },
              pages: input.pages || app.pages || [],
              homePageId: input.homePageId || app.homePageId,
              updatedAt: new Date().toISOString(),
            }
          }
          return app
        })
        queryClient.setQueryData(QUERY_KEYS.apps, updatedData)

        try {
          await setMetadata("app_index", JSON.stringify(updatedData))
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
        } catch (error) {
          queryClient.setQueryData(QUERY_KEYS.apps, currentData)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to update app config:", error)
        message.error(error instanceof Error ? error.message : "更新应用配置失败")
      },
    })

    return {
      updateAppConfig: mutation.mutateAsync,
      isUpdating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useDeleteApp: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<void, Error, string>({
      mutationFn: async (appId: string) => {
        if (!appId) {
          throw new Error("应用ID不能为空")
        }

        const result = await getMetadata(["app_index"])
        if (!result.data?.[0]?.value) {
          throw new Error("无法获取应用数据")
        }

        const currentData = JSON.parse(result.data[0].value) as AppIndex[]
        if (!Array.isArray(currentData) || currentData.length === 0) {
          throw new Error("应用数据格式错误")
        }

        const updatedData = currentData.filter((app) => app.id !== appId)
        queryClient.setQueryData(QUERY_KEYS.apps, updatedData)

        try {
          await setMetadata("app_index", JSON.stringify(updatedData))
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
        } catch (error) {
          queryClient.setQueryData(QUERY_KEYS.apps, currentData)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to delete app:", error)
        message.error(error instanceof Error ? error.message : "删除应用失败")
      },
    })

    return {
      deleteApp: mutation.mutateAsync,
      isDeleting: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useRenameApp: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<void, Error, RenameAppInput>({
      mutationFn: async ({ id, title }) => {
        if (!id) {
          throw new Error("应用ID不能为空")
        }

        if (!title.trim()) {
          throw new Error("应用名称不能为空")
        }

        const result = await getMetadata(["app_index"])
        if (!result.data?.[0]?.value) {
          throw new Error("无法获取应用数据")
        }

        const currentData = JSON.parse(result.data[0].value) as AppIndex[]
        if (!Array.isArray(currentData) || currentData.length === 0) {
          throw new Error("应用数据格式错误")
        }

        const updatedData = currentData.map((app) => {
          if (app.id === id) {
            return {
              ...app,
              title: title.trim(),
              updatedAt: new Date().toISOString(),
            }
          }
          return app
        })

        queryClient.setQueryData(QUERY_KEYS.apps, updatedData)

        try {
          await setMetadata("app_index", JSON.stringify(updatedData))
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
          message.success("应用重命名成功")
        } catch (error) {
          queryClient.setQueryData(QUERY_KEYS.apps, currentData)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to rename app:", error)
        message.error(error instanceof Error ? error.message : "重命名应用失败")
      },
    })

    return {
      renameApp: mutation.mutateAsync,
      isRenaming: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },
})
import { StateCreator } from "zustand"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { AppDataSlice, AppIndex } from "../types"

const QUERY_KEYS = {
  apps: ["apps"] as const,
}

export const createAppDataSlice: StateCreator<AppDataSlice> = () => ({
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
    const mutation = useMutation({
      mutationFn: async (input) => {
        const newApp: AppIndex = {
          id: `app_${Date.now()}`,
          title: input.title,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          template: "default",
          indexFields: {
            templateIds: [],
            reportIds: [],
          },
        }

        const result = await getMetadata(["app_index"])
        const currentData = result.data?.[0]?.value ? (JSON.parse(result.data[0].value) as AppIndex[]) : []

        queryClient.setQueryData(QUERY_KEYS.apps, [...currentData, newApp])

        try {
          const updatedData = [...currentData, newApp]
          await setMetadata("app_index", JSON.stringify(updatedData))
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
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
    const mutation = useMutation({
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
    const mutation = useMutation({
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
})
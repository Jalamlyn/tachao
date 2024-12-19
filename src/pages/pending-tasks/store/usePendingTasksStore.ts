import { create } from "zustand"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

const PERMISSION_REQUESTS_KEY = 'permission_requests'

export interface Task {
  id: string
  title: string
  description: string
  time: string
  type: "sync" | "auth" | "report" | "permission_request"
  status: "pending" | "processing" | "completed" | "rejected"
  priority: "high" | "medium" | "low"
  department: string
  user: string
  avatar: string
  metadata?: any
}

interface PendingTasksStore {
  tasks: Task[]
  activeTab: string
  isLoading: boolean
  loadTasks: () => Promise<void>
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>
  setActiveTab: (tab: string) => void
}

export const usePendingTasksStore = create<PendingTasksStore>((set) => ({
  tasks: [],
  activeTab: 'permission_requests',
  isLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  loadTasks: async () => {
    set({ isLoading: true })
    try {
      const result = await getMetadata([PERMISSION_REQUESTS_KEY])
      const permissionRequests = JSON.parse(result.data?.[0]?.value || '{}')
      
      const tasks = Object.values(permissionRequests)
        .filter((request: any) => request.status === 'pending')
        .map((request: any) => ({
          id: request.id,
          title: `访问权限申请 - ${request.resourceType}`,
          description: request.reason,
          type: 'permission_request',
          status: 'pending',
          priority: 'medium',
          department: '系统',
          user: request.requesterName,
          time: new Date(request.createdAt).toLocaleString(),
          avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          metadata: request
        }))

      set({ tasks })
    } catch (error) {
      console.error("Error loading tasks:", error)
      message.error("加载任务失败")
    } finally {
      set({ isLoading: false })
    }
  },
  updateTaskStatus: async (taskId: string, status: Task["status"]) => {
    try {
      const result = await getMetadata([PERMISSION_REQUESTS_KEY])
      const requests = JSON.parse(result.data?.[0]?.value || '{}')
      
      if (requests[taskId]) {
        requests[taskId].status = status
        requests[taskId].updatedAt = new Date().toISOString()
        
        await setMetadata(PERMISSION_REQUESTS_KEY, JSON.stringify(requests))
        
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }))
        
        message.success(status === 'completed' ? '已批准权限申请' : '已拒绝权限申请')
      }
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))
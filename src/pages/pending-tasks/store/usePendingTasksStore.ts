import { create } from "zustand"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { addPermission } from "@/permissions/utils/permissionUtils"

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
  activeStatus: string
  isLoading: boolean
  loadTasks: () => Promise<void>
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>
  setActiveTab: (tab: string) => void
  setActiveStatus: (status: string) => void
}

export const usePendingTasksStore = create<PendingTasksStore>((set) => ({
  tasks: [],
  activeTab: 'permission_requests',
  activeStatus: 'pending',
  isLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveStatus: (status) => set({ activeStatus: status }),
  loadTasks: async () => {
    set({ isLoading: true })
    try {
      const result = await getMetadata([PERMISSION_REQUESTS_KEY])
      const permissionRequests = JSON.parse(result.data?.[0]?.value || '{}')
      
      const tasks = Object.values(permissionRequests)
        .map((request: any) => ({
          id: request.id,
          title: `访问权限申请 - ${request.resourceType}`,
          description: request.reason,
          type: 'permission_request',
          status: request.status,
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
        const request = requests[taskId]
        request.status = status
        request.updatedAt = new Date().toISOString()
        
        if (status === 'completed') {
          await addPermission(
            request.resourceType,
            request.resourceId,
            request.requesterId,
            'viewer'
          )
        }
        
        await setMetadata(PERMISSION_REQUESTS_KEY, JSON.stringify(requests))
        
        // 更新本地状态，但不移除任务
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, status, time: new Date().toLocaleString() }
              : task
          )
        }))
        
        message.success(status === 'completed' ? '已批准权限申请' : '已拒绝权限申请')
      }
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))
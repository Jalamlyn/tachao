import { create } from "zustand"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

export interface Task {
  id: string
  title: string
  description: string
  time: string
  type: "sync" | "auth" | "report"
  status: "pending" | "processing" | "completed"
  priority: "high" | "medium" | "low"
  department: string
  user: string
  avatar: string
}

interface PendingTasksStore {
  tasks: Task[]
  isLoading: boolean
  loadTasks: () => Promise<void>
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>
}

// 模拟数据
const mockTasks: Task[] = [
  {
    id: "1",
    title: "新的数据同步请求",
    description: "来自销售部门的数据同步申请需要您的审批",
    time: "10分钟前",
    type: "sync",
    status: "pending",
    priority: "high",
    department: "销售部",
    user: "张经理",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: "2",
    title: "系统权限申请",
    description: "人力资源部门请求访问表单管理系统的权限",
    time: "30分钟前",
    type: "auth",
    status: "pending",
    priority: "medium",
    department: "人力资源",
    user: "李主管",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024c",
  },
  {
    id: "3",
    title: "报表访问授权",
    description: "财务部门申请查看月度销售报表的权限",
    time: "2小时前",
    type: "report",
    status: "pending",
    priority: "low",
    department: "财务部",
    user: "王总监",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024b",
  },
]

export const usePendingTasksStore = create<PendingTasksStore>((set) => ({
  tasks: [],
  isLoading: false,
  loadTasks: async () => {
    set({ isLoading: true })
    try {
      // TODO: 替换为实际的API调用
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ tasks: mockTasks })
    } catch (error) {
      console.error("Error loading tasks:", error)
      message.error("加载任务失败")
    } finally {
      set({ isLoading: false })
    }
  },
  updateTaskStatus: async (taskId, status) => {
    try {
      // TODO: 替换为实际的API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      }))
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))

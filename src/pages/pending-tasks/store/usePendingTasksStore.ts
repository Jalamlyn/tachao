import { create } from "zustand"
import { queryWaitList, createRamAccount } from "@/service/apis/api"
import message from "@/components/Message"
import { addPermission } from "@/permissions/utils/permissionUtils"
import { setPhoneOrgMapping } from "@/service/apis/metadata"

// 资源类型映射
const resourceTypeMap = {
  app: "应用",
  form: "表单",
  report: "报表",
  page: "页面",
  resource: "资源",
  template: "表单模板"
}

// 角色映射
const roleMap = {
  viewer: "查看",
  editor: "编辑",
  admin: "管理"
}

export interface Task {
  id: string
  title: string
  description: string
  time: string
  type: "sync" | "auth" | "report" | "permission_request" | "account_request"
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

// 格式化权限角色显示
const formatRoles = (roles: string | string[]): string => {
  if (Array.isArray(roles)) {
    return roles.map(role => roleMap[role] || role).join("和")
  }
  return roleMap[roles] || roles
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
      // 加载等待列表数据
      const result = await queryWaitList({})
      
      const tasks = result.data.map((item: any) => {
        const isAccountRequest = item.purpose?.startsWith('account_request:')
        const organizationId = isAccountRequest ? item.purpose.split(':')[1] : null
        
        return {
          id: item.id,
          title: isAccountRequest 
            ? `来自 ${item.phone} 的账号申请`
            : `${item.type} 申请`,
          description: isAccountRequest
            ? `申请加入企业：${item.industry}`
            : item.purpose,
          type: isAccountRequest ? 'account_request' : 'permission_request',
          status: item.status || 'pending',
          priority: 'medium',
          department: '系统',
          user: item.phone || item.email,
          time: new Date(item.createdAt).toLocaleString(),
          avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          metadata: {
            ...item,
            organizationId
          }
        }
      })

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
      // 更新等待列表状态
      await queryWaitList({
        id: taskId,
        status
      })
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status, time: new Date().toLocaleString() }
            : task
        )
      }))

      // 如果是账号申请且状态为已完成，则创建账号
      const task = state.tasks.find(t => t.id === taskId)
      if (task?.type === 'account_request' && status === 'completed') {
        const { phone, organizationId } = task.metadata
        
        // 创建账号
        await createRamAccount({
          name: phone,
          account: phone,
          password: phone
        })
        
        // 设置手机号-组织映射
        await setPhoneOrgMapping(phone, organizationId)
      }
      
      message.success(status === 'completed' ? '已批准申请' : '已拒绝申请')
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))
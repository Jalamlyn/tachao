import { create } from "zustand"
import { getMetadata, setMetadata, setPhoneOrgMapping } from "@/service/apis/metadata"
import message from "@/components/Message"
import { addPermission } from "@/permissions/utils/permissionUtils"
import { createRamAccount } from "@/service/apis/api"

const PERMISSION_REQUESTS_KEY = 'permission_requests'
const ACCOUNT_REQUESTS_KEY = 'account_requests'

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
      // 加载权限申请
      const permissionResult = await getMetadata([PERMISSION_REQUESTS_KEY])
      const permissionRequests = JSON.parse(permissionResult.data?.[0]?.value || '{}')
      
      const permissionTasks = Object.values(permissionRequests)
        .map((request: any) => ({
          id: request.id,
          title: `${resourceTypeMap[request.resourceType] || request.resourceType}「${request.resourceTitle}」的${formatRoles(request.role)}权限申请`,
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

      // 加载账号申请
      const accountResult = await getMetadata([ACCOUNT_REQUESTS_KEY])
      const accountRequests = JSON.parse(accountResult.data?.[0]?.value || '{}')

      const accountTasks = Object.values(accountRequests)
        .map((request: any) => ({
          id: request.id,
          title: `来自 ${request.phone} 的账号申请`,
          description: `申请加入企业：${request.organizationName}`,
          type: 'account_request',
          status: request.status,
          priority: 'medium',
          department: '系统',
          user: request.phone,
          time: new Date(request.createdAt).toLocaleString(),
          avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          metadata: request
        }))

      set({ tasks: [...permissionTasks, ...accountTasks] })
    } catch (error) {
      console.error("Error loading tasks:", error)
      message.error("加载任务失败")
    } finally {
      set({ isLoading: false })
    }
  },
  updateTaskStatus: async (taskId: string, status: Task["status"]) => {
    try {
      const result = await getMetadata([PERMISSION_REQUESTS_KEY, ACCOUNT_REQUESTS_KEY])
      const permissionRequests = JSON.parse(result.data?.[0]?.value || '{}')
      const accountRequests = JSON.parse(result.data?.[1]?.value || '{}')
      
      // 处理权限申请
      if (permissionRequests[taskId]) {
        const request = permissionRequests[taskId]
        request.status = status
        request.updatedAt = new Date().toISOString()
        
        if (status === 'completed') {
          await addPermission(
            request.resourceType,
            request.resourceId,
            request.requesterId,
            request.role
          )
        }
        
        await setMetadata(PERMISSION_REQUESTS_KEY, JSON.stringify(permissionRequests))
      }
      
      // 处理账号申请
      if (accountRequests[taskId]) {
        const request = accountRequests[taskId]
        request.status = status
        request.updatedAt = new Date().toISOString()
        
        if (status === 'completed') {
          // 创建账号
          await createRamAccount({
            name: request.phone,
            account: request.phone,
            password: request.phone
          })
          
          // 设置手机号-组织映射
          await setPhoneOrgMapping(request.phone, request.organizationId)
        }
        
        await setMetadata(ACCOUNT_REQUESTS_KEY, JSON.stringify(accountRequests))
      }
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status, time: new Date().toLocaleString() }
            : task
        )
      }))
      
      message.success(status === 'completed' ? '已批准申请' : '已拒绝申请')
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))
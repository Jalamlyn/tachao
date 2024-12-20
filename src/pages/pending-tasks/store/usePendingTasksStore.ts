import { create } from "zustand"
import { queryWaitList, createRamAccount, queryRamAccount } from "@/service/apis/api"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { setPhoneOrgMapping } from "@/service/apis/metadata"
import { jsonParse } from "@/utils"
import { addPermission } from "@/permissions/utils/permissionUtils"

const PERMISSION_REQUESTS_KEY = "permission_requests"

// 资源类型映射
const resourceTypeMap = {
  app: "应用",
  form: "表单",
  report: "报表",
  page: "页面",
  resource: "资源",
  template: "表单模板",
}

// 角色映射
const roleMap = {
  viewer: "查看",
  editor: "编辑",
  admin: "管理",
  creator: "创建",
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
    return roles.map((role) => roleMap[role] || role).join("和")
  }
  return roleMap[roles] || roles
}

export const usePendingTasksStore = create<PendingTasksStore>((set) => ({
  tasks: [],
  activeTab: "permission_requests",
  activeStatus: "pending",
  isLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveStatus: (status) => set({ activeStatus: status }),
  loadTasks: async () => {
    set({ isLoading: true })
    try {
      // 1. 加载权限申请数据
      const permissionResult = await getMetadata([PERMISSION_REQUESTS_KEY])
      const permissionRequests = JSON.parse(permissionResult.data?.[0]?.value || "{}")

      const permissionTasks = Object.values(permissionRequests).map((request: any) => ({
        id: request.id,
        title: `${resourceTypeMap[request.resourceType] || request.resourceType}「${request.resourceTitle}」的${formatRoles(request.role)}权限申请`,
        description: request.reason,
        type: "permission_request",
        status: request.status,
        priority: "medium",
        department: "系统",
        user: request.requesterName,
        time: new Date(request.createdAt).toLocaleString(),
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        metadata: request,
      }))

      // 2. 获取所有现有RAM账号
      const ramAccountsResult = await queryRamAccount()
      const existingAccounts = ramAccountsResult.data.map(acc => acc.account)

      // 3. 加载账号申请数据
      const waitlistResult = await queryWaitList({})
      const _waitlistResult = waitlistResult.data.filter((item) => {
        const requestInfo = jsonParse(item.purpose)
        if (!requestInfo.phone) return false
        
        // 检查 wb_手机号 是否已存在
        const accountName = `wb_${requestInfo.phone}`
        return !existingAccounts.includes(accountName)
      })

      const accountTasks = _waitlistResult.map((item: any) => {
        const requestInfo = jsonParse(item.purpose)
        const isAccountRequest = requestInfo.type === "account_request"
        const organizationId = isAccountRequest ? requestInfo.organizationId : null
        const cachedLabel = localStorage.getItem("cachedLabel")
        return {
          id: item.id,
          title: isAccountRequest ? `来自 ${requestInfo.phone} 的账号申请` : `${item.type} 申请`,
          description: isAccountRequest ? `申请加入企业：${cachedLabel}` : "申请开通账号",
          type: "account_request",
          status: item.status || "pending",
          priority: "medium",
          department: "系统",
          user: item.email,
          time: new Date(item.createdAt).toLocaleString(),
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
          metadata: {
            ...item,
            organizationId,
          },
        }
      })

      // 3. 合并两种任务
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
      // 获取当前任务
      const state = usePendingTasksStore.getState()
      const task = state.tasks.find((t) => t.id === taskId)

      if (!task) {
        throw new Error("Task not found")
      }

      if (task.type === "permission_request") {
        // 处理权限申请
        const result = await getMetadata([PERMISSION_REQUESTS_KEY])
        const requests = JSON.parse(result.data?.[0]?.value || "{}")

        if (requests[taskId]) {
          const request = requests[taskId]
          request.status = status
          request.updatedAt = new Date().toISOString()

          if (status === "completed") {
            await addPermission(request.resourceType, request.resourceId, request.requesterId, request.role)
          }

          await setMetadata(PERMISSION_REQUESTS_KEY, JSON.stringify(requests))
          message.success(status === "completed" ? "已批准权限申请" : "已拒绝权限申请")
        }
      } else if (task.type === "account_request") {
        // 处理账号申请
        await queryWaitList({
          id: taskId,
          status,
        })

        if (status === "completed") {
          const { phone, organizationId } = task.metadata
          await createRamAccount({
            name: `wb_${phone}`,
            account: `wb_${phone}`,
            password: phone,
          })
          await setPhoneOrgMapping(phone, organizationId)
        }
        message.success(status === "completed" ? "已开通账号" : "已拒绝账号申请")
      }

      // 更新本地状态
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status, time: new Date().toLocaleString() } : task
        ),
      }))
    } catch (error) {
      console.error("Error updating task status:", error)
      message.error("更新任务状态失败")
    }
  },
}))
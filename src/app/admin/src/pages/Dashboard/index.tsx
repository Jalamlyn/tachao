import React, { useEffect, useState } from "react"
import { Card, CardBody, Chip, Button, Tabs, Tab, ScrollShadow, CardHeader } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { usePendingTasksStore } from "@/app/admin/src/pages/PendingTasks/store/usePendingTasksStore"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import ProductManagerModal from "./ProductManagerModal"
import StatsSection from "./StatsSection"
import WelcomeCard from "./WelcomeCard"
import AIChat from "@/app/admin/src/components/AIChat"
import { useNavigate } from "react-router-dom"
import { useMetadata } from "@/hooks/metadata"
import { apiService } from "@/service/apis/api"
import { useGlobalUser } from "@/hooks/useGlobalUser"

// 新增引导组件
const GuidanceSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-6"
  >
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex gap-3 px-6 pt-6">
        <Icon icon="solar:book-linear" className="w-6 h-6 text-primary" />
        <div className="flex flex-col">
          <p className="text-lg font-semibold">新手入门指南</p>
          <p className="text-small text-default-500">从这里开始您的应用开发之旅</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4 px-6 py-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:clipboard-list-linear" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">规划您的应用</h4>
              <p className="text-sm text-default-500">明确目标用户和核心功能</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:widget-add-linear" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">创建应用</h4>
              <p className="text-sm text-default-500">配置基本信息和功能模块</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:test-tube-linear" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">测试和发布</h4>
              <p className="text-sm text-default-500">确保应用稳定运行</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>

    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex gap-3 px-6 pt-6">
        <Icon icon="solar:lightbulb-linear" className="w-6 h-6 text-warning" />
        <div className="flex flex-col">
          <p className="text-lg font-semibold">使用技巧</p>
          <p className="text-small text-default-500">帮助您更好地使用平台</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4 px-6 py-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Icon icon="solar:magic-stick-linear" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-medium">AI 助手</h4>
              <p className="text-sm text-default-500">使用 AI 助手加速开发</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Icon icon="solar:puzzle-piece-linear" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-medium">组件库</h4>
              <p className="text-sm text-default-500">丰富的组件助您快速搭建</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Icon icon="solar:shield-keyhole-linear" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-medium">安全建议</h4>
              <p className="text-sm text-default-500">保护您的应用安全</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  </motion.div>
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { items: apps, load: loadApps } = useMetadata("app")
  const { tasks, loadTasks } = usePendingTasksStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showProductManager, setShowProductManager] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const [showAIChat, setShowAIChat] = useState(false)
  const { userInfo } = useGlobalUser()
  const isAdmin = userInfo?.role === "admin"

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/admin" }])
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadApps(), loadTasks()])
        const fileResponse = await apiService.post(
          "/public/data/file/activitiess/find",
          {},
          {
            params: { display: "paginate" },
          }
        )
        const totalFiles = fileResponse.data.data.reduce((total, activity) => {
          return total + (activity.files?.length || 0)
        }, 0)
        setFileCount(totalFiles)
      } catch (error) {
        console.error("Load dashboard data error:", error)
        setFileCount(0)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [loadApps, loadTasks])

  const pendingTasksCount = tasks.filter((task) => task.status === "pending").length

  const stats = [
    {
      label: "应用总数",
      value: apps.length.toString(),
      icon: "solar:widget-linear",
      color: "primary",
    },
    {
      label: "待处理任务",
      value: pendingTasksCount.toString(),
      icon: "solar:list-check-linear",
      color: "warning",
    },
    {
      label: "企业网盘",
      value: `${fileCount} 个文件`,
      icon: "solar:folder-with-files-linear",
      color: "secondary",
      onClick: () => navigate("/admin/file-manager"),
    },
  ]

  const quickActions = [
    {
      label: "创建应用",
      icon: "solar:widget-add-linear",
      path: "/admin/apps",
    },
    {
      label: "待处理任务",
      icon: "solar:list-check-linear",
      path: "/admin/pending-tasks",
    },
    {
      label: "企业网盘",
      icon: "solar:folder-with-files-linear",
      path: "/admin/file-manager",
    },
    {
      label: "企业设置",
      icon: "solar:settings-linear",
      path: "/admin/settings",
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <WelcomeCard setShowProductManager={setShowProductManager} appsCount={apps.length} />
          
          {isAdmin ? (
            <>
              <StatsSection stats={stats} appsCount={apps.length} />
              {apps.length > 0 && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="lg:col-span-1"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex gap-3 px-6 pt-6">
                          <Icon icon="solar:flash-linear" className="w-6 h-6 text-warning" />
                          <div className="flex flex-col">
                            <p className="text-lg font-semibold">快速操作</p>
                            <p className="text-small text-default-500">常用功能快捷入口</p>
                          </div>
                        </CardHeader>
                        <CardBody className="gap-4 px-6 py-4">
                          <AnimatePresence>
                            {quickActions.map((action, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Button
                                  className="w-full justify-start bg-gray-50 hover:bg-slate-100"
                                  startContent={<Icon icon={action.icon} className="w-5 h-5" />}
                                  variant="flat"
                                  onPress={() => navigate(action.path)}
                                >
                                  {action.label}
                                </Button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </CardBody>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="lg:col-span-2"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex justify-between items-center px-6 pt-6">
                          <div className="flex gap-3">
                            <Icon icon="solar:bell-bing-linear" className="w-6 h-6 text-primary" />
                            <div className="flex flex-col">
                              <p className="text-lg font-semibold">待处理事项</p>
                              <p className="text-small text-default-500">需要您审批或处理的任务</p>
                            </div>
                          </div>
                          <Button
                            variant="light"
                            color="primary"
                            size="sm"
                            endContent={<Icon icon="solar:arrow-right-linear" />}
                            onPress={() => navigate("/admin/pending-tasks")}
                          >
                            查看更多
                          </Button>
                        </CardHeader>
                        <CardBody className="max-h-60">
                          <ScrollShadow>
                            <AnimatePresence>
                              {tasks
                                .filter((task) => task.status === "pending")
                                .slice(0, 3)
                                .map((task, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-4 p-4 hover:bg-default-100 transition-all border-b last:border-b-0"
                                  >
                                    <div className="relative">
                                      <img src={task.avatar} alt={task.user} className="w-10 h-10 rounded-full" />
                                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary/10">
                                        <Icon icon="solar:shield-user-bold-duotone" className="w-4 h-4 text-primary" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium">{task.title}</p>
                                          <Chip size="sm" variant="flat" color="primary">
                                            权限申请
                                          </Chip>
                                        </div>
                                        <span className="text-small text-default-400">{task.time}</span>
                                      </div>
                                      <p className="text-small text-default-500 mt-1">{task.description}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-small text-default-500">{task.user}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              {tasks.filter((task) => task.status === "pending").length === 0 && (
                                <div className="flex items-center justify-center py-8 text-default-400">
                                  <p>暂无待处理事项</p>
                                </div>
                              )}
                            </AnimatePresence>
                          </ScrollShadow>
                        </CardBody>
                      </Card>
                    </motion.div>
                  </div>
                </>
              )}
            </>
          ) : (
            <GuidanceSection />
          )}
        </>
      )}

      <ProductManagerModal isOpen={showProductManager} onClose={() => setShowProductManager(false)} />

      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6"
      >
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onPress={() => setShowAIChat(true)}
        >
          <Icon icon="hugeicons:ai-chat-02" className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  )
}

export default Dashboard
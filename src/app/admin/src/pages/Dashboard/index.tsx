import React, { useEffect, useState } from "react"
import { Card, CardBody, Chip, Button, Spinner, Tabs, Tab, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/app/admin/src/component/PageLayout"
import { usePendingTasksStore } from "@/app/admin/src/pages/PendingTasks/store/usePendingTasksStore"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import TutorialModal from "./TutorialModal"
import StatsSection from "./StatsSection"
import WelcomeCard from "./WelcomeCard"
import AIChat from "@/app/admin/src/component/AIChat"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { items: apps, load: loadApps } = useMetadata("app")
  const { tasks, loadTasks } = usePendingTasksStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const [showAIChat, setShowAIChat] = useState(false)

  // AI助手提示词
  const aiHelpContent = `您好!我是即想 AI 助手,我可以帮您:

1. 功能概览
- 应用管理:创建和管理企业应用
- 待处理任务:处理权限申请等待办事项
- 企业网盘:管理企业文件资源
- 企业设置:管理账号、费用等企业配置

2. 常见问题指南

A. 应用管理相关:
- "如何创建一个新应用?"
- "如何使用 AI 开发应用?"
- "如何管理应用权限?"
- "如何发布和更新应用?"

B. 待处理任务相关:
- "如何处理权限申请?"
- "如何查看历史处理记录?"
- "如何设置任务优先级?"

C. 企业网盘相关:
- "如何上传和管理文件?"
- "如何设置文件访问权限?"
- "如何共享文件给其他用户?"

D. 企业设置相关:
- "如何创建和管理账号?"
- "如何查看费用明细?"
- "如何管理订阅和续费?"
- "如何设置角色和权限?"

您可以直接问我任何关于系统使用的问题,我会为您提供详细的解答和操作指导。`

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/admin" }])
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadApps(), loadTasks()])
        // 获取文件列表数据
        const fileResponse = await apiService.post(
          "/public/data/file/activitiess/find",
          {},
          {
            params: { display: "paginate" },
          }
        )
        // 计算所有activities中的文件总数
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

  // 只统计待处理(pending)状态的任务
  const pendingTasksCount = tasks.filter(task => task.status === 'pending').length

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
    {
      label: "AI 对话",
      value: "立即体验",
      icon: "solar:chat-square-code-linear",
      color: "success",
      onClick: () => setShowAIChat(true),
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
    <div className='p-4 space-y-6'>
      {isLoading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      ) : (
        <>
          <WelcomeCard setShowTutorial={setShowTutorial} appsCount={apps.length} />
          <StatsSection stats={stats} appsCount={apps.length} />

          {apps.length > 0 && (
            <>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className='lg:col-span-1'
                >
                  <Card className='hover:shadow-lg transition-all duration-300'>
                    <CardHeader className='flex gap-3 px-6 pt-6'>
                      <Icon icon='solar:flash-linear' className='w-6 h-6 text-warning' />
                      <div className='flex flex-col'>
                        <p className='text-lg font-semibold'>快速操作</p>
                        <p className='text-small text-default-500'>常用功能快捷入口</p>
                      </div>
                    </CardHeader>
                    <CardBody className='gap-4 px-6 py-4'>
                      <AnimatePresence>
                        {quickActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              className='w-full justify-start bg-gray-50 hover:bg-slate-100'
                              startContent={<Icon icon={action.icon} className='w-5 h-5' />}
                              variant='flat'
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
                  className='lg:col-span-2'
                >
                  <Card className='hover:shadow-lg transition-all duration-300'>
                    <CardHeader className='flex justify-between items-center px-6 pt-6'>
                      <div className='flex gap-3'>
                        <Icon icon='solar:bell-bing-linear' className='w-6 h-6 text-primary' />
                        <div className='flex flex-col'>
                          <p className='text-lg font-semibold'>待处理事项</p>
                          <p className='text-small text-default-500'>需要您审批或处理的任务</p>
                        </div>
                      </div>
                      <Button
                        variant='light'
                        color='primary'
                        size='sm'
                        endContent={<Icon icon='solar:arrow-right-linear' />}
                        onPress={() => navigate("/admin/pending-tasks")}
                      >
                        查看更多
                      </Button>
                    </CardHeader>
                    <CardBody className='max-h-60'>
                      <ScrollShadow>
                        <AnimatePresence>
                          {tasks.filter(task => task.status === 'pending').slice(0, 3).map((task, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className='flex items-start gap-4 p-4 hover:bg-default-100 transition-all border-b last:border-b-0'
                            >
                              <div className='relative'>
                                <img src={task.avatar} alt={task.user} className='w-10 h-10 rounded-full' />
                                <div className='absolute -bottom-1 -right-1 p-1 rounded-full bg-primary/10'>
                                  <Icon icon='solar:shield-user-bold-duotone' className='w-4 h-4 text-primary' />
                                </div>
                              </div>
                              <div className='flex-1'>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-2'>
                                    <p className='font-medium'>{task.title}</p>
                                    <Chip size='sm' variant='flat' color='primary'>
                                      权限申请
                                    </Chip>
                                  </div>
                                  <span className='text-small text-default-400'>{task.time}</span>
                                </div>
                                <p className='text-small text-default-500 mt-1'>{task.description}</p>
                                <div className='flex items-center gap-2 mt-2'>
                                  <span className='text-small text-default-500'>{task.user}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {tasks.filter(task => task.status === 'pending').length === 0 && (
                            <div className='flex items-center justify-center py-8 text-default-400'>
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
      )}

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      <AIChat 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)}
        initialMessage={aiHelpContent}
      />

      {/* 悬浮的 AI 助手按钮 */}
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
          <Icon icon="solar:bot-linear" className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  )
}

export default Dashboard
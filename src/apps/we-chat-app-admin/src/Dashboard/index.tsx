import React, { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Button, Chip, ScrollShadow, Image } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { motion, AnimatePresence } from "framer-motion"
import { useMetadata } from "@/hooks/metadata"
import { usePendingTasksStore } from "@/pages/pending-tasks/store/usePendingTasksStore"
import { cn } from "@nextui-org/react"
import welcome from "./welcome.png"

const WelcomeCard = ({ appsCount }) => {
  const navigate = useNavigate()

  if (appsCount === 0) {
    return (
      <Card className='bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden'>
        <CardBody className='p-8 relative'>
          <div className='flex items-start justify-between relative z-10'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='p-2 bg-white/10 rounded-full'>
                  <span className='text-xl'>👋</span>
                </motion.div>
                <h1 className='text-3xl font-bold'>欢迎开启您的数字化之旅</h1>
              </div>
              <p className='text-white/80 text-lg mb-6'>让我们从创建第一个应用开始，AI助手将全程指导您完成开发</p>
              <div className='flex items-center gap-4'>
                <Button
                  className='bg-white text-primary-900 font-medium'
                  size='lg'
                  startContent={<Icon icon='solar:rocket-linear' />}
                  onPress={() => navigate("/we-chat-app/admin/apps")}
                >
                  开始创建应用
                </Button>
                <Button
                  className='bg-white/10 text-white font-medium'
                  size='lg'
                  variant='ghost'
                  startContent={<Icon icon='solar:play-circle-linear' />}
                >
                  查看教程
                </Button>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='hidden lg:block'>
              <Image src={welcome} className='w-64' />
            </motion.div>
          </div>
          <div className='absolute right-0 bottom-0 opacity-10'>
            <Icon icon='solar:cube-linear' className='w-32 h-32' />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className='bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden rounded-lg'>
      <CardBody className='p-8 relative'>
        <div className='flex items-start justify-between relative z-10'>
          <div>
            <h1 className='text-3xl font-bold mb-3'>欢迎回来 👋</h1>
            <p className='text-white/80 text-lg'>这里是您的工作台概览</p>
          </div>
          <Button
            startContent={<Icon icon='solar:rocket-linear' className='text-xl' />}
            onPress={() => navigate("/we-chat-app/admin/documents/create")}
          >
            创建表单模板
          </Button>
        </div>
        <div className='absolute right-0 bottom-0 opacity-10'>
          <Icon icon='solar:cube-linear' className='w-32 h-32' />
        </div>
      </CardBody>
    </Card>
  )
}

const StatsSection = ({ stats, appsCount }) => {
  if (appsCount === 0) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
      >
        {[
          {
            title: "配置基本信息",
            icon: "solar:settings-linear",
            description: "设置应用名称、图标等基本信息",
          },
          {
            title: "AI助手对话",
            icon: "solar:chat-round-dots-linear",
            description: "与AI助手交流，快速实现功能需求",
          },
          {
            title: "发布使用",
            icon: "solar:rocket-linear",
            description: "完成开发后即可发布应用，开始使用",
          },
        ].map((step, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                },
              },
            }}
          >
            <Card className='hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20'>
              <CardBody className='flex flex-col gap-4 p-6'>
                <div className='p-3 rounded-lg bg-primary/10 w-fit'>
                  <Icon icon={step.icon} className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <p className='text-lg font-semibold'>
                    {index + 1}. {step.title}
                  </p>
                  <p className='text-sm text-default-500'>{step.description}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
      initial='hidden'
      animate='visible'
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
              },
            },
          }}
        >
          <Card className='hover:shadow-lg transition-all duration-300'>
            <CardBody className='flex flex-row items-center gap-4 p-6'>
              <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                <Icon icon={stat.icon} className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className='flex-1'>
                <p className='text-sm text-default-500'>{stat.label}</p>
                <div className='flex items-center gap-2'>
                  <p className='text-2xl font-semibold'>{stat.value}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: reports, load: loadReports } = useMetadata("report")
  const { items: resources, load: loadResources } = useMetadata("resource")
  const { items: apps, load: loadApps } = useMetadata("app")
  const { tasks, loadTasks } = usePendingTasksStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/we-chat-app/admin" }])
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadForms(), loadReports(), loadResources(), loadApps(), loadTasks()])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [loadForms, loadReports, loadResources, loadApps, loadTasks])

  const stats = [
    {
      label: "总表单数",
      value: forms.length.toString(),
      icon: "solar:document-text-linear",
      color: "primary",
    },
    {
      label: "报表数量",
      value: reports.length.toString(),
      icon: "solar:chart-2-linear",
      color: "success",
    },
    {
      label: "资料表格数量",
      value: resources.length.toString(),
      icon: "solar:folder-with-files-linear",
      color: "warning",
    },
    {
      label: "应用数量",
      value: apps.length.toString(),
      icon: "solar:widget-linear",
      color: "secondary",
    },
  ]

  const quickActions = [
    {
      label: "创建表单",
      icon: "solar:document-outline",
      path: "/we-chat-app/admin/forms",
    },
    { label: "查看报表", icon: "mdi:chart-box-outline", path: "/we-chat-app/admin/reports" },
    { label: "资料表格管理", icon: "mdi:file-document", path: "/we-chat-app/admin/resources" },
    { label: "企业设置", icon: "solar:settings-outline", path: "/we-chat-app/admin/settings" },
  ]

  const handleAIAssistantClick = () => {
    navigate("/we-chat-app/admin/ai-assistant")
  }

  return (
    <div className='p-4 space-y-6'>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <WelcomeCard appsCount={apps.length} />
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
                        onPress={() => navigate("/we-chat-app/admin/pending-tasks")}
                      >
                        查看更多
                      </Button>
                    </CardHeader>
                    <CardBody className='max-h-60'>
                      <ScrollShadow>
                        <AnimatePresence>
                          {tasks.slice(0, 3).map((task, index) => (
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
                          {tasks.length === 0 && (
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
    </div>
  )
}

export default Dashboard
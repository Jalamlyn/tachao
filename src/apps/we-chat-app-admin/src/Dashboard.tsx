import React, { useEffect } from "react"
import { Card, CardBody, CardHeader, Button, Chip, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { motion, AnimatePresence } from "framer-motion"
import { useMetadata } from "@/hooks/metadata"
import { usePendingTasksStore } from "@/pages/pending-tasks/store/usePendingTasksStore"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: reports, load: loadReports } = useMetadata("report")
  const { items: resources, load: loadResources } = useMetadata("resource")
  const { items: apps, load: loadApps } = useMetadata("app_index")
  const { tasks, loadTasks } = usePendingTasksStore()

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/we-chat-app/admin" }])
  }, [])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadForms(), loadReports(), loadResources(), loadApps(), loadTasks()])
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
      label: "资料数量",
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
    { label: "资料管理", icon: "mdi:file-document", path: "/we-chat-app/admin/resources" },
    { label: "企业设置", icon: "solar:settings-outline", path: "/we-chat-app/admin/settings" },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sync":
        return "solar:refresh-circle-linear"
      case "auth":
        return "solar:shield-user-linear"
      case "report":
        return "solar:document-lock-linear"
      default:
        return "solar:info-circle-linear"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger"
      case "medium":
        return "warning"
      case "low":
        return "primary"
      default:
        return "default"
    }
  }

  const handleAIAssistantClick = () => {
    navigate("/we-chat-app/admin/ai-assistant")
  }

  return (
    <div className='p-4 space-y-6'>
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
                      className={`w-full justify-start bg-gray-50 hover:bg-slate-100`}
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
                  {tasks.slice(0, 3).map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex items-start gap-4 p-4 hover:bg-default-100 transition-all border-b last:border-b-0'
                    >
                      <div className='relative'>
                        <img src={activity.avatar} alt={activity.user} className='w-10 h-10 rounded-full' />
                        <div
                          className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-${getPriorityColor(activity.priority)}/10`}
                        >
                          <Icon
                            icon={getActivityIcon(activity.type)}
                            className={`w-4 h-4 text-${getPriorityColor(activity.priority)}`}
                          />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium'>{activity.title}</p>
                            <Chip size='sm' variant='flat' color={getPriorityColor(activity.priority)}>
                              {activity.priority === "high"
                                ? "紧急"
                                : activity.priority === "medium"
                                  ? "普通"
                                  : "低优先级"}
                            </Chip>
                          </div>
                          <span className='text-small text-default-400'>{activity.time}</span>
                        </div>
                        <p className='text-small text-default-500 mt-1'>{activity.description}</p>
                        <div className='flex items-center gap-2 mt-2'>
                          <Chip size='sm' variant='flat' color='default'>
                            {activity.department}
                          </Chip>
                          <span className='text-small text-default-400'>•</span>
                          <span className='text-small text-default-500'>{activity.user}</span>
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

      {/* AI Assistant Floating Button */}
      <Button
        isIconOnly
        color='primary'
        size='lg'
        className='fixed bottom-8 right-8 shadow-lg z-50 rounded-full w-14 h-14'
        onPress={handleAIAssistantClick}
      >
        <Icon icon='hugeicons:ai-chat-02' className='w-10 h-10' />
      </Button>
    </div>
  )
}

export default Dashboard

import React, { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Button, Chip, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { motion, AnimatePresence } from "framer-motion"
import { useMetadata } from "@/hooks/metadata"
import { usePendingTasksStore } from "@/pages/pending-tasks/store/usePendingTasksStore"
import TutorialModal from "./TutorialModal"
import StatsSection from "./StatsSection"
import WelcomeCard from "./WelcomeCard"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: reports, load: loadReports } = useMetadata("report")
  const { items: resources, load: loadResources } = useMetadata("resource")
  const { items: apps, load: loadApps } = useMetadata("app")
  const { tasks, loadTasks } = usePendingTasksStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/admin" }])
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
      path: "/admin/forms",
    },
    { label: "查看报表", icon: "mdi:chart-box-outline", path: "/admin/reports" },
    { label: "资料表格管理", icon: "mdi:file-document", path: "/admin/resources" },
    { label: "企业设置", icon: "solar:settings-outline", path: "/admin/settings" },
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

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  )
}

export default Dashboard

import React, { useEffect } from "react"
import { Card, CardBody, Chip, Button, Spinner, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { usePendingTasksStore } from "@/pages/pending-tasks/store/usePendingTasksStore"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const PendingTasks: React.FC = () => {
  const { tasks, isLoading, loadTasks, updateTaskStatus, activeTab, setActiveTab } = usePendingTasksStore()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "待我处理", href: "/we-chat-app/admin/pending-tasks" },
    ])
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (isLoading) {
    return (
      <PageLayout title='待我处理' titleIcon='solar:list-check-bold'>
        <div className='flex items-center justify-center h-[400px]'>
          <Spinner label='加载中...' />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title='待我处理' titleIcon='solar:list-check-bold'>
      <div className='space-y-4 p-4'>
        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
          <Tab
            key='permission_requests'
            title={
              <div className='flex items-center gap-2'>
                <Icon icon='solar:shield-user-bold-duotone' />
                <span>权限申请</span>
                <Chip size='sm' variant='flat' color='primary'>
                  {tasks.length}
                </Chip>
              </div>
            }
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='hover:shadow-md transition-shadow duration-200 mb-4'>
                    <CardBody className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='relative'>
                          <img src={task.avatar} alt={task.user} className='w-12 h-12 rounded-full' />
                          <div className='absolute -bottom-1 -right-1 p-1 rounded-full bg-primary/10'>
                            <Icon icon='solar:shield-user-bold-duotone' className='w-5 h-5 text-primary' />
                          </div>
                        </div>
                        <div className='flex-1'>
                          {/* 头部信息区域 */}
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg font-semibold text-default-700'>{task.user}</span>
                              <Chip size='sm' variant='flat' color='secondary'>
                                申请人
                              </Chip>
                            </div>
                            <Chip
                              size='sm'
                              variant='flat'
                              color='primary'
                              startContent={<Icon icon='solar:clock-circle' className='w-4 h-4' />}
                            >
                              {task.time}
                            </Chip>
                          </div>

                          {/* 申请标题区域 */}
                          <div className='flex items-center gap-2 mb-3 pb-2 border-b border-default-100'>
                            <h3 className='text-lg font-semibold'>{task.title}</h3>
                            <Chip size='sm' variant='flat' color='primary'>
                              权限申请
                            </Chip>
                          </div>

                          {/* 申请原因区域 */}
                          <div className='mb-4'>
                            <div className='p-3 bg-default-50 rounded-lg'>
                              <div className='text-small font-semibold text-default-600 mb-1 flex items-center gap-2'>
                                <Icon icon='solar:document-text-linear' className='w-4 h-4' />
                                申请原因：
                              </div>
                              <p className='text-default-500'>{task.description}</p>
                            </div>
                          </div>

                          {/* 操作按钮区域 */}
                          <div className='flex justify-end gap-2 mt-4'>
                            <Button
                              size='sm'
                              color='danger'
                              variant='flat'
                              startContent={<Icon icon='solar:close-circle-linear' className='w-4 h-4' />}
                              onPress={() => updateTaskStatus(task.id, "rejected")}
                            >
                              拒绝
                            </Button>
                            <Button
                              size='sm'
                              color='primary'
                              startContent={<Icon icon='solar:check-circle-linear' className='w-4 h-4' />}
                              onPress={() => updateTaskStatus(task.id, "completed")}
                            >
                              同意
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {tasks.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 text-default-400'>
                <Icon icon='solar:shield-check-bold-duotone' className='w-16 h-16 mb-4' />
                <p>暂无待处理的权限申请</p>
              </div>
            )}
          </Tab>
        </Tabs>
      </div>
    </PageLayout>
  )
}

export default PendingTasks
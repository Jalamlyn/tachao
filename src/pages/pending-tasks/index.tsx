import React, { useEffect } from "react"
import { Card, CardBody, CardHeader, Chip, Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { usePendingTasksStore } from "@/pages/pending-tasks/store/usePendingTasksStore"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const PendingTasks: React.FC = () => {
  const { tasks, isLoading, loadTasks, updateTaskStatus } = usePendingTasksStore()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "待办事项", href: "/we-chat-app/admin/pending-tasks" },
    ])
  }, [])
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

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

  const handleApprove = async (taskId: string) => {
    await updateTaskStatus(taskId, "completed")
  }

  if (isLoading) {
    return (
      <PageLayout title='待办事项' titleIcon='solar:list-check-bold'>
        <div className='flex items-center justify-center h-[400px]'>
          <Spinner label='加载中...' />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title='待办事项' titleIcon='solar:list-check-bold'>
      <div className='space-y-4 p-4'>
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className='hover:shadow-md transition-shadow duration-200'>
                <CardBody className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='relative'>
                      <img src={task.avatar} alt={task.user} className='w-12 h-12 rounded-full' />
                      <div
                        className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-${getPriorityColor(
                          task.priority
                        )}/10`}
                      >
                        <Icon
                          icon={getActivityIcon(task.type)}
                          className={`w-5 h-5 text-${getPriorityColor(task.priority)}`}
                        />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <h3 className='text-lg font-semibold'>{task.title}</h3>
                          <Chip size='sm' variant='flat' color={getPriorityColor(task.priority)}>
                            {task.priority === "high" ? "紧急" : task.priority === "medium" ? "普通" : "低优先级"}
                          </Chip>
                        </div>
                        <span className='text-small text-default-400'>{task.time}</span>
                      </div>
                      <p className='text-default-500 mt-1'>{task.description}</p>
                      <div className='flex items-center justify-between mt-4'>
                        <div className='flex items-center gap-2'>
                          <Chip size='sm' variant='flat' color='default'>
                            {task.department}
                          </Chip>
                          <span className='text-small text-default-400'>•</span>
                          <span className='text-small text-default-500'>{task.user}</span>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            color='danger'
                            variant='flat'
                            startContent={<Icon icon='solar:close-circle-linear' className='w-4 h-4' />}
                          >
                            拒绝
                          </Button>
                          <Button
                            size='sm'
                            color='primary'
                            startContent={<Icon icon='solar:check-circle-linear' className='w-4 h-4' />}
                            onPress={() => handleApprove(task.id)}
                          >
                            同意
                          </Button>
                        </div>
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
            <Icon icon='solar:checklist-minimalistic-linear' className='w-16 h-16 mb-4' />
            <p>暂无待办事项</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default PendingTasks

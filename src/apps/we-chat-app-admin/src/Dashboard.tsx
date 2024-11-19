import React, { useEffect, useState, useCallback } from "react"
import { Card, CardBody, CardHeader, Button, Chip, Divider, Input, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { motion, AnimatePresence } from "framer-motion"
import { useMetadata } from "@/hooks/metadata"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [aiInput, setAiInput] = useState("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { items: forms } = useMetadata("form")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/we-chat-app/admin" }])
  }, [])

  const stats = [
    {
      label: "总表单数",
      value: forms.length.toString(),
      icon: "solar:document-text-linear",
      color: "primary",
    },
    {
      label: "已归档",
      value: "开发中",
      icon: "solar:archive-linear",
      color: "default",
    },
  ]

  const quickActions = [
    {
      label: "创建表单",
      icon: "solar:document-outline",
      path: "/we-chat-app/admin/forms",
    },
    { label: "查看报表", icon: "mdi:chart-box-outline", path: "/we-chat-app/admin/reports" },
    { label: "数据管理", icon: "mdi:file-document", path: "/we-chat-app/admin/resources" },
    { label: "企业设置", icon: "solar:settings-outline", path: "/we-chat-app/admin/settings" },
  ]

  const recentActivities = [
    {
      title: "功能开发中",
      time: "敬请期待",
      type: "development",
      user: "系统",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024e",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "development":
        return "solar:code-square-linear"
      case "update":
        return "solar:pen-new-square-linear"
      case "create":
        return "solar:add-circle-linear"
      case "report":
        return "solar:chart-2-linear"
      default:
        return "solar:info-circle-linear"
    }
  }

  const handleAIAssistantSubmit = useCallback(() => {
    if (!aiInput.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    // 使用 navigate 跳转并传递状态
    navigate("/we-chat-app/admin/ai-assistant", {
      state: { initialQuestion: aiInput }
    })
  }, [aiInput, navigate, isSubmitting])

  const AIAssistantDialog = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className='fixed bottom-8 right-8 z-50'
    >
      <Card className='w-96 shadow-lg'>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Icon icon='solar:robot-linear' className='text-2xl text-primary' />
            <span className='font-semibold'>AI 智能助手</span>
          </div>
          <Button isIconOnly size='sm' variant='light' onPress={onClose}>
            <Icon icon='solar:close-circle-linear' />
          </Button>
        </CardHeader>
        <CardBody>
          <div className='flex flex-col gap-4'>
            <p className='text-sm text-default-600'>有什么我可以帮您的吗？</p>
            <div className='flex gap-2'>
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder='输入您的问题...'
                onKeyPress={(e) => e.key === "Enter" && handleAIAssistantSubmit()}
              />
              <Button 
                color='primary' 
                onPress={handleAIAssistantSubmit}
                isDisabled={!aiInput.trim() || isSubmitting}
              >
                <Icon icon='solar:arrow-right-linear' />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )

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
        className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4'
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
            <CardHeader className='flex gap-3 px-6 pt-6'>
              <div className='flex flex-col'>
                <p className='text-lg font-semibold'>最近活动</p>
                <p className='text-small text-default-500'>系统最新动态</p>
              </div>
            </CardHeader>
            <CardBody>
              <AnimatePresence>
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='flex items-center gap-4 p-4 rounded-lg hover:bg-default-100 transition-all'
                  >
                    <div className='relative'>
                      <img src={activity.avatar} alt={activity.user} className='w-10 h-10 rounded-full' />
                      <div
                        className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-${activity.type === "development" ? "warning" : activity.type === "update" ? "primary" : activity.type === "create" ? "success" : "warning"}/10`}
                      >
                        <Icon
                          icon={getActivityIcon(activity.type)}
                          className={`w-4 h-4 text-${activity.type === "development" ? "warning" : activity.type === "update" ? "primary" : activity.type === "create" ? "success" : "warning"}`}
                        />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{activity.title}</p>
                        <Chip
                          size='sm'
                          variant='flat'
                          color={
                            activity.type === "development"
                              ? "warning"
                              : activity.type === "update"
                                ? "primary"
                                : activity.type === "create"
                                  ? "success"
                                  : "warning"
                          }
                        >
                          {activity.type}
                        </Chip>
                      </div>
                      <div className='flex items-center gap-2 text-small text-default-500'>
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className='fixed bottom-8 right-8 z-50'
          >
            <Button
              size='lg'
              color='primary'
              className='shadow-lg'
              startContent={<Icon icon='solar:robot-linear' className='text-xl' />}
              onPress={onOpen}
            >
              AI 智能助手
            </Button>
          </motion.div>
        )}
        {isOpen && <AIAssistantDialog />}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
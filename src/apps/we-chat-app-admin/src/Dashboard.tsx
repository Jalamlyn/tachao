import React, { useEffect } from "react"
import { Card, CardBody, CardHeader, Button, Chip, Divider } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { motion } from "framer-motion"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/we-chat-app/admin" }])
  }, [])

  const stats = [
    { label: "总表单数", value: "128", icon: "mdi:file-document-outline", color: "primary", trend: "+12%" },
    { label: "待处理", value: "8", icon: "mdi:clock-outline", color: "warning", trend: "-25%" },
    { label: "本月新增", value: "32", icon: "mdi:chart-line", color: "success", trend: "+8%" },
    { label: "已归档", value: "64", icon: "mdi:archive-outline", color: "default", trend: "+15%" },
  ]

  const quickActions = [
    { label: "创建表单", icon: "mdi:file-plus", path: "/we-chat-app/admin/documents/create", color: "primary" },
    { label: "查看报表", icon: "mdi:chart-box", path: "/we-chat-app/admin/reports", color: "success" },
    { label: "数据管理", icon: "mdi:database", path: "/we-chat-app/admin/resources", color: "warning" },
    { label: "系统设置", icon: "mdi:cog", path: "/we-chat-app/admin/settings", color: "secondary" },
  ]

  const recentActivities = [
    {
      title: "销售订单表单已更新",
      time: "10分钟前",
      type: "update",
      user: "张三",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
      title: "新建采购申请表单",
      time: "30分钟前",
      type: "create",
      user: "李四",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      title: "月度报表已生成",
      time: "2小时前",
      type: "report",
      user: "系统",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024e",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "update":
        return "mdi:pencil"
      case "create":
        return "mdi:plus-circle"
      case "report":
        return "mdi:chart-box"
      default:
        return "mdi:information"
    }
  }

  const MotionCard = motion(Card)

  return (
    <div className='p-4 space-y-6'>
      {/* 欢迎区域 - 使用渐变背景和动画效果 */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden'
      >
        <CardBody className='py-8 relative'>
          <div className='flex items-start justify-between relative z-10'>
            <div>
              <h1 className='text-3xl font-bold mb-3'>欢迎回来 👋</h1>
              <p className='text-white/80 text-lg'>这里是您的工作台概览</p>
            </div>
            <Button
              className='bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all'
              variant='flat'
              startContent={<Icon icon='mdi:rocket' className='text-xl' />}
              onPress={() => navigate("/we-chat-app/admin/documents/create")}
            >
              快速创建
            </Button>
          </div>
          {/* 装饰性背景图形 */}
          <div className='absolute right-0 bottom-0 opacity-10'>
            <Icon icon='mdi:cube-outline' className='w-32 h-32' />
          </div>
        </CardBody>
      </MotionCard>

      {/* 统计卡片 - 添加动画和悬停效果 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, index) => (
          <MotionCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className='hover:shadow-lg transition-all duration-300'
          >
            <CardBody className='flex flex-row items-center gap-4 p-6'>
              <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                <Icon icon={stat.icon} className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className='flex-1'>
                <p className='text-sm text-default-500'>{stat.label}</p>
                <div className='flex items-center gap-2'>
                  <p className='text-2xl font-semibold'>{stat.value}</p>
                  <span className={`text-xs ${stat.trend.startsWith("+") ? "text-success" : "text-danger"}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </CardBody>
          </MotionCard>
        ))}
      </div>

      {/* 主要内容区 - 改进布局和视觉层次 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 快速操作 */}
        <MotionCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className='lg:col-span-1 hover:shadow-lg transition-all duration-300'
        >
          <CardHeader className='flex gap-3 px-6 pt-6'>
            <Icon icon='mdi:lightning-bolt' className='w-6 h-6 text-warning' />
            <div className='flex flex-col'>
              <p className='text-lg font-semibold'>快速操作</p>
              <p className='text-small text-default-500'>常用功能快捷入口</p>
            </div>
          </CardHeader>
          <CardBody className='gap-4 px-6 py-4'>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                className={`w-full justify-start hover:scale-102 transition-transform bg-${action.color}/10`}
                startContent={<Icon icon={action.icon} className={`w-5 h-5 text-${action.color}`} />}
                variant='flat'
                onPress={() => navigate(action.path)}
              >
                {action.label}
              </Button>
            ))}
          </CardBody>
        </MotionCard>

        {/* 最近活动 */}
        <MotionCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className='lg:col-span-2 hover:shadow-lg transition-all duration-300'
        >
          <CardHeader className='flex gap-3 px-6 pt-6'>
            <Icon icon='mdi:clock-outline' className='w-6 h-6 text-primary' />
            <div className='flex flex-col'>
              <p className='text-lg font-semibold'>最近活动</p>
              <p className='text-small text-default-500'>系统最新动态</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
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
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-${activity.type === "update" ? "primary" : activity.type === "create" ? "success" : "warning"}/10`}
                    >
                      <Icon
                        icon={getActivityIcon(activity.type)}
                        className={`w-4 h-4 text-${activity.type === "update" ? "primary" : activity.type === "create" ? "success" : "warning"}`}
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
                          activity.type === "update" ? "primary" : activity.type === "create" ? "success" : "warning"
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
            </div>
          </CardBody>
        </MotionCard>
      </div>
    </div>
  )
}

export default Dashboard

import React, { useEffect } from "react"
import { Card, CardBody, CardHeader, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([{ label: "首页", href: "/we-chat-app/admin" }])
  }, [updateBreadcrumbs])

  const stats = [
    { label: "总表单数", value: "128", icon: "mdi:file-document-outline", color: "primary" },
    { label: "待处理", value: "8", icon: "mdi:clock-outline", color: "warning" },
    { label: "本月新增", value: "32", icon: "mdi:chart-line", color: "success" },
    { label: "已归档", value: "64", icon: "mdi:archive-outline", color: "default" },
  ]

  const quickActions = [
    { label: "创建表单", icon: "mdi:file-plus", path: "/we-chat-app/admin/documents/create" },
    { label: "查看报表", icon: "mdi:chart-box", path: "/we-chat-app/admin/reports" },
    { label: "数据管理", icon: "mdi:database", path: "/we-chat-app/admin/resources" },
    { label: "系统设置", icon: "mdi:cog", path: "/we-chat-app/admin/settings" },
  ]

  const recentActivities = [
    {
      title: "销售订单表单已更新",
      time: "10分钟前",
      type: "update",
      user: "张三",
    },
    {
      title: "新建采购申请表单",
      time: "30分钟前",
      type: "create",
      user: "李四",
    },
    {
      title: "月度报表已生成",
      time: "2小时前",
      type: "report",
      user: "系统",
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

  return (
    <div className='p-4 space-y-6'>
      {/* 欢迎区域 */}
      <Card className='bg-primary-900 text-white'>
        <CardBody className='py-8'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold mb-2'>欢迎回来 👋</h1>
              <p className='text-white/80'>这里是您的工作台概览</p>
            </div>
            <Button
              color='default'
              variant='flat'
              startContent={<Icon icon='mdi:rocket' />}
              onPress={() => navigate("/we-chat-app/admin/documents/create")}
            >
              快速创建
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, index) => (
          <Card key={index} className='bg-content1'>
            <CardBody className='flex flex-row items-center gap-4 p-4'>
              <div className='p-3 rounded-lg bg-content2'>
                <Icon icon={stat.icon} className='w-6 h-6' />
              </div>
              <div>
                <p className='text-sm text-default-500'>{stat.label}</p>
                <p className='text-2xl font-semibold'>{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 主要内容区 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 快速操作 */}
        <Card className='lg:col-span-1'>
          <CardHeader className='flex gap-3'>
            <Icon icon='mdi:lightning-bolt' className='w-6 h-6' />
            <div className='flex flex-col'>
              <p className='text-md font-semibold'>快速操作</p>
              <p className='text-small text-default-500'>常用功能快捷入口</p>
            </div>
          </CardHeader>
          <CardBody className='gap-4'>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                className='w-full justify-start'
                startContent={<Icon icon={action.icon} className='w-5 h-5' />}
                variant='flat'
                onPress={() => navigate(action.path)}
              >
                {action.label}
              </Button>
            ))}
          </CardBody>
        </Card>

        {/* 最近活动 */}
        <Card className='lg:col-span-2'>
          <CardHeader className='flex gap-3'>
            <Icon icon='mdi:clock-outline' className='w-6 h-6' />
            <div className='flex flex-col'>
              <p className='text-md font-semibold'>最近活动</p>
              <p className='text-small text-default-500'>系统最新动态</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              {recentActivities.map((activity, index) => (
                <div key={index} className='flex items-center gap-4 p-2 rounded-lg hover:bg-default-100'>
                  <div className='p-2 rounded-lg bg-content2'>
                    <Icon icon={getActivityIcon(activity.type)} className='w-5 h-5' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium'>{activity.title}</p>
                    <div className='flex items-center gap-2 text-small text-default-500'>
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </div>
                  </div>
                  <Chip size='sm' variant='flat' color='primary'>
                    {activity.type}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
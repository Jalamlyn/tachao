import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, Tabs, Tab } from "@nextui-org/react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Icon } from "@iconify/react"
import AnimatedBackground from "@/components/landing/AnimatedBackground"

const AIHomePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname.split("/").pop()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  const tabs = [
    {
      key: "management",
      title: "数据管理",
      icon: "mdi:database-cog",
    },
    {
      key: "analysis",
      title: "数据分析",
      icon: "mdi:chart-box",
    },
    {
      key: "create",
      title: "智能创建",
      icon: "mdi:file-document-plus",
    },
  ]

  const handleTabChange = (key: string) => {
    navigate(`/ai/${key}`)
  }

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light'>
      <AnimatedBackground />
      <div className='container mx-auto px-4 py-8 relative z-10'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerVariants}
          className='max-w-4xl mx-auto space-y-6'
        >
          <Card className='bg-white/10 border border-white/20 shadow-xl backdrop-blur-md'>
            <CardHeader className='flex justify-between items-center p-6'>
              <h1 className='text-2xl font-bold text-white/90'>沙塔 AI</h1>
              <Tabs 
                selectedKey={currentPath} 
                onSelectionChange={handleTabChange}
                color="primary"
                variant="light"
                classNames={{
                  tabList: "gap-4 w-full md:w-auto",
                  cursor: "bg-white/30",
                  tab: "h-10 px-4",
                  tabContent: "group-data-[selected=true]:text-white"
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon={tab.icon} className="w-4 h-4" />
                        <span>{tab.title}</span>
                      </div>
                    }
                  />
                ))}
              </Tabs>
            </CardHeader>
            <Outlet />
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-center'
          >
            <p className='text-sm text-white/70 backdrop-blur-sm bg-white/5 py-2 px-4 rounded-full inline-block'>
              提示：您可以询问关于表单数据的任何问题，比如查询特定状态的单据、统计数据等
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIHomePage
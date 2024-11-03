import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader } from "@nextui-org/react"
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
      title: "智能开单",
      icon: "mdi:file-document-plus",
    },
  ]

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
              <h1 className='text-2xl font-bold text-white/90'>AI 智能助手</h1>
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => navigate(`/ai/${tab.key}`)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPath === tab.key
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon icon={tab.icon} className="w-4 h-4" />
                    <span>{tab.title}</span>
                  </button>
                ))}
              </div>
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
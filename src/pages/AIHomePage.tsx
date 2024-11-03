import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader } from "@nextui-org/react"
import { Outlet } from "react-router-dom"
import AnimatedBackground from "@/components/landing/AnimatedBackground"

const AIHomePage: React.FC = () => {
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
              <h2 className="text-xl font-semibold text-white">AI 智能助手</h2>
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
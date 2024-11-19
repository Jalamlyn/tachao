import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ScrollAnimation from "./ScrollAnimation"

const benefits = [
  {
    icon: "mdi:shield-check",
    title: "智能防错",
    description: "AI 智能识别异常数据，降低人工错误率",
    color: "from-blue-500/90 to-blue-600/90",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: "mdi:clock-fast",
    title: "效率提升",
    description: "自动生成表单和报表，节省 75% 工作时间",
    color: "from-green-500/90 to-green-600/90",
    shadowColor: "shadow-green-500/20",
  },
  {
    icon: "mdi:chart-box",
    title: "数据洞察",
    description: "智能分析经营数据，提供决策建议",
    color: "from-purple-500/90 to-purple-600/90",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: "mdi:cloud-sync",
    title: "实时同步",
    description: "数据实时更新，随时随地查看经营状况",
    color: "from-pink-500/90 to-pink-600/90",
    shadowColor: "shadow-pink-500/20",
  },
]

const Benefits: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className='py-20 bg-gradient-to-b from-primary-dark/50 to-primary-dark relative overflow-hidden'>
      {/* 背景装饰 */}
      <div className='absolute inset-0 bg-[url("/assets/grid.svg")] opacity-10' />
      <div className='absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent' />

      <div className='container mx-auto px-4 relative z-10'>
        <ScrollAnimation className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>为什么选择沙塔智能</h2>
          <p className='text-white/80 text-lg max-w-2xl mx-auto'>智能化解决方案，让企业管理更简单</p>
        </ScrollAnimation>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className='bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/20'>
                <CardBody className='text-center p-6'>
                  <motion.div 
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${benefit.color} ${benefit.shadowColor} shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110`}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon 
                      icon={benefit.icon} 
                      className='text-4xl text-white transform transition-transform duration-300 hover:scale-110' 
                    />
                  </motion.div>
                  <h3 className='text-xl font-bold text-white mb-3'>{benefit.title}</h3>
                  <p className='text-white/80 leading-relaxed'>{benefit.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Benefits
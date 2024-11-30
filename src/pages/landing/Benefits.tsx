import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ScrollAnimation from "./ScrollAnimation"

const benefits = [
  {
    icon: "mdi:shield-check",
    title: "智能防错",
    description: "AI智能识别异常数据，自动校验，准确率达98%",
    color: "from-blue-500/90 to-blue-600/90",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: "mdi:clock-fast",
    title: "效率提升",
    description: "自动化工作流程，提升工作效率75%以上",
    color: "from-green-500/90 to-green-600/90",
    shadowColor: "shadow-green-500/20",
  },
  {
    icon: "mdi:chart-box",
    title: "数据洞察",
    description: "AI深度分析数据，提供精准决策建议",
    color: "from-purple-500/90 to-purple-600/90",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: "mdi:cloud-sync",
    title: "实时协同",
    description: "多端数据实时同步，随时随地管理企业",
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
          <p className='text-white/80 text-lg max-w-2xl mx-auto'>让企业管理更简单，让决策更智能</p>
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

        {/* 应用场景展示 */}
        <ScrollAnimation className='mt-20'>
          <div className='text-center mb-12'>
            <h3 className='text-2xl md:text-3xl font-bold text-white mb-4'>适用多种企业场景</h3>
            <p className='text-white/80 text-lg'>无论企业规模大小，都能找到适合的解决方案</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='bg-white/10 backdrop-blur-sm'>
              <CardBody className='p-6'>
                <h4 className='text-xl font-bold text-white mb-4'>中小企业</h4>
                <ul className='space-y-2'>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    快速部署，成本可控
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    智能化管理工具
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    提升运营效率
                  </li>
                </ul>
              </CardBody>
            </Card>
            <Card className='bg-white/10 backdrop-blur-sm'>
              <CardBody className='p-6'>
                <h4 className='text-xl font-bold text-white mb-4'>企业集团</h4>
                <ul className='space-y-2'>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    多层级管理支持
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    数据统一分析
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    跨部门协同
                  </li>
                </ul>
              </CardBody>
            </Card>
            <Card className='bg-white/10 backdrop-blur-sm'>
              <CardBody className='p-6'>
                <h4 className='text-xl font-bold text-white mb-4'>创业公司</h4>
                <ul className='space-y-2'>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    灵活扩展能力
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    快速迭代适应
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    降低管理成本
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}

export default Benefits
import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ScrollAnimation from "./ScrollAnimation"

const benefits = [
  {
    icon: "mdi:lightbulb",
    title: "创新科技",
    description: "采用最新AI技术，引领企业管理创新",
    color: "from-blue-500/90 to-blue-600/90",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: "mdi:trending-up",
    title: "成长助手",
    description: "助力企业快速成长，降低管理成本",
    color: "from-green-500/90 to-green-600/90",
    shadowColor: "shadow-green-500/20",
  },
  {
    icon: "mdi:shield-lock",
    title: "安全可靠",
    description: "企业级安全保障，数据安全无忧",
    color: "from-purple-500/90 to-purple-600/90",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: "mdi:rocket-launch",
    title: "快速见效",
    description: "10分钟完成部署，即刻提升效率",
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
    <section className='py-20 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-primary-dark/50 to-primary-dark' />
      <div className='absolute inset-0 bg-[url("/assets/grid.svg")] opacity-10' />
      <div className='absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent' />

      <div className='container mx-auto px-4 relative z-10'>
        <ScrollAnimation className='text-center mb-12 md:mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>为什么选择沙塔智能</h2>
          <p className='text-white/80 text-lg max-w-2xl mx-auto'>创新科技赋能，助力企业腾飞</p>
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
                    className={`w-20 h-20 mx-auto mb-6rounded-2xl bg-gradient-to-br ${benefit.color} ${benefit.shadowColor} shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110`}
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

        <ScrollAnimation className='mt-20'>
          <div className='text-center mb-12'>
            <h3 className='text-2xl md:text-3xl font-bold text-white mb-4'>灵活应对多种场景</h3>
            <p className='text-white/80 text-lg'>为不同规模企业提供定制化解决方案</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='bg-white/10 backdrop-blur-sm'>
              <CardBody className='p-6'>
                <h4 className='text-xl font-bold text-white mb-4'>初创企业</h4>
                <ul className='space-y-2'>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    快速部署上线
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    成本灵活可控
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    按需弹性扩展
                  </li>
                </ul>
              </CardBody>
            </Card>
            <Card className='bg-white/10 backdrop-blur-sm'>
              <CardBody className='p-6'>
                <h4 className='text-xl font-bold text-white mb-4'>成长型企业</h4>
                <ul className='space-y-2'>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    效率全面提升
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    数据驱动决策
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    团队协作增强
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
                    多层级管理
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    跨部门协同
                  </li>
                  <li className='text-white/80 flex items-center'>
                    <Icon icon='mdi:check' className='mr-2 text-green-400' />
                    安全性保障
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
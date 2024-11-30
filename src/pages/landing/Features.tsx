import React from "react"
import { motion, useSpring } from "framer-motion"
import { Card, CardBody, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ScrollAnimation from "./ScrollAnimation"
import { useSwipeable } from "react-swipeable"

const features = [
  {
    icon: "hugeicons:ai-chat-02",
    title: "智能表单系统",
    description: "AI驱动的智能表单系统，自动生成、验证和管理",
    details: [
      "AI辅助表单生成",
      "智能数据验证",
      "动态表单渲染",
      "多端自适应展示"
    ],
    color: "from-cyan-500/90 to-blue-600/90",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: "mdi:chart-line",
    title: "数据分析报表",
    description: "深度数据分析，智能生成可视化报表",
    details: [
      "多维度数据分析",
      "AI辅助洞察",
      "实时数据监控",
      "智能决策支持"
    ],
    color: "from-violet-500/90 to-purple-600/90",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: "mdi:lightning-bolt",
    title: "高效任务管理",
    description: "智能化的任务分配、追踪和管理系统",
    details: [
      "智能任务分配",
      "实时进度追踪",
      "自动化工作流",
      "团队协作管理"
    ],
    color: "from-amber-500/90 to-orange-600/90",
    shadowColor: "shadow-orange-500/20",
  },
  {
    icon: "mdi:apps",
    title: "应用资源管理",
    description: "一站式应用和资源管理平台",
    details: [
      "统一应用管理",
      "智能资源分配",
      "多维度权限控制",
      "资源智能分析"
    ],
    color: "from-green-500/90 to-emerald-600/90",
    shadowColor: "shadow-emerald-500/20",
  }
]

const Features: React.FC = () => {
  // 优化动画性能
  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)

  // 添加手势支持
  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      // 向左滑动到下一个部分
      const nextSection = document.getElementById("benefits")
      nextSection?.scrollIntoView({ behavior: "smooth" })
    },
    onSwipedRight: (eventData) => {
      // 向右滑动到上一个部分
      const prevSection = document.getElementById("hero")
      prevSection?.scrollIntoView({ behavior: "smooth" })
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  return (
    <div 
      className='py-12 md:py-20 bg-white/10 backdrop-blur-lg'
      {...handlers}
    >
      <div className='container mx-auto px-4'>
        <ScrollAnimation className='text-center mb-8 md:mb-16'>
          <h2 className='text-2xl md:text-4xl font-bold text-white mb-4'>企业管理的智能化解决方案</h2>
          <p className='text-white/80 text-base md:text-lg max-w-2xl mx-auto'>
            集成AI技术，提供全方位的企业管理工具，让管理更简单高效
          </p>
        </ScrollAnimation>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8'>
          {features.map((feature, index) => (
            <ScrollAnimation key={index}>
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className='bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all duration-300 border border-white/10 hover:border-white/20'>
                  <CardBody className='p-4 md:p-8'>
                    <motion.div 
                      className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.shadowColor} shadow-lg flex items-center justify-center`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -5, 5, -5, 0],
                        transition: { duration: 0.3 }
                      }}
                      style={{
                        scale: scaleSpring
                      }}
                    >
                      <Icon 
                        icon={feature.icon} 
                        className='text-2xl md:text-4xl text-white transform transition-all duration-300'
                      />
                    </motion.div>
                    <h3 className='text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 text-center'>{feature.title}</h3>
                    <p className='text-white/80 mb-4 md:mb-6 text-center leading-relaxed text-sm md:text-base'>{feature.description}</p>
                    <ul className='space-y-2 md:space-y-3'>
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className='flex items-center text-white/70 text-xs md:text-sm'>
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="mr-2 md:mr-3"
                          >
                            <Icon 
                              icon='mdi:check-circle' 
                              className='text-green-400 text-base md:text-lg'
                            />
                          </motion.div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </motion.div>
            </ScrollAnimation>
          ))}
        </div>

        <ScrollAnimation className='text-center mt-8 md:mt-12'>
          <Button
            size='lg'
            className='bg-white text-primary-dark hover:bg-white/90 font-medium px-6 md:px-8 shadow-lg hover:shadow-xl transition-all duration-300'
            endContent={
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon icon='mdi:arrow-right' />
              </motion.div>
            }
          >
            探索更多功能
          </Button>
        </ScrollAnimation>
      </div>
    </div>
  )
}

export default Features
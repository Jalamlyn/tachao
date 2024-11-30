import React, { useState } from "react"
import { motion, useSpring } from "framer-motion"
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
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

const solutions = [
  {
    title: "数据收集与分析",
    icon: "mdi:database",
    color: "from-blue-500/90 to-cyan-600/90",
    scenarios: [
      {
        name: "问卷调查",
        description: "智能生成调查问卷，自动分析结果",
        features: ["智能表单生成", "实时数据分析", "可视化报表"],
        icon: "mdi:form-select"
      },
      {
        name: "数据统计",
        description: "多维度数据统计与分析",
        features: ["多维分析", "趋势预测", "异常检测"],
        icon: "mdi:chart-box"
      },
      {
        name: "报表生成",
        description: "自动生成专业分析报表",
        features: ["自动报表", "数据可视化", "深度洞察"],
        icon: "mdi:file-chart"
      }
    ]
  },
  {
    title: "业务流程管理",
    icon: "mdi:sitemap",
    color: "from-purple-500/90 to-pink-600/90",
    scenarios: [
      {
        name: "表单审批",
        description: "智能化审批流程管理",
        features: ["智能路由", "自动提醒", "进度追踪"],
        icon: "mdi:clipboard-check"
      },
      {
        name: "数据录入",
        description: "高效的数据采集与验证",
        features: ["智能识别", "自动校验", "批量处理"],
        icon: "mdi:database-plus"
      },
      {
        name: "结果统计",
        description: "全面的结果分析与展示",
        features: ["实时统计", "多维分析", "趋势预测"],
        icon: "mdi:chart-timeline"
      }
    ]
  },
  {
    title: "信息管理系统",
    icon: "mdi:cog",
    color: "from-green-500/90 to-emerald-600/90",
    scenarios: [
      {
        name: "员工信息管理",
        description: "一站式员工信息管理平台",
        features: ["信息录入", "档案管理", "数据分析"],
        icon: "mdi:account-group"
      },
      {
        name: "客户数据管理",
        description: "智能化客户关系管理",
        features: ["客户画像", "行为分析", "互动追踪"],
        icon: "mdi:account-supervisor"
      },
      {
        name: "业务数据分析",
        description: "深度业务数据分析与决策",
        features: ["业务分析", "决策支持", "预测模型"],
        icon: "mdi:chart-scatter-plot"
      }
    ]
  }
]

const Features: React.FC = () => {
  const [showMoreFeatures, setShowMoreFeatures] = useState(false)
  const [selectedSolution, setSelectedSolution] = useState<number>(0)

  // 优化动画性能
  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)

  // 添加手势支持
  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const nextSection = document.getElementById("benefits")
      nextSection?.scrollIntoView({ behavior: "smooth" })
    },
    onSwipedRight: (eventData) => {
      const prevSection = document.getElementById("hero")
      prevSection?.scrollIntoView({ behavior: "smooth" })
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

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
            onPress={() => setShowMoreFeatures(true)}
          >
            探索更多功能
          </Button>
        </ScrollAnimation>
      </div>

      <Modal 
        isOpen={showMoreFeatures}
        onClose={() => setShowMoreFeatures(false)}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          backdrop: "bg-primary-dark/50 backdrop-blur-md",
          base: "bg-primary-dark/90 border border-white/20",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white">场景解决方案</h2>
                <p className="text-white/60 text-sm">为不同场景提供专业解决方案</p>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {solutions.map((solution, index) => (
                    <Card 
                      key={index}
                      className={`bg-gradient-to-br ${solution.color} hover:scale-105 transition-transform duration-300`}
                      isPressable
                      onPress={() => setSelectedSolution(index)}
                    >
                      <CardBody className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Icon icon={solution.icon} className="text-3xl text-white" />
                          <h3 className="text-xl font-bold text-white">{solution.title}</h3>
                        </div>
                        <div className="space-y-4">
                          {solution.scenarios.map((scenario, idx) => (
                            <div key={idx} className="bg-white/10 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon icon={scenario.icon} className="text-xl text-white" />
                                <h4 className="font-semibold text-white">{scenario.name}</h4>
                              </div>
                              <p className="text-white/80 text-sm mb-3">{scenario.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {scenario.features.map((feature, fidx) => (
                                  <span 
                                    key={fidx}
                                    className="text-xs bg-white/20 text-white px-2 py-1 rounded-full"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  关闭
                </Button>
                <Button
                  className="bg-white text-primary-dark"
                  onPress={onClose}
                >
                  立即体验
                </Button>
              </ModalFooter>
            </motion.div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Features
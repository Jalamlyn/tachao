import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ScrollAnimation from "./ScrollAnimation"

const features = [
  {
    icon: "mdi:robot",
    title: "AI 智能生成",
    description: "自动生成标准化单据和报表，减少人工错误",
    details: ["智能识别数据", "自动填充字段", "格式标准化", "实时校验"],
    color: "from-cyan-500/90 to-blue-600/90",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: "mdi:chart-line",
    title: "数据分析",
    description: "智能分析企业经营数据，提供决策支持",
    details: ["多维度分析", "趋势预测", "异常预警", "决策建议"],
    color: "from-violet-500/90 to-purple-600/90",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: "mdi:lightning-bolt",
    title: "效率提升",
    description: "显著提升工作效率，节省人力成本",
    details: ["批量处理", "自动化流程", "快速生成", "一键导出"],
    color: "from-amber-500/90 to-orange-600/90",
    shadowColor: "shadow-orange-500/20",
  },
]

const Features: React.FC = () => {
  return (
    <div className='py-20 bg-white/10 backdrop-blur-lg'>
      <div className='container mx-auto px-4'>
        <ScrollAnimation className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>强大的功能特性</h2>
          <p className='text-white/80 text-lg max-w-2xl mx-auto'>让企业管理更智能、更高效</p>
        </ScrollAnimation>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <ScrollAnimation key={index}>
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className='bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all duration-300 border border-white/10 hover:border-white/20'>
                  <CardBody className='p-8'>
                    <motion.div 
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.shadowColor} shadow-lg flex items-center justify-center`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -5, 5, -5, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <Icon 
                        icon={feature.icon} 
                        className='text-4xl text-white transform transition-all duration-300'
                      />
                    </motion.div>
                    <h3 className='text-2xl font-bold text-white mb-3 text-center'>{feature.title}</h3>
                    <p className='text-white/80 mb-6 text-center leading-relaxed'>{feature.description}</p>
                    <ul className='space-y-3'>
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className='flex items-center text-white/70 text-sm'>
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="mr-3"
                          >
                            <Icon 
                              icon='mdi:check-circle' 
                              className='text-green-400 text-lg'
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

        <ScrollAnimation className='text-center mt-12'>
          <Button
            size='lg'
            className='bg-white text-primary-dark hover:bg-white/90 font-medium px-8 shadow-lg hover:shadow-xl transition-all duration-300'
            endContent={
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon icon='mdi:arrow-right' />
              </motion.div>
            }
          >
            了解更多功能
          </Button>
        </ScrollAnimation>
      </div>
    </div>
  )
}

export default Features
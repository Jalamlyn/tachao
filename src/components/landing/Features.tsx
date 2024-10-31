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
  },
  {
    icon: "mdi:chart-line",
    title: "数据分析",
    description: "智能分析企业经营数据，提供决策支持",
    details: ["多维度分析", "趋势预测", "异常预警", "决策建议"],
  },
  {
    icon: "mdi:lightning-bolt",
    title: "效率提升",
    description: "显著提升工作效率，节省人力成本",
    details: ["批量处理", "自动化流程", "快速生成", "一键导出"],
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className='bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all duration-300'>
                  <CardBody className='p-6'>
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }} className='mb-4'>
                      <Icon icon={feature.icon} className='text-4xl text-white mx-auto' />
                    </motion.div>
                    <h3 className='text-xl font-bold text-white mb-2 text-center'>{feature.title}</h3>
                    <p className='text-white/80 mb-4 text-center'>{feature.description}</p>
                    <ul className='space-y-2'>
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className='flex items-center text-white/70 text-sm'>
                          <Icon icon='mdi:check-circle' className='text-green-400 mr-2' />
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
            className='bg-white text-primary-dark hover:bg-white/90 font-medium px-8'
            endContent={<Icon icon='mdi:arrow-right' />}
          >
            了解更多功能
          </Button>
        </ScrollAnimation>
      </div>
    </div>
  )
}

export default Features

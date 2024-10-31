import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const features = [
  {
    icon: "mdi:robot",
    title: "AI 智能生成",
    description: "自动生成标准化单据和报表，减少人工错误"
  },
  {
    icon: "mdi:chart-line",
    title: "数据分析",
    description: "智能分析企业经营数据，提供决策支持"
  },
  {
    icon: "mdi:lightning-bolt",
    title: "效率提升",
    description: "显著提升工作效率，节省人力成本"
  }
]

const Features: React.FC = () => {
  return (
    <div className="py-20 bg-white/10 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all duration-300"
            >
              <CardBody className="text-center p-6">
                <Icon
                  icon={feature.icon}
                  className="text-4xl text-white mb-4 mx-auto"
                />
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Features
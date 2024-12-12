import React from "react"
import { motion } from "framer-motion"
import { Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const stats = [
  { 
    number: "75%", 
    label: "效率提升", 
    description: "AI智能化管理",
    icon: "mdi:trending-up",
    color: "text-green-400"
  },
  { 
    number: "98%", 
    label: "数据准确率", 
    description: "智能校验保障",
    icon: "mdi:shield-check",
    color: "text-blue-400"
  },
  { 
    number: "50%", 
    label: "成本节省", 
    description: "降低人工成本",
    icon: "mdi:currency-usd",
    color: "text-purple-400"
  },
  { 
    number: "10分钟", 
    label: "快速部署", 
    description: "即刻开始使用",
    icon: "mdi:rocket-launch",
    color: "text-pink-400"
  }
]

const Stats: React.FC = () => {
  return (
    <section className='py-20 relative'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          {stats.map((stat, index) => (
            <Card key={index} className='bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300'>
              <motion.div
                className='p-6 text-center'
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon 
                  icon={stat.icon} 
                  className={`text-3xl ${stat.color} mb-4 mx-auto`}
                />
                <h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>{stat.number}</h3>
                <p className='text-white/80 font-medium mb-1'>{stat.label}</p>
                <p className='text-white/60 text-sm'>{stat.description}</p>
              </motion.div>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-white/70 text-sm">
            基于行业平均水平估算
          </p>
          <p className="text-white/60 text-xs">
            实际效果可能因企业情况而异
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Stats
import React from "react"
import { motion } from "framer-motion"
import { Card } from "@nextui-org/react"

const stats = [
  { number: "1000+", label: "企业客户", description: "持续信赖与支持" },
  { number: "100万+", label: "表单生成", description: "智能高效处理" },
  { number: "98%", label: "数据准确率", description: "AI智能校验" },
  { number: "75%", label: "效率提升", description: "显著降低人工成本" },
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
          className='grid grid-cols-2 md:grid-cols-4 gap-6'
        >
          {stats.map((stat, index) => (
            <Card key={index} className='bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300'>
              <motion.div
                className='p-6 text-center'
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className='text-3xl md:text-4xl font-bold text-white mb-2'>{stat.number}</h3>
                <p className='text-white/80 font-medium mb-1'>{stat.label}</p>
                <p className='text-white/60 text-sm'>{stat.description}</p>
              </motion.div>
            </Card>
          ))}
        </motion.div>

        {/* 补充说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/70 text-sm">
            数据统计截至 2024 年 1 月
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Stats
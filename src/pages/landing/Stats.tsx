import React from "react"
import { motion } from "framer-motion"
import { Card } from "@nextui-org/react"

const stats = [
  { number: "1000+", label: "企业客户" },
  { number: "100万+", label: "生成表单" },
  { number: "98%", label: "准确率" },
  { number: "75%", label: "效率提升" },
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
                <p className='text-white/80'>{stat.label}</p>
              </motion.div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Stats

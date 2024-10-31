import React from "react"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"

interface HeroProps {
  onGetStarted: () => void
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto px-4"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            沙塔 AI - 智慧企业服务专家
          </h1>
          <p className="text-xl md:text-2xl text-white/80">
            让 AI 为企业赋能，提升效率，降低成本
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto"
        >
          自动生成单据和报表，智能分析企业经营数据，
          <br />
          为中小企业提供智能化解决方案
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90 font-medium px-8"
            onClick={onGetStarted}
          >
            立即开始
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="text-white border-white hover:bg-white/10 font-medium px-8"
          >
            了解更多
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 text-white/60 text-sm"
        >
          <p>已服务超过 1000+ 企业客户</p>
        </motion.div>
      </motion.div>

      {/* 装饰性背景元素 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent" />
    </div>
  )
}

export default Hero
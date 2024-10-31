import React from "react"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"

interface HeroProps {
  onGetStarted: () => void
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          沙塔 AI - 智慧企业服务专家
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8">
          AI 自动生成单据和报表，智能分析企业经营数据
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90"
            onClick={onGetStarted}
          >
            立即开始
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="text-white border-white hover:bg-white/10"
          >
            了解更多
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
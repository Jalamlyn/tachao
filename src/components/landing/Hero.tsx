import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@nextui-org/react"

interface HeroProps {
  onGetStarted: () => void
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        when: "beforeChildren",
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

  if (!mounted) return null

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/50 to-transparent" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto px-4 relative z-10"
      >
        <motion.div 
          variants={itemVariants} 
          className="mb-6"
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          自动生成单据和报表，智能分析企业经营数据，
          <br />
          为中小企业提供智能化解决方案
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex gap-4 justify-center"
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90 font-medium px-8"
            onClick={onGetStarted}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement
              target.style.transform = "scale(1.05)"
              target.style.transition = "transform 0.2s ease"
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement
              target.style.transform = "scale(1)"
            }}
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>已服务超过 1000+ 企业客户</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Hero
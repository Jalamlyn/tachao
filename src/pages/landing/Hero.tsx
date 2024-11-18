import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@nextui-org/react"
import { useSwipeable } from "react-swipeable"

interface HeroProps {
  onGetStarted: () => void
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const [mounted, setMounted] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  // 优化动画性能
  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)
  const rotateSpring = useSpring(0, springConfig)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 优化后的动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // 添加手势支持
  const handlers = useSwipeable({
    onSwipedUp: () => {
      const nextSection = document.getElementById("features")
      nextSection?.scrollIntoView({ behavior: "smooth" })
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchEnd = e.touches[0].clientY
    const diff = touchStart - touchEnd

    if (diff > 50) {
      const nextSection = document.getElementById("features")
      nextSection?.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!mounted) return null

  return (
    <div 
      className="min-h-[80vh] md:min-h-[90vh] flex items-center justify-center relative overflow-hidden"
      {...handlers}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
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
        className="text-center max-w-4xl mx-auto px-4 relative z-10 space-y-8 md:space-y-12"
      >
        {/* Logo 区域 - 调整尺寸和效果 */}
        <motion.div 
          variants={itemVariants} 
          className="mb-6 md:mb-8"
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="relative group perspective-1000 inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo 背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-primary/20 to-accent/20 blur-2xl rounded-full transform scale-110 group-hover:scale-125 transition-transform duration-700" />
            
            {/* Logo 容器 */}
            <motion.div
              className="relative"
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
              }}
              onHoverStart={() => {
                rotateSpring.set(10)
                scaleSpring.set(1.05)
              }}
              onHoverEnd={() => {
                rotateSpring.set(0)
                scaleSpring.set(1)
              }}
              style={{
                scale: scaleSpring,
                rotateY: rotateSpring,
                transformStyle: "preserve-3d"
              }}
            >
              <img
                src="/assets/logo.jpg"
                alt="ShaTa AI"
                className="h-24 md:h-32 lg:h-40 w-auto mx-auto rounded-lg
                  shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
                  backdrop-blur-sm
                  border border-white/10 hover:border-white/20
                  transition-all duration-300
                  transform-gpu will-change-transform"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 标题区域 */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            沙塔智能 - 智慧企业服务专家
          </h1>
          <p className="text-lg md:text-2xl text-white/80">
            让 AI 为企业赋能，提升效率，降低成本
          </p>
        </motion.div>

        {/* 描述文字 */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-xl text-white/70 max-w-2xl mx-auto"
        >
          自动生成单据和报表，智能分析企业经营数据，
          <br className="hidden md:block" />
          为中小企业提供智能化解决方案
        </motion.p>

        {/* 按钮区域 */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300"
            onClick={onGetStarted}
          >
            立即开始
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="text-white border-white hover:bg-white/10 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            了解更多
          </Button>
        </motion.div>

        {/* 客户数量信息 */}
        <motion.div
          variants={itemVariants}
          className="mt-8 md:mt-12 text-white/60 text-sm"
        >
          <p>已服务超过 1000+ 企业客户</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Hero
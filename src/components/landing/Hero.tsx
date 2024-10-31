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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // 优化动画性能
  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)

  useEffect(() => {
    setMounted(true)
    
    // 检查是否是首次访问
    const hasVisited = localStorage.getItem('hasVisitedBefore')
    if (hasVisited) {
      setIsFirstVisit(false)
    } else {
      localStorage.setItem('hasVisitedBefore', 'true')
    }

    // 添加滚动检测
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      // 向上滑动时平滑滚动到下一个部分
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
      // 向上滑动超过阈值时滚动到下一部分
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
        className="text-center max-w-4xl mx-auto px-4 relative z-10"
      >
        <motion.div 
          variants={itemVariants} 
          className="mb-6"
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 leading-tight">
            沙塔 AI - 智慧企业服务专家
          </h1>
          <p className="text-lg md:text-2xl text-white/80">
            让 AI 为企业赋能，提升效率，降低成本
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-xl text-white/70 mb-8 max-w-2xl mx-auto"
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          自动生成单据和报表，智能分析企业经营数据，
          <br className="hidden md:block" />
          为中小企业提供智能化解决方案
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90 font-medium px-8 w-full md:w-auto"
            onClick={onGetStarted}
            onMouseEnter={() => scaleSpring.set(1.05)}
            onMouseLeave={() => scaleSpring.set(1)}
            style={{
              scale: scaleSpring
            }}
          >
            立即开始
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="text-white border-white hover:bg-white/10 font-medium px-8 w-full md:w-auto"
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

        {/* 改进的滚动指示器 */}
        {isFirstVisit && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, 10, 0],
              opacity: isScrolled ? 0 : 1
            }}
            transition={{
              y: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              },
              opacity: {
                duration: 0.3
              }
            }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/30 rounded-full mt-2" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Hero
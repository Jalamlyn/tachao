import React, { useEffect, useState } from "react"
import { motion, useSpring, useTransform, useScroll } from "framer-motion"

const AnimatedBackground: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const { scrollYProgress } = useScroll()

  // 性能优化：使用 spring 动画
  const springConfig = { mass: 1, stiffness: 50, damping: 30 }
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5], [1, 0.2]), springConfig)

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.5 : 1 }}
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-light to-accent opacity-20"
      />
      
      <div 
        className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10"
        style={{
          backgroundSize: isMobile ? '20px 20px' : '40px 40px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* 添加动态粒子效果 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.5, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent"
        style={{
          backdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)',
          WebkitBackdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)'
        }}
      />

      {isMobile && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
      )}
    </div>
  )
}

export default AnimatedBackground
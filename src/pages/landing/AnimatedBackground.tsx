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

      {/* 增强的动态粒子效果 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-white'}`}
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 50 - 25],
              opacity: [0.8, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* 新增的光效波浪 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute inset-0 bg-gradient-to-t from-primary-light/30 to-transparent"
            animate={{
              y: [0, 20, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 1.5,
            }}
            style={{
              transform: `scale(${1 + i * 0.1})`,
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
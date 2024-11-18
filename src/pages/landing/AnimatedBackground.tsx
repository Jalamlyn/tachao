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
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.5 : 1 }} // 移动端更快的动画
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-light to-accent opacity-20"
      />
      
      {/* 移动端降低网格图案的复杂度 */}
      <div 
        className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10"
        style={{
          backgroundSize: isMobile ? '20px 20px' : '40px 40px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* 优化渐变效果 */}
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

      {/* 添加移动端性能优化的额外层 */}
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
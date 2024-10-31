import React, { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { motion, useScroll, useSpring } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isNavVisible, setIsNavVisible] = useState(true)

  // 性能优化：使用 spring 动画
  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const navSpring = useSpring(0, springConfig)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // 控制导航栏显示/隐藏
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false)
      } else {
        setIsNavVisible(true)
      }
      
      setLastScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // 处理移动端手势
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setLastScrollY(touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const diff = lastScrollY - touch.clientY

    if (Math.abs(diff) > 5) {
      setIsNavVisible(diff < 0)
    }
  }

  return (
    <>
      <motion.nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-primary-dark/80 backdrop-blur-lg" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: isNavVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        style={{
          y: navSpring
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              {/* Logo 区域 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* <img src="/assets/logo.jpg" alt="ShaTa AI" className="h-8 w-auto" /> */}
              </motion.div>
            </div>

            {/* 移动端菜单按钮 */}
            <div className='md:hidden'>
              <Button
                isIconOnly
                variant="light"
                className="text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Icon 
                  icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"} 
                  className="text-2xl"
                />
              </Button>
            </div>

            {/* 桌面端按钮 */}
            <div className='hidden md:flex items-center gap-4'>
              <Button 
                variant='light' 
                className='text-white'
                onClick={() => navigate("/we-chat-login")}
              >
                登录
              </Button>
              <Button 
                className='bg-white text-primary-dark'
                onClick={() => navigate("/we-chat-login")}
              >
                立即开始
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 移动端菜单 */}
      <motion.div
        className={`fixed inset-0 bg-primary-dark/95 z-40 backdrop-blur-lg md:hidden`}
        initial={{ opacity: 0, x: "100%" }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : "100%"
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <Button 
            size="lg"
            variant="light" 
            className="text-white w-3/4"
            onClick={() => {
              setIsMobileMenuOpen(false)
              navigate("/we-chat-login")
            }}
          >
            登录
          </Button>
          <Button 
            size="lg"
            className="bg-white text-primary-dark w-3/4"
            onClick={() => {
              setIsMobileMenuOpen(false)
              navigate("/we-chat-login")
            }}
          >
            立即开始
          </Button>
        </div>
      </motion.div>
    </>
  )
}

export default Navbar
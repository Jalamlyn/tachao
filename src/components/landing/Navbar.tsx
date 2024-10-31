import React, { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { motion, useScroll } from "framer-motion"
import { useNavigate } from "react-router-dom"

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary-dark/80 backdrop-blur-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            {/* <img
              src="/assets/logo.jpg"
              alt="ShaTa AI"
              className="h-8 w-auto"
            /> */}
          </div>
          <div className='flex items-center gap-4'>
            <Button variant='light' className='text-white' onClick={() => navigate("/we-chat-login")}>
              登录
            </Button>
            <Button className='bg-white text-primary-dark' onClick={() => navigate("/we-chat-login")}>
              立即开始
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

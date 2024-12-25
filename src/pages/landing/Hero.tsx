import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import QRCodeModal from "./QRCodeModal"
import WaitListModal from "./WaitListModal"
import { useNavigate } from "react-router-dom"
import IndustryBubbles from "./IndustryBubbles"

interface HeroProps {
  onGetStarted: () => void
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const [mounted, setMounted] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isWaitListOpen, setIsWaitListOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)
  const rotateSpring = useSpring(0, springConfig)

  useEffect(() => {
    setMounted(true)
    const auth = app.auth()
    auth.queryUser({
      phone_number: "+86 15384078477",
    })

    // 启动部署时间轴动画
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : 0))
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const timelineSteps = [
    { time: "1分钟", action: "完成部署", icon: "mdi:rocket-launch" },
    { time: "5分钟", action: "快速开发", icon: "mdi:code-braces" },
    { time: "10分钟", action: "系统上线", icon: "mdi:check-circle" }
  ]

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
    <section
      className='min-h-screen flex items-center justify-center relative overflow-hidden py-20 md:py-32'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className='absolute top-4 right-4 md:top-8 md:right-8 z-20'>
        <Button
          size='sm'
          variant='ghost'
          className='text-white hover:bg-white/10 font-medium
            transform hover:scale-105 active:scale-95 transition-all duration-300'
          onClick={() => navigate("/login")}
        >
          <Icon icon='mdi:user' className='mr-1' />
          企业管理员登录
        </Button>
      </div>

      <motion.div style={{ y, opacity }} className='absolute inset-0 pointer-events-none'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary-dark/50 to-transparent' />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='text-center max-w-4xl mx-auto px-4 relative z-10 space-y-8 md:space-y-12'
      >
        <motion.div
          variants={itemVariants}
          className='mb-6 md:mb-8'
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className='relative group perspective-1000 inline-block'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/20 via-primary/20 to-accent/20 blur-2xl rounded-full transform scale-110 group-hover:scale-125 transition-transform duration-700' />

            <motion.div
              className='relative'
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
                transformStyle: "preserve-3d",
              }}
            >
              <img
                src='/assets/logo.jpg'
                alt='ShaTa AI'
                className='h-24 md:h-32 lg:h-40 w-auto mx-auto rounded-lg
                  shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
                  backdrop-blur-sm
                  border border-white/10 hover:border-white/20
                  transition-all duration-300
                  transform-gpu will-change-transform'
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className='space-y-4'>
          <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight'>让天下没有难管的企业</h1>
          <p className='text-lg md:text-2xl text-white/80'>AI 赋能企业管理 · 智能化一站式解决方案</p>
        </motion.div>

        {/* 新增时间轴部分 */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center gap-4 md:gap-8 my-8"
        >
          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.action}
              className={`flex flex-col items-center p-4 rounded-lg
                ${currentStep === index ? 'bg-white/10' : 'bg-white/5'}
                transition-all duration-300`}
              animate={{
                scale: currentStep === index ? 1.1 : 1,
                opacity: currentStep === index ? 1 : 0.7
              }}
            >
              <Icon 
                icon={step.icon}
                className={`text-2xl md:text-3xl mb-2
                  ${currentStep === index ? 'text-accent' : 'text-white/70'}`}
              />
              <div className="text-sm md:text-base font-medium text-white">
                {step.time}
              </div>
              <div className="text-xs md:text-sm text-white/70">
                {step.action}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className='space-y-4'>
          <div className='flex flex-wrap justify-center gap-4 text-white/80'>
            <div className='flex items-center space-x-2'>
              <Icon icon='ix:ai' className='text-blue-400' />
              <span>AI智能助手</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:trending-up' className='text-green-400' />
              <span>效率提升75%</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:rocket-launch' className='text-purple-400' />
              <span>10分钟部署</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className='flex flex-col md:flex-row gap-4 justify-center items-center'>
          <Button
            size='lg'
            className='bg-white text-primary-dark hover:bg-white/90 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300'
            onClick={() => setIsWaitListOpen(true)}
          >
            申请开通账号
          </Button>
          <Button
            size='lg'
            variant='bordered'
            className='text-white border-white hover:bg-white/10 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300'
            onClick={() => setIsQRCodeOpen(true)}
          >
            预约企业演示
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className='mt-8 md:mt-12'>
          <p className='text-white/60 text-sm mb-4'>创新技术，值得信赖</p>
          <div className='flex justify-center items-center gap-6'>
            <div className='text-white/70 text-sm flex items-center gap-2'>
              <Icon icon='mdi:shield-check' className='text-green-400' />
              安全可靠
            </div>
            <div className='text-white/70 text-sm flex items-center gap-2'>
              <Icon icon='mdi:rocket-launch' className='text-blue-400' />
              持续创新
            </div>
            <div className='text-white/70 text-sm flex items-center gap-2'>
              <Icon icon='tabler:24-hours' className='text-purple-400' />
              专业支持
            </div>
          </div>
        </motion.div>

        {/* 添加行业气泡展示 */}
        <motion.div
          variants={itemVariants}
          className="mt-12"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
            支持多行业定制化解决方案
          </h3>
          <IndustryBubbles />
        </motion.div>
      </motion.div>

      <WaitListModal isOpen={isWaitListOpen} onClose={() => setIsWaitListOpen(false)} />
      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
    </section>
  )
}

export default Hero
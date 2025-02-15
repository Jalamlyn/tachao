import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import QRCodeModal from "./QRCodeModal"
import { useNavigate } from "react-router-dom"

interface HeroProps {
  onGetStarted: () => void
}

// 视频URL常量
const VIDEO_URLS = {
  first:
    "https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/2%E6%9C%8812%E6%97%A5.mp4?sign=74e621d5a9ed30b90f728700e96f7bb1&t=1739305856",
  second:
    "https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/2%E6%9C%8814%E6%97%A5.mp4?sign=b2088a87a639ea8431adcd354e7c6e8a&t=1739477700",
}

// 视频类型说明
const VIDEO_TYPES = {
  second: "AI开发网站演示",
  first: "AI开发系统演示",
}

// 产品视频组件
const ProductVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentVideo, setCurrentVideo] = useState<"first" | "second">("second")

  const handleVideoSwitch = () => {
    setCurrentVideo((current) => (current === "first" ? "second" : "first"))
  }

  return (
    <div className='relative w-full max-w-4xl mx-auto my-12 rounded-2xl overflow-hidden group'>
      <div className='absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl' />

      {/* 当前视频类型说明 */}
      <div className='absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium'>
        <Icon icon={currentVideo === "first" ? "mdi:web" : "mdi:application"} className='inline-block mr-2' />
        {VIDEO_TYPES[currentVideo]}
      </div>

      <video ref={videoRef} className='w-full rounded-2xl' autoPlay muted loop playsInline key={currentVideo}>
        <source src={VIDEO_URLS[currentVideo]} type='video/mp4' />
        您的浏览器不支持视频播放。
      </video>

      {/* 改进的视频切换按钮 */}
      <Button
        onClick={handleVideoSwitch}
        className='absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-6 rounded-xl 
        flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
        startContent={<Icon icon='mdi:video-switch' className='w-5 h-5' />}
      >
        切换到{currentVideo === "second" ? "AI开发系统演示" : "AI开发网站演示"}
      </Button>
    </div>
  )
}

// 智能按钮组件
const SmartButton: React.FC<React.PropsWithChildren<{ onClick?: () => void; variant?: string }>> = ({
  children,
  onClick,
  variant = "primary",
}) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='relative group'>
      <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200' />
      <Button
        size='lg'
        className={`${
          variant === "primary"
            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
            : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
        } relative px-8 h-14 text-lg font-medium shadow-lg hover:shadow-xl t-all duration-300 hover:ring-2 hover:ring-purple-500/20`}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  )
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const controls = useAnimation()
  const [inView, setInView] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)

  // 增强的滚动动画效果
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const scaleSpring = useSpring(scale, springConfig)
  const ySpring = useSpring(y, springConfig)

  // 打字机效果状态
  const [textIndex, setTextIndex] = useState(0)
  const texts = ["零代码,让AI为您构建企业应用", "专业级企业应用,一键生成", "像聊天一样开发应用,降本增效"]

  useEffect(() => {
    if (ref) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting)
          if (entry.isIntersecting) {
            controls.start("visible")
          }
        },
        { threshold: 0.2 }
      )

      observer.observe(ref)
      return () => observer.disconnect()
    }
  }, [controls, ref])

  // 打字机效果
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((current) => (current + 1) % texts.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      className='min-h-screen relative overflow-hidden bg-gradient-to-br from-[#2D1B69] via-[#1E1656] to-[#19073B]'
      ref={setRef}
    >
      {/* 原有的背景效果 */}
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />
      <div className='absolute inset-0'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob' />
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000' />
        <div className='absolute -bottom-32 left-1/3 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000' />
      </div>

      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping' />
        <div className='absolute top-1/3 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-ping animation-delay-1000' />
        <div className='absolute bottom-1/4 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-2000' />
      </div>

      <div className='relative mx-auto px-4 py-20 md:py-32'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-2'
        >
          <SmartButton variant='secondary' onClick={() => navigate("/market")}>
            <Icon icon='mdi:store' className='mr-1' />
            应用市场
          </SmartButton>
          <SmartButton variant='secondary' onClick={() => navigate("/login")}>
            <Icon icon='mdi:user' className='mr-1' />
            登录
          </SmartButton>
        </motion.div>

        <div className='max-w-5xl mx-auto text-center space-y-12'>
          {/* 其余代码保持不变 */}
          {/* ... */}
        </div>
      </div>

      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
    </section>
  )
}

export default Hero
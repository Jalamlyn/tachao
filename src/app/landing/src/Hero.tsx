import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import QRCodeModal from "./QRCodeModal"
import { useNavigate } from "react-router-dom"

interface HeroProps {
  onGetStarted: () => void
}

// 产品视频组件
const ProductVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.load()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLoadedData = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError("视频加载失败,请刷新页面重试")
    setIsLoading(false)
  }

  if (error) {
    return (
      <div className="relative w-full max-w-4xl mx-auto my-12 rounded-2xl bg-red-500/10 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon icon="mdi:alert" className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="relative w-full max-w-4xl mx-auto my-12 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 aspect-video animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon icon="mdi:video" className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">产品演示视频加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto my-12 rounded-2xl overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl" />
      <video
        ref={videoRef}
        className="w-full rounded-2xl"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
        preload="metadata"
      >
        <source src="" type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
      
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={handleMuteToggle}
          aria-label={isMuted ? "取消静音" : "静音"}
        >
          <Icon icon={isMuted ? "mdi:volume-off" : "mdi:volume-high"} className="w-6 h-6" />
        </motion.button>
      </div>
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
  const texts = ["将你的创意转化为现实代码", "让AI为企业赋能", "10倍提升开发效率"]

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
          className='absolute top-4 right-4 md:top-8 md:right-8 z-20'
        >
          <SmartButton variant='secondary' onClick={() => navigate("/login")}>
            <Icon icon='mdi:user' className='mr-1' />
            登录
          </SmartButton>
        </motion.div>

        <div className='max-w-5xl mx-auto text-center space-y-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ scale: scaleSpring, y: ySpring }}
            className='space-y-6'
          >
            <motion.h1
              key={texts[textIndex]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 leading-tight'
            >
              {texts[textIndex]}
            </motion.h1>
            <p className='text-xl md:text-2xl text-white/80 leading-relaxed'>
              像聊天一样开发应用 · 无需编程经验 · 即刻开始创造
            </p>
          </motion.div>

          {/* 添加产品视频展示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ProductVideo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='flex flex-wrap justify-center gap-6'
          >
            <SmartButton onClick={() => navigate("/register")}>
              <Icon icon='mdi:rocket-launch' className='mr-2' />
              立即体验
            </SmartButton>
            <SmartButton variant='secondary' onClick={() => setIsQRCodeOpen(true)}>
              <Icon icon='mdi:presentation' className='mr-2' />
              预约演示
            </SmartButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8'
          >
            {[
              { icon: "mdi:rocket-launch", text: "10分钟快速上线", color: "from-purple-400 to-purple-600" },
              { icon: "mdi:trending-up", text: "效率提升10倍", color: "from-cyan-400 to-cyan-600" },
              { icon: "mdi:shield-check", text: "企业级安全保障", color: "from-orange-400 to-orange-600" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className='flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 t-all duration-300'
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                  <Icon icon={item.icon} className='w-6 h-6 text-white' />
                </div>
                <span className='text-white/90 font-medium'>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
    </section>
  )
}

export default Hero
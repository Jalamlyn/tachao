import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import QRCodeModal from "./QRCodeModal"
import WaitListModal from "./WaitListModal"
import { useNavigate } from "react-router-dom"
import Particles from "react-tsparticles"
import { loadFull } from "tsparticles"

interface HeroProps {
  onGetStarted: () => void
}

// 智能按钮组件
const SmartButton: React.FC<React.PropsWithChildren<{ onClick?: () => void; variant?: string }>> = ({
  children,
  onClick,
  variant = "primary"
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        size="lg"
        className={`${
          variant === "primary"
            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
            : "border-white/20 text-white hover:bg-white/10"
        } hover:opacity-90 px-8 h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  )
}

// 粒子背景组件
const ParticleBackground: React.FC = () => {
  const particlesInit = async (main: any) => {
    await loadFull(main)
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          opacity: 0
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.2,
            random: true
          },
          size: {
            value: 3,
            random: true
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#4f46e5",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 0.5
              }
            }
          }
        },
        retina_detect: true
      }}
      className="absolute inset-0"
    />
  )
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const controls = useAnimation()
  const [inView, setInView] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isWaitListOpen, setIsWaitListOpen] = useState(false)

  // 增强的滚动动画效果
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const scaleSpring = useSpring(scale, springConfig)
  const ySpring = useSpring(y, springConfig)

  // 打字机效果状态
  const [textIndex, setTextIndex] = useState(0)
  const texts = [
    "将你的创意转化为现实代码",
    "让AI为企业赋能",
    "10倍提升开发效率"
  ]

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
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#2D1B69] via-[#1E1656] to-[#19073B]"
      ref={setRef}
    >
      {/* 粒子背景 */}
      <ParticleBackground />

      {/* 原有的背景效果 */}
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-ping animation-delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-2000" />
      </div>

      <div className="relative mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-20"
        >
          <SmartButton variant="secondary" onClick={() => navigate("/login")}>
            <Icon icon="mdi:user" className="mr-1" />
            企业管理员登录
          </SmartButton>
        </motion.div>

        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ scale: scaleSpring, y: ySpring }}
            className="space-y-6"
          >
            <motion.h1
              key={texts[textIndex]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 leading-tight"
            >
              {texts[textIndex]}
            </motion.h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
              像聊天一样开发应用 · 无需编程经验 · 即刻开始创造
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <SmartButton onClick={() => setIsWaitListOpen(true)}>
              <Icon icon="mdi:rocket-launch" className="mr-2" />
              立即体验
            </SmartButton>
            <SmartButton variant="secondary" onClick={() => setIsQRCodeOpen(true)}>
              <Icon icon="mdi:presentation" className="mr-2" />
              预约演示
            </SmartButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: "mdi:rocket-launch", text: "10分钟快速上线", color: "from-purple-400 to-purple-600" },
              { icon: "mdi:trending-up", text: "效率提升10倍", color: "from-cyan-400 to-cyan-600" },
              { icon: "mdi:shield-check", text: "企业级安全保障", color: "from-orange-400 to-orange-600" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                  <Icon icon={item.icon} className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/90 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <WaitListModal isOpen={isWaitListOpen} onClose={() => setIsWaitListOpen(false)} />
      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
    </section>
  )
}

export default Hero
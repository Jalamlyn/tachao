import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import QRCodeModal from "./QRCodeModal"
import WaitListModal from "./WaitListModal"
import { useNavigate } from "react-router-dom"

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
  const [demoText, setDemoText] = useState("")
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0)
  const [showDemo, setShowDemo] = useState(false)

  const springConfig = { mass: 1, stiffness: 100, damping: 30 }
  const scaleSpring = useSpring(1, springConfig)
  const rotateSpring = useSpring(0, springConfig)

  const demoMessages = [
    {
      input: "我需要一个库存管理系统",
      response: {
        text: "正在为您设计智能库存管理系统...",
        features: [
          "• 实时库存监控仪表盘",
          "• 智能入库/出库管理",
          "• 库存预警自动提醒",
          "• 数据分析报表生成"
        ],
        stats: {
          deployTime: "1分钟完成部署",
          efficiency: "效率提升75%",
          accuracy: "准确率99.9%"
        }
      }
    },
    {
      input: "分析当前库存状态",
      response: {
        text: "已为您生成库存概览：",
        data: [
          "• 总库存: 2,345件",
          "• 预警商品: 3件",
          "• 本周出库: 156件",
          "• 库存周转率: 76%"
        ],
        chart: true
      }
    },
    {
      input: "生成本月库存报表",
      response: {
        text: "正在生成智能分析报表...",
        insights: [
          "• 库存优化建议",
          "• 采购计划推荐",
          "• 销售趋势分析",
          "• 成本控制方案"
        ]
      }
    }
  ]

  useEffect(() => {
    setMounted(true)
    const auth = app.auth()
    auth.queryUser({
      phone_number: "+86 15384078477",
    })

    // 启动部署时间轴动画
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : 0))
    }, 3000)

    // 延迟1秒后开始演示
    setTimeout(() => {
      setShowDemo(true)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!showDemo) return

    const startDemo = () => {
      const demo = demoMessages[currentDemoIndex]
      setIsTyping(true)
      setDemoText("")
      setAiResponse(null)
      
      // 模拟用户输入
      let charIndex = 0
      const typeTimer = setInterval(() => {
        if (charIndex < demo.input.length) {
          setDemoText(prev => prev + demo.input[charIndex])
          charIndex++
        } else {
          clearInterval(typeTimer)
          // 模拟AI响应
          setTimeout(() => {
            setAiResponse(demo.response)
            setIsTyping(false)
            // 延迟后开始下一个演示
            setTimeout(() => {
              setCurrentDemoIndex((prev) => (prev + 1) % demoMessages.length)
            }, 3000) // 缩短到3秒
          }, 300) // 缩短到300ms
        }
      }, 50) // 加快打字速度
    }

    startDemo()
    // 缩短循环间隔到8秒
    const demoInterval = setInterval(startDemo, 8000)

    return () => clearInterval(demoInterval)
  }, [currentDemoIndex, showDemo])

  const timelineSteps = [
    { time: "1分钟", action: "完成部署", icon: "mdi:rocket-launch" },
    { time: "5分钟", action: "快速开发", icon: "mdi:code-braces" },
    { time: "10分钟", action: "系统上线", icon: "mdi:check-circle" },
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

  const renderAIResponse = (response: any) => {
    if (!response) return null;

    return (
      <div className="space-y-4">
        <p className="text-white/90">{response.text}</p>
        {response.features && (
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {response.features.map((feature: string, index: number) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-300
                  border border-white/5 hover:border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        )}
        {response.data && (
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {response.data.map((item: string, index: number) => (
              <motion.div
                key={index}
                className="bg-accent/10 backdrop-blur-sm rounded-lg p-3 hover:bg-accent/20 transition-all duration-300
                  border border-accent/5 hover:border-accent/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        )}
        {response.insights && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {response.insights.map((insight: string, index: number) => (
              <motion.div
                key={index}
                className="bg-primary/10 backdrop-blur-sm rounded-lg p-3 hover:bg-primary/20 transition-all duration-300
                  border border-primary/5 hover:border-primary/10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {insight}
              </motion.div>
            ))}
          </motion.div>
        )}
        {response.stats && (
          <motion.div 
            className="flex justify-between mt-4 bg-white/5 rounded-xl p-4 backdrop-blur-sm
              border border-white/10 hover:border-white/20 transition-all duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Object.entries(response.stats).map(([key, value], index) => (
              <motion.div
                key={key}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="text-xs text-white/60">{key}</div>
                <div className="text-sm font-medium text-white">{value}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    )
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
        className='text-center max-w-5xl mx-auto px-4 relative z-10 space-y-8 md:space-y-12'
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

        {/* AI对话演示界面 */}
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden
            shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5"></div>
            
            {/* 顶部栏 */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10
              bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white/80 text-sm font-medium">AI 智能助手</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                <span>响应时间 &lt; 1s</span>
              </div>
            </div>

            {/* 对话内容 */}
            <div className="relative p-6 space-y-6">
              {/* 用户输入 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                  border border-white/20 shadow-lg">
                  <Icon icon="mdi:user" className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block max-w-[80%]
                    border border-white/10 shadow-lg">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-white/90"
                    >
                      {demoText}
                      {isTyping && demoText.length > 0 && (
                        <motion.span
                          animate={{ opacity: [0, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="ml-1"
                        >
                          |
                        </motion.span>
                      )}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* AI响应 */}
              {aiResponse && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center
                    border border-accent/30 shadow-lg">
                    <Icon icon="solar:robot-lineart" className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-accent/5 backdrop-blur-sm rounded-2xl p-4 inline-block max-w-[90%]
                      border border-accent/10 shadow-lg">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-white/90"
                      >
                        {renderAIResponse(aiResponse)}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部输入栏 */}
            <div className="relative px-6 py-4 border-t border-white/10
              bg-gradient-to-r from-transparent to-white/5">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 px-4 py-2
                  shadow-inner hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-2 text-white/40">
                    <Icon icon="mdi:message-text-outline" className="w-4 h-4" />
                    <span className="text-sm">输入您的需求...</span>
                  </div>
                </div>
                <Button
                  className="bg-accent/20 text-accent hover:bg-accent/30 shadow-lg
                    hover:shadow-accent/20 transition-all duration-300"
                  isIconOnly
                >
                  <Icon icon="mdi:send" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 时间轴部分 */}
        <motion.div variants={itemVariants} className='flex justify-center gap-4 md:gap-8 my-8'>
          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.action}
              className={`flex flex-col items-center p-4 rounded-lg
                ${currentStep === index ? "bg-white/10" : "bg-white/5"}
                transition-all duration-300 border border-white/10 hover:border-white/20
                shadow-lg hover:shadow-xl`}
              animate={{
                scale: currentStep === index ? 1.1 : 1,
                opacity: currentStep === index ? 1 : 0.7,
              }}
            >
              <Icon
                icon={step.icon}
                className={`text-2xl md:text-3xl mb-2
                  ${currentStep === index ? "text-accent" : "text-white/70"}`}
              />
              <div className='text-sm md:text-base font-medium text-white'>{step.time}</div>
              <div className='text-xs md:text-sm text-white/70'>{step.action}</div>
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
              <span>10分钟上线</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className='flex flex-col md:flex-row gap-4 justify-center items-center'>
          <Button
            size='lg'
            className='bg-white text-primary-dark hover:bg-white/90 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300
              shadow-lg hover:shadow-xl'
            onClick={() => setIsWaitListOpen(true)}
          >
            申请开通账号
          </Button>
          <Button
            size='lg'
            variant='bordered'
            className='text-white border-white hover:bg-white/10 font-medium px-8 w-full md:w-auto
              transform hover:scale-105 active:scale-95 transition-all duration-300
              shadow-lg hover:shadow-xl'
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

        <motion.div variants={itemVariants} className='mt-12'>
          <h3 className='text-xl md:text-2xl font-bold text-white mb-6'>支持多行业定制化解决方案</h3>
        </motion.div>
      </motion.div>

      <WaitListModal isOpen={isWaitListOpen} onClose={() => setIsWaitListOpen(false)} />
      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
    </section>
  )
}

export default Hero
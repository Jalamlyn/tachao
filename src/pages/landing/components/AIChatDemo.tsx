import React, { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

// 定义消息类型
interface Message {
  type: 'user' | 'ai'
  content: any
}

// 定义演示消息
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

// 消息气泡组件
const MessageBubble = React.memo(({ content, type }: { content: any, type: 'user' | 'ai' }) => {
  const renderAIResponse = (response: any) => {
    if (!response) return null;

    return (
      <div className="space-y-4">
        <p className="text-white/90">{response.text}</p>
        {response.features && (
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ willChange: 'transform, opacity' }}
          >
            {response.features.map((feature: string, index: number) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-300
                  border border-white/5 hover:border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ willChange: 'transform, opacity' }}
          >
            {response.data.map((item: string, index: number) => (
              <motion.div
                key={index}
                className="bg-accent/10 backdrop-blur-sm rounded-lg p-3 hover:bg-accent/20 transition-all duration-300
                  border border-accent/5 hover:border-accent/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
            transition={{ duration: 0.3 }}
            style={{ willChange: 'transform, opacity' }}
          >
            {response.insights.map((insight: string, index: number) => (
              <motion.div
                key={index}
                className="bg-primary/10 backdrop-blur-sm rounded-lg p-3 hover:bg-primary/20 transition-all duration-300
                  border border-primary/5 hover:border-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
            transition={{ duration: 0.3 }}
            style={{ willChange: 'transform, opacity' }}
          >
            {Object.entries(response.stats).map(([key, value], index) => (
              <motion.div
                key={key}
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
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

  return (
    <div className="flex items-start gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-lg
        ${type === 'user' ? 'bg-white/10 border-white/20' : 'bg-accent/20 border-accent/30'}`}>
        <Icon 
          icon={type === 'user' ? "mdi:user" : "mdi:robot"} 
          className={`w-5 h-5 ${type === 'user' ? 'text-white/80' : 'text-accent'}`} 
        />
      </div>
      <div className="flex-1">
        <div className={`backdrop-blur-sm rounded-2xl p-4 inline-block max-w-[90%] border shadow-lg
          ${type === 'user' ? 'bg-white/10 border-white/10' : 'bg-accent/5 border-accent/10'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-white/90"
            style={{ willChange: 'transform, opacity' }}
          >
            {type === 'user' ? content : renderAIResponse(content)}
          </motion.div>
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

// 主组件
const AIChatDemo: React.FC = () => {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0)
  const [demoText, setDemoText] = useState("")
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  // 动画配置
  const ANIMATION_INTERVAL = 12000  // 增加间隔
  const TYPING_SPEED = 100     // 降低打字速度

  useEffect(() => {
    // 延迟1秒后开始演示
    const timer = setTimeout(() => {
      setShowDemo(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showDemo) return

    let animationFrame: number
    let typeTimer: NodeJS.Timeout
    let demoInterval: NodeJS.Timeout

    const startDemo = () => {
      const demo = demoMessages[currentDemoIndex]
      
      // 批量更新状态
      ReactDOM.unstable_batchedUpdates(() => {
        setIsTyping(true)
        setDemoText("")
        setAiResponse(null)
      })

      let charIndex = 0
      const typeText = () => {
        if (charIndex < demo.input.length) {
          setDemoText(prev => prev + demo.input[charIndex])
          charIndex++
          typeTimer = setTimeout(typeText, TYPING_SPEED)
        } else {
          // 显示AI响应
          setTimeout(() => {
            setAiResponse(demo.response)
            setIsTyping(false)
            // 延迟后开始下一个演示
            setTimeout(() => {
              setCurrentDemoIndex((prev) => (prev + 1) % demoMessages.length)
            }, 3000)
          }, 300)
        }
      }

      animationFrame = requestAnimationFrame(typeText)
    }

    startDemo()
    demoInterval = setInterval(startDemo, ANIMATION_INTERVAL)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(typeTimer)
      clearInterval(demoInterval)
    }
  }, [currentDemoIndex, showDemo])

  return (
    <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden
      shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500
      min-h-[500px] grid grid-rows-[auto_1fr_auto]"
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
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
      <div className="relative p-6 space-y-6 overflow-y-auto">
        {demoText && <MessageBubble content={demoText} type="user" />}
        {aiResponse && <MessageBubble content={aiResponse} type="ai" />}
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
  )
}

export default AIChatDemo
import React, { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

interface Industry {
  name: string
  color: string
  size: number
  x: number
  y: number
}

interface DataFlow {
  id: string
  from: number
  to: number
  duration: number
  delay: number
}

const industries = [
  { name: "互联网/IT", color: "#2D3FDE" },
  { name: "金融/投资", color: "#7B61FF" },
  { name: "教育/培训", color: "#00F5D4" },
  { name: "制造业", color: "#FF6B6B" },
  { name: "零售/商贸", color: "#4ECDC4" },
  { name: "医疗/健康", color: "#45B7D1" },
  { name: "房地产/建筑", color: "#96CEB4" },
  { name: "文化/传媒", color: "#FFEEAD" },
  { name: "政府/机构", color: "#D4A5A5" },
  { name: "其他行业", color: "#9B89B3" }
]

const IndustryBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Industry[]>([])
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [displayMode, setDisplayMode] = useState<'bubbles' | 'dataflow'>('dataflow')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const controls = useAnimation()

  // 初始化气泡位置
  useEffect(() => {
    const containerWidth = 800
    const containerHeight = 400

    const initialBubbles = industries.map((industry, index) => ({
      ...industry,
      size: Math.random() * 30 + 80,
      x: (index % 3) * (containerWidth / 3) + Math.random() * 100 - 50,
      y: Math.floor(index / 3) * (containerHeight / 3) + Math.random() * 100 - 50
    }))
    setBubbles(initialBubbles)
  }, [])

  // 数据流动画
  useEffect(() => {
    if (displayMode !== 'dataflow') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 创建数据流
    const generateDataFlows = () => {
      const flows: DataFlow[] = []
      for (let i = 0; i < industries.length; i++) {
        for (let j = 0; j < 2; j++) {
          flows.push({
            id: `flow-${i}-${j}`,
            from: i,
            to: Math.floor(Math.random() * industries.length),
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 2
          })
        }
      }
      setDataFlows(flows)
    }
    generateDataFlows()

    // 动画循环
    let particles: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      progress: number
      color: string
      speed: number
    }> = []

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制节点
      bubbles.forEach((bubble, index) => {
        const x = (index % 3) * (canvas.width / 3) + canvas.width / 6
        const y = Math.floor(index / 4) * (canvas.height / 3) + canvas.height / 4

        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = bubble.color
        ctx.fill()
        ctx.closePath()

        // 绘制光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30)
        gradient.addColorStop(0, `${bubble.color}40`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()

        // 绘制标签
        ctx.font = '14px Arial'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(bubble.name, x, y + 30)
      })

      // 创建新粒子
      if (Math.random() < 0.3) {
        const fromIndex = Math.floor(Math.random() * bubbles.length)
        const toIndex = Math.floor(Math.random() * bubbles.length)
        if (fromIndex !== toIndex) {
          const fromX = (fromIndex % 3) * (canvas.width / 3) + canvas.width / 6
          const fromY = Math.floor(fromIndex / 4) * (canvas.height / 3) + canvas.height / 4
          const toX = (toIndex % 3) * (canvas.width / 3) + canvas.width / 6
          const toY = Math.floor(toIndex / 4) * (canvas.height / 3) + canvas.height / 4

          particles.push({
            x: fromX,
            y: fromY,
            targetX: toX,
            targetY: toY,
            progress: 0,
            color: bubbles[fromIndex].color,
            speed: Math.random() * 0.02 + 0.01
          })
        }
      }

      // 更新和绘制粒子
      particles = particles.filter(particle => {
        particle.progress += particle.speed

        if (particle.progress >= 1) return false

        const currentX = particle.x + (particle.targetX - particle.x) * particle.progress
        const currentY = particle.y + (particle.targetY - particle.y) * particle.progress

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
        ctx.closePath()

        // 绘制轨迹
        ctx.beginPath()
        ctx.strokeStyle = `${particle.color}40`
        ctx.lineWidth = 2
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()
        ctx.closePath()

        return true
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [displayMode, bubbles])

  // 原有的气泡动画
  const bubbleAnimation = {
    float: {
      y: [-10, 10],
      x: [-5, 5],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.2,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* 数据流画布 */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500
          ${displayMode === 'dataflow' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* 原有气泡效果 */}
      <div className={`absolute inset-0 transition-opacity duration-500
        ${displayMode === 'bubbles' ? 'opacity-100' : 'opacity-0'}`}>
        {bubbles.map((bubble, index) => (
          <motion.div
            key={bubble.name}
            className="absolute flex items-center justify-center rounded-full cursor-pointer
              shadow-lg backdrop-blur-sm"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              top: bubble.y,
              backgroundColor: `${bubble.color}30`,
              border: `2px solid ${bubble.color}`,
              boxShadow: `0 0 20px ${bubble.color}20`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...bubbleAnimation.float,
              transition: {
                delay: index * 0.2
              }
            }}
            whileHover="hover"
            variants={bubbleAnimation}
          >
            <span className="text-sm md:text-base font-medium text-white text-center px-2
              text-shadow-sm shadow-black">
              {bubble.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 切换按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${displayMode === 'dataflow' 
              ? 'bg-white text-primary-dark' 
              : 'bg-white/20 text-white'}`}
          onClick={() => setDisplayMode('dataflow')}
        >
          数据流
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${displayMode === 'bubbles' 
              ? 'bg-white text-primary-dark' 
              : 'bg-white/20 text-white'}`}
          onClick={() => setDisplayMode('bubbles')}
        >
          气泡图
        </button>
      </div>
    </div>
  )
}

export default IndustryBubbles
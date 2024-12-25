import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Industry {
  name: string
  color: string
  size: number
  x: number
  y: number
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

  useEffect(() => {
    // 初始化气泡位置
    const initialBubbles = industries.map((industry, index) => ({
      ...industry,
      size: Math.random() * 40 + 60, // 60-100px
      x: Math.random() * window.innerWidth * 0.8,
      y: Math.random() * window.innerHeight * 0.8
    }))
    setBubbles(initialBubbles)
  }, [])

  const bubbleAnimation = {
    float: {
      y: [-20, 20],
      transition: {
        duration: 3,
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
      {bubbles.map((bubble, index) => (
        <motion.div
          key={bubble.name}
          className="absolute flex items-center justify-center rounded-full cursor-pointer"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.x,
            top: bubble.y,
            backgroundColor: `${bubble.color}20`,
            border: `2px solid ${bubble.color}`,
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
          <span className="text-sm font-medium text-white text-center px-2">
            {bubble.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

export default IndustryBubbles
import React from "react"
import { motion } from "framer-motion"
import { Card } from "@nextui-org/react"

const stats = [
  { number: "1000+", label: "企业客户" },
  { number: "100万+", label: "生成单据" },
  { number: "98%", label: "准确率" },
  { number: "75%", label: "效率提升" },
]

const Stats: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <motion.div
                className="p-6 text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Stats
```

添加一个 Benefits 组件来展示产品优势：

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/landing/Benefits.tsx">
import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const benefits = [
  {
    icon: "mdi:shield-check",
    title: "智能防错",
    description: "AI 智能识别异常数据，降低人工错误率"
  },
  {
    icon: "mdi:clock-fast",
    title: "效率提升",
    description: "自动生成单据和报表，节省 75% 工作时间"
  },
  {
    icon: "mdi:chart-box",
    title: "数据洞察",
    description: "智能分析经营数据，提供决策建议"
  },
  {
    icon: "mdi:cloud-sync",
    title: "实时同步",
    description: "数据实时更新，随时随地查看经营状况"
  }
]

const Benefits: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-primary-dark/50 to-primary-dark">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            为什么选择沙塔 AI
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            智能化解决方案，让企业管理更简单
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <CardBody className="text-center p-6">
                  <Icon
                    icon={benefit.icon}
                    className="text-4xl text-white mb-4 mx-auto"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80">{benefit.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Benefits
```

更新 LandingPage 组件以包含新添加的组件：

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front/src/pages/LandingPage.tsx">
import React, { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Navbar from "@/components/landing/Navbar"
import Stats from "@/components/landing/Stats"
import Benefits from "@/components/landing/Benefits"
import AnimatedBackground from "@/components/landing/AnimatedBackground"

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    })
  }, [controls])

  const handleGetStarted = () => {
    navigate("/we-chat-login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary-light relative">
      <AnimatedBackground />
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        className="relative"
      >
        <Hero onGetStarted={handleGetStarted} />
        <Stats />
        <Features />
        <Benefits />
      </motion.div>
    </div>
  )
}

export default LandingPage
import React from "react"
import { Link } from "@nextui-org/react"
import { motion } from "framer-motion"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark/90 backdrop-blur-lg py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <img src="/assets/logo.png" alt="ShaTa AI" className="h-8 w-auto" />
            <p className="text-white/70">
              智能企业服务专家，让企业管理更简单
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">产品</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  智能单据
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  数据分析
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  报表生成
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">关于我们</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  公司介绍
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white">
                  加入我们
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">联系方式</h3>
            <ul className="space-y-2">
              <li className="text-white/70">
                邮箱：contact@shata-ai.com
              </li>
              <li className="text-white/70">
                电话：400-XXX-XXXX
              </li>
              <li className="text-white/70">
                地址：深圳市南山区科技园
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm">
              © {currentYear} 沙塔科技. 保留所有权利.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-white/70 hover:text-white text-sm">
                隐私政策
              </Link>
              <Link href="#" className="text-white/70 hover:text-white text-sm">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
```

添加联系部分组件：

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/landing/Contact.tsx">
import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const Contact: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardBody className="text-center p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                开始使用 沙塔 AI
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                立即体验智能化企业管理，提升效率，降低成本
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary-dark hover:bg-white/90 font-medium px-8"
                  startContent={<Icon icon="mdi:rocket-launch" />}
                >
                  免费试用
                </Button>
                <Button
                  size="lg"
                  variant="bordered"
                  className="text-white border-white hover:bg-white/10 font-medium px-8"
                  startContent={<Icon icon="mdi:headphones" />}
                >
                  联系销售
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
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
import Contact from "@/components/landing/Contact"
import Footer from "@/components/landing/Footer"
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
        <Contact />
        <Footer />
      </motion.div>
    </div>
  )
}

export default LandingPage
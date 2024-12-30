import React, { useEffect, Suspense } from "react"
import { motion, useAnimation } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import Hero from "@/pages/landing/Hero"
import Footer from "@/pages/landing/Footer"
import ScrollProgress from "@/pages/landing/ScrollProgress"
import PricingSection from "@/pages/landing/PricingSection"

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    })
  }, [controls])

  const handleGetStarted = () => {
    navigate("/login")
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary-dark to-primary-light relative'>
      <Helmet>
        <title>即想智能 - 将你的创意转化为现实代码</title>
        <meta name='description' content='让 AI 为企业赋能，提升效率，降低成本，1分钟部署，5分钟开发，10分钟上线' />
        <meta name='keywords' content='AI,企业服务,效率提升,智能化,沙塔,快速部署,企业管理系统' />
        <meta property='og:title' content='即想智能 - 将你的创意转化为现实代码' />
        <meta
          property='og:description'
          content='让 AI 为企业赋能，提升效率，降低成本，1分钟部署，5分钟开发，10分钟上线'
        />
        <meta property='og:type' content='website' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Helmet>

      <ScrollProgress />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={controls} className='relative'>
        <Hero onGetStarted={handleGetStarted} />
        <PricingSection />
        <Footer />
      </motion.div>
    </div>
  )
}

export default LandingPage

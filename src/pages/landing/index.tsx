import React, { useEffect, Suspense } from "react"
import { motion, useAnimation } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import Hero from "@/pages/landing/Hero"
import Footer from "@/pages/landing/Footer"
import AnimatedBackground from "@/pages/landing/AnimatedBackground"
import ScrollProgress from "@/pages/landing/ScrollProgress"

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
    navigate("/we-chat-login")
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary-dark to-primary-light relative'>
      <Helmet>
        <title>沙塔智能 - 智慧企业服务专家</title>
        <meta name='description' content='让 AI 为企业赋能，提升效率，降低成本' />
        <meta name='keywords' content='AI,企业服务,效率提升,智能化,沙塔' />
        <meta property='og:title' content='沙塔智能 - 智慧企业服务专家' />
        <meta property='og:description' content='让 AI 为企业赋能，提升效率，降低成本' />
        <meta property='og:type' content='website' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Helmet>

      <AnimatedBackground />
      <ScrollProgress />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={controls} className='relative'>
        <Hero onGetStarted={handleGetStarted} />
        <Footer />
      </motion.div>
    </div>
  )
}

export default LandingPage

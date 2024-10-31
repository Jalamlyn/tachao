import React, { useEffect, Suspense } from "react"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import Hero from "@/components/landing/Hero"
import Stats from "@/components/landing/Stats"
import Contact from "@/components/landing/Contact"
import Footer from "@/components/landing/Footer"
import AnimatedBackground from "@/components/landing/AnimatedBackground"
import ScrollProgress from "@/components/landing/ScrollProgress"
import ScrollNav from "@/components/landing/ScrollNav"

// 懒加载组件
const Features = React.lazy(() => import("@/components/landing/Features"))
const Benefits = React.lazy(() => import("@/components/landing/Benefits"))

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
        <title>沙塔 AI - 智慧企业服务专家</title>
        <meta name="description" content="让 AI 为企业赋能，提升效率，降低成本" />
        <meta name="keywords" content="AI,企业服务,效率提升,智能化,沙塔" />
        <meta property="og:title" content="沙塔 AI - 智慧企业服务专家" />
        <meta property="og:description" content="让 AI 为企业赋能，提升效率，降低成本" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <AnimatedBackground />
      <ScrollProgress />
      <ScrollNav />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={controls} 
        className='relative'
      >
        <section id="hero">
          <Hero onGetStarted={handleGetStarted} />
        </section>
        <section id="stats">
          <Stats />
        </section>
        
        <Suspense fallback={
          <div className="w-full h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
          </div>
        }>
          <section id="features">
            <Features />
          </section>
          <section id="benefits">
            <Benefits />
          </section>
        </Suspense>

        <section id="contact">
          <Contact />
        </section>
        <Footer />
      </motion.div>
    </div>
  )
}

export default LandingPage
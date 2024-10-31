import React, { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Navbar from "@/components/landing/Navbar"

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
    <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary-light">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        className="container mx-auto px-4"
      >
        <Hero onGetStarted={handleGetStarted} />
        <Features />
      </motion.div>
    </div>
  )
}

export default LandingPage
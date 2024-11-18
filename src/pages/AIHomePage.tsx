import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader } from "@nextui-org/react"
import { Outlet } from "react-router-dom"
import AnimatedBackground from "@/pages/landing/AnimatedBackground"

const AIHomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light p-2'>
      <Outlet />
    </div>
  )
}

export default AIHomePage

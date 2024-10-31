import React from "react"
import { motion } from "framer-motion"

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-light to-accent opacity-20"
      />
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent" />
    </div>
  )
}

export default AnimatedBackground
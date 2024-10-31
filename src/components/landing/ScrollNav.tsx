import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const sections = [
  { id: "hero", label: "首页" },
  { id: "features", label: "功能" },
  { id: "benefits", label: "优势" },
  { id: "contact", label: "联系" }
]

const ScrollNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40"
    >
      <div className="flex flex-col items-center space-y-4">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group relative flex items-center"
          >
            <span className="hidden group-hover:block absolute right-full mr-2 text-white text-sm whitespace-nowrap bg-primary-dark/80 px-2 py-1 rounded">
              {label}
            </span>
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === id
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </motion.nav>
  )
}

export default ScrollNav
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
    // 创建一个 Map 来存储每个部分的可见性状态
    const visibilityMap = new Map()
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 更新可见性 Map
          visibilityMap.set(entry.target.id, {
            visible: entry.isIntersecting,
            ratio: entry.intersectionRatio
          })

          // 找到当前最大可见比例的部分
          let maxRatio = 0
          let mostVisibleSection = activeSection

          visibilityMap.forEach((value, key) => {
            if (value.visible && value.ratio > maxRatio) {
              maxRatio = value.ratio
              mostVisibleSection = key
            }
          })

          // 只有当最可见部分改变时才更新状态
          if (mostVisibleSection !== activeSection) {
            setActiveSection(mostVisibleSection)
          }
        })
      },
      { 
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: "-20% 0px -20% 0px" // 调整观察区域
      }
    )

    // 监听所有部分
    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      } else {
        console.warn(`Section with id "${id}" not found`)
      }
    })

    // 添加滚动事件监听器作为备份
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3

      // 找到当前滚动位置最接近的部分
      let closestSection = sections[0].id
      let minDistance = Infinity

      sections.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          const distance = Math.abs(element.getBoundingClientRect().top + window.scrollY - scrollPosition)
          if (distance < minDistance) {
            minDistance = distance
            closestSection = id
          }
        }
      })

      setActiveSection(closestSection)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [activeSection])

  const scrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // 获取导航栏高度（如果有的话）
      const navHeight = document.querySelector('nav')?.offsetHeight || 0
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - navHeight - 20 // 添加一些额外的偏移量

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })

      // 添加点击反馈
      const button = document.querySelector(`button[data-section="${sectionId}"]`)
      if (button) {
        button.classList.add('scale-125')
        setTimeout(() => button.classList.remove('scale-125'), 200)
      }
    } else {
      console.warn(`Section with id "${sectionId}" not found`)
    }
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
            data-section={id}
            onClick={() => scrollTo(id)}
            className="group relative flex items-center transition-transform duration-200"
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
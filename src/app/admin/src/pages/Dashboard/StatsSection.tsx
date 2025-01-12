import React, { useEffect, useState } from "react"
import { Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"

const StatsSection = ({ stats, appsCount }) => {
  if (appsCount === 0) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      >
        {[
          {
            title: "配置基本信息",
            icon: "solar:settings-linear",
            description: "设置应用名称、图标等基本信息",
          },
          {
            title: "AI助手对话",
            icon: "solar:chat-round-dots-linear",
            description: "与AI助手交流，快速实现功能需求",
          },
          {
            title: "发布使用",
            icon: "solar:rocket-linear",
            description: "完成开发后即可发布应用，开始使用",
          },
        ].map((step, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                },
              },
            }}
          >
            <Card className='hover:shadow-lg t-all duration-300 border-2 border-transparent hover:border-primary/20'>
              <CardBody className='flex flex-col gap-4 p-6'>
                <div className='p-3 rounded-lg bg-primary/10 w-fit'>
                  <Icon icon={step.icon} className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <p className='text-lg font-semibold'>
                    {index + 1}. {step.title}
                  </p>
                  <p className='text-sm text-default-500'>{step.description}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
      initial='hidden'
      animate='visible'
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
              },
            },
          }}
        >
          <Card className='hover:shadow-lg t-all duration-300'>
            <CardBody className='flex flex-row items-center gap-4 p-6'>
              <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                <Icon icon={stat.icon} className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className='flex-1'>
                <p className='text-sm text-default-500'>{stat.label}</p>
                <div className='flex items-center gap-2'>
                  <p className='text-2xl font-semibold'>{stat.value}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default StatsSection
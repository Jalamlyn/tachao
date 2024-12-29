import React, { useState } from "react"
import { Card, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, useAnimation, useInView } from "framer-motion"
import QRCodeModal from "./QRCodeModal"
import WaitListModal from "./WaitListModal"

const SUBSCRIPTION_PLANS = {
  free: {
    type: "free",
    name: "免费版",
    price: "永久免费",
    period: "",
    description: "适合初创团队和个人使用",
    features: [
      {
        text: "1个管理员账号",
        icon: "solar:user-id-bold-duotone",
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone",
        highlight: true,
      },
      {
        text: "基础管理功能",
        icon: "solar:widget-bold-duotone",
      },
      {
        text: "基础数据分析",
        icon: "solar:chart-bold-duotone",
      },
      {
        text: "社区支持",
        icon: "solar:chat-square-like-bold-duotone",
      },
      {
        text: "不含AI功能",
        icon: "solar:forbidden-circle-bold-duotone",
        isLimited: true,
      },
    ],
    highlight: false,
    color: "default",
  },
  personal: {
    type: "personal",
    name: "个人版",
    price: 19.9,
    period: "月",
    description: "适合个人或小型团队使用",
    features: [
      {
        text: "1个管理员账号",
        icon: "solar:user-id-bold-duotone",
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone",
      },
      {
        text: "10个塔币/月",
        icon: "solar:dollar-minimalistic-bold-duotone",
      },
      {
        text: "基础AI功能",
        icon: "iconamoon:lightning-2-fill",
      },
    ],
    highlight: false,
    color: "default",
  },
  enterprise: {
    type: "enterprise",
    name: "企业版",
    price: 199,
    period: "月",
    description: "适合中小型企业使用",
    features: [
      {
        text: "1个管理员账号",
        icon: "solar:user-id-bold-duotone",
      },
      {
        text: "4个内部账号",
        icon: "solar:users-group-rounded-bold-duotone",
        highlight: true,
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone",
      },
      {
        text: "100个塔币/月",
        icon: "solar:dollar-minimalistic-bold-duotone",
        highlight: true,
      },
      {
        text: "完整AI功能",
        icon: "iconamoon:lightning-2-fill",
      },
      {
        text: "优先技术支持",
        icon: "solar:shield-user-bold-duotone",
      },
    ],
    highlight: true,
    color: "primary",
  },
  custom: {
    type: "custom",
    name: "定制版",
    price: "联系销售",
    period: "",
    description: "适合大型企业使用",
    features: [
      {
        text: "无限内部账号",
        icon: "solar:users-group-rounded-bold-duotone",
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone",
      },
      {
        text: "自定义塔币数量",
        icon: "solar:dollar-minimalistic-bold-duotone",
      },
      {
        text: "专属AI模型",
        icon: "iconamoon:lightning-2-fill",
      },
      {
        text: "专属技术支持",
        icon: "solar:shield-user-bold-duotone",
      },
      {
        text: "定制化开发",
        icon: "solar:code-square-bold-duotone",
      },
    ],
    highlight: false,
    color: "secondary",
  },
}

const PricingSection = () => {
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isWaitListOpen, setIsWaitListOpen] = useState(false)

  const handleButtonClick = (planType: string) => {
    if (planType === "custom") {
      setIsQRCodeOpen(true)
    } else if (planType === "free") {
      window.open("https://app.shata.ai/register", "_blank")
    } else {
      setIsWaitListOpen(true)
    }
  }

  // 新增的动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
      },
    },
  }

  return (
    <section className='py-20 bg-gradient-to-b from-white to-default-50'>
      <div className='mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>简单透明的价格体系</h2>
          <p className='text-xl text-default-600'>选择最适合您企业的方案</p>
        </motion.div>

        <motion.div
          className='grid md:grid-cols-4 gap-8 max-w-7xl mx-auto'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`flex ${plan.highlight ? "md:-translate-y-2" : ""}`}
              style={{
                willChange: "transform, opacity",
              }}
            >
              <Card
                className={`relative flex flex-col w-full transition-all duration-300 hover:shadow-xl
                  ${plan.highlight ? "border-primary shadow-lg" : "shadow-md"}
                  hover:scale-[1.02] hover:border-primary/50
                `}
              >
                <motion.div
                  className='flex flex-col flex-1 p-6'
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className='mb-6'>
                    <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
                    <div className='mb-4'>
                      <span className='text-3xl font-bold'>
                        {typeof plan.price === "number" ? `￥${plan.price}` : plan.price}
                      </span>
                      {plan.period && <span className='text-default-500'>/{plan.period}</span>}
                    </div>
                    <p className='text-default-600'>{plan.description}</p>
                  </div>

                  <div className='flex-grow'>
                    <motion.div className='space-y-4'>
                      {plan.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          variants={featureVariants}
                          className={`flex items-center gap-3 ${feature.highlight ? "text-primary font-medium" : ""} 
                            ${feature.isLimited ? "text-default-400" : ""}`}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Icon
                            icon={feature.icon}
                            className={`w-5 h-5 ${feature.highlight ? "text-primary" : "text-default-500"}
                              ${feature.isLimited ? "text-default-400" : ""}`}
                          />
                          <span>{feature.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <div className='mt-8'>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        color={plan.color}
                        variant={plan.highlight ? "shadow" : "flat"}
                        className='w-full transition-transform duration-200 hover:scale-105'
                        size='lg'
                        onPress={() => handleButtonClick(plan.type)}
                      >
                        {plan.type === "free" ? "立即注册" : "申请专属账号"}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-12 text-center'
        >
          <motion.div
            className='inline-block p-4 bg-default-50 rounded-lg'
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <p className='text-default-600'>
              所有方案均包含:
              <span className='font-medium mx-2'>免费技术支持</span>•<span className='font-medium mx-2'>安全保障</span>•
              <span className='font-medium mx-2'>定期更新</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
      <WaitListModal isOpen={isWaitListOpen} onClose={() => setIsWaitListOpen(false)} />
    </section>
  )
}

export default PricingSection

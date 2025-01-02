import React, { useState } from "react"
import { Card, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
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
      { text: "1个管理员账号", icon: "solar:user-id-bold-duotone" },
      { text: "不限数量外部账号", icon: "solar:users-group-rounded-bold-duotone", highlight: true },
      { text: "基础管理功能", icon: "solar:widget-bold-duotone" },
      { text: "基础数据分析", icon: "solar:chart-bold-duotone" },
      { text: "社区支持", icon: "solar:chat-square-like-bold-duotone" },
      { text: "不含AI功能", icon: "solar:forbidden-circle-bold-duotone", isLimited: true },
    ],
  },
  personal: {
    type: "personal",
    name: "个人版",
    price: 19.9,
    period: "月",
    description: "适合个人或小型团队使用",
    features: [
      { text: "1个管理员账号", icon: "solar:user-id-bold-duotone" },
      { text: "不限数量外部账号", icon: "solar:users-group-rounded-bold-duotone" },
      { text: "10个塔币/月", icon: "solar:dollar-minimalistic-bold-duotone" },
      { text: "基础AI功能", icon: "iconamoon:lightning-2-fill" },
    ],
  },
  enterprise: {
    type: "enterprise",
    name: "企业版",
    price: 199,
    period: "月",
    description: "适合中小型企业使用",
    features: [
      { text: "1个管理员账号", icon: "solar:user-id-bold-duotone" },
      { text: "4个内部账号", icon: "solar:users-group-rounded-bold-duotone", highlight: true },
      { text: "不限数量外部账号", icon: "solar:users-group-rounded-bold-duotone" },
      { text: "100个塔币/月", icon: "solar:dollar-minimalistic-bold-duotone", highlight: true },
      { text: "完整AI功能", icon: "iconamoon:lightning-2-fill" },
      { text: "优先技术支持", icon: "solar:shield-user-bold-duotone" },
    ],
    highlight: true,
  },
  custom: {
    type: "custom",
    name: "定制版",
    price: "联系销售",
    period: "",
    description: "适合大型企业使用",
    features: [
      { text: "无限内部账号", icon: "solar:users-group-rounded-bold-duotone" },
      { text: "不限数量外部账号", icon: "solar:users-group-rounded-bold-duotone" },
      { text: "自定义塔币数量", icon: "solar:dollar-minimalistic-bold-duotone" },
      { text: "专属AI模型", icon: "iconamoon:lightning-2-fill" },
      { text: "专属技术支持", icon: "solar:shield-user-bold-duotone" },
      { text: "定制化开发", icon: "solar:code-square-bold-duotone" },
    ],
  },
}

const PricingSection = () => {
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isWaitListOpen, setIsWaitListOpen] = useState(false)

  const handleButtonClick = (planType: string) => {
    if (planType === "custom") {
      setIsQRCodeOpen(true)
    } else {
      setIsWaitListOpen(true)
    }
  }

  return (
    <section className='py-20 bg-gradient-to-b from-[#19073B] to-[#2D1B69]'>
      <div className='mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 mb-4'>
            简单透明的价格体系
          </h2>
          <p className='text-xl text-white/80'>选择最适合您企业的方案</p>
        </motion.div>

        <div className='grid md:grid-cols-4 gap-8 max-w-7xl mx-auto'>
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='h-full'
            >
              <Card
                className={`h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 
                  ${plan.highlight ? "border-purple-500/50" : ""}
                  transition-all duration-300 hover:transform hover:scale-105`}
              >
                <div className='p-6 h-full flex flex-col'>
                  <div className='mb-6'>
                    <h3 className='text-2xl font-bold text-white mb-2'>{plan.name}</h3>
                    <div className='mb-4'>
                      <span className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'>
                        {typeof plan.price === "number" ? `￥${plan.price}` : plan.price}
                      </span>
                      {plan.period && <span className='text-white/60'>/{plan.period}</span>}
                    </div>
                    <p className='text-white/60'>{plan.description}</p>
                  </div>

                  <div className='flex-1 space-y-4 mb-6'>
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 
                          ${feature.highlight ? "text-cyan-400" : "text-white/80"}
                          ${feature.isLimited ? "text-white/40" : ""}`}
                      >
                        <Icon icon={feature.icon} className='w-5 h-5 flex-shrink-0' />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full h-12 mt-auto ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleButtonClick(plan.type)}
                  >
                    申请专属账号
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} />
      <WaitListModal isOpen={isWaitListOpen} onClose={() => setIsWaitListOpen(false)} />
    </section>
  )
}

export default PricingSection

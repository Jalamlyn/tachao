import React from "react"
import { Card, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

const SUBSCRIPTION_PLANS = {
  personal: {
    type: "personal",
    name: "个人版",
    price: 19.9,
    period: "月",
    description: "适合个人或小型团队使用",
    features: [
      {
        text: "1个管理员账号",
        icon: "solar:user-id-bold-duotone"
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone"
      },
      {
        text: "10个塔币",
        icon: "solar:dollar-minimalistic-bold-duotone"
      },
      {
        text: "基础AI功能",
        icon: "solar:robot-bold-duotone"
      }
    ],
    highlight: false,
    color: "default"
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
        icon: "solar:user-id-bold-duotone"
      },
      {
        text: "4个内部账号",
        icon: "solar:users-group-rounded-bold-duotone",
        highlight: true
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone"
      },
      {
        text: "100个塔币",
        icon: "solar:dollar-minimalistic-bold-duotone",
        highlight: true
      },
      {
        text: "完整AI功能",
        icon: "solar:robot-bold-duotone"
      },
      {
        text: "优先技术支持",
        icon: "solar:shield-user-bold-duotone"
      }
    ],
    highlight: true,
    color: "primary"
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
        icon: "solar:users-group-rounded-bold-duotone"
      },
      {
        text: "不限数量外部账号",
        icon: "solar:users-group-rounded-bold-duotone"
      },
      {
        text: "自定义塔币数量",
        icon: "solar:dollar-minimalistic-bold-duotone"
      },
      {
        text: "专属AI模型",
        icon: "solar:robot-bold-duotone"
      },
      {
        text: "专属技术支持",
        icon: "solar:shield-user-bold-duotone"
      },
      {
        text: "定制化开发",
        icon: "solar:code-square-bold-duotone"
      }
    ],
    highlight: false,
    color: "secondary"
  }
}

const PricingSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-default-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            简单透明的价格体系
          </h2>
          <p className="text-xl text-default-600">
            选择最适合您企业的方案
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full ${
                  plan.highlight ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Chip color="primary" variant="shadow">
                      推荐方案
                    </Chip>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {typeof plan.price === 'number' ? `￥${plan.price}` : plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-default-500">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-default-600 mb-6">{plan.description}</p>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3"
                      >
                        <Icon 
                          icon={feature.icon}
                          className={`w-5 h-5 ${
                            feature.highlight ? 'text-primary' : 'text-default-500'
                          }`}
                        />
                        <span className={feature.highlight ? 'font-medium' : ''}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    color={plan.color}
                    variant={plan.highlight ? 'shadow' : 'flat'}
                    className="w-full mt-8"
                    size="lg"
                    onPress={() => {
                      if (plan.name === '定制版') {
                        // 打开联系销售的二维码
                      } else {
                        // 跳转到注册/登录
                        window.location.href = '/login'
                      }
                    }}
                  >
                    {plan.name === '定制版' ? '联系销售' : '立即开始'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block p-4 bg-default-50 rounded-lg">
            <p className="text-default-600">
              所有方案均包含:
              <span className="font-medium mx-2">免费技术支持</span>•
              <span className="font-medium mx-2">安全保障</span>•
              <span className="font-medium mx-2">定期更新</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection
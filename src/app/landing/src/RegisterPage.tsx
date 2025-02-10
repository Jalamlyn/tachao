import React, { useState } from "react"
import { Card, CardBody, Button, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { createEnterPrise } from "@/service/apis/api"
import { message } from "@/components/Message"
import { PhoneVerification } from "@/components/PhoneVerification"

const RegisterPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [enterpriseName, setEnterpriseName] = useState("")
  const navigate = useNavigate()

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleRegister = async (phone: string) => {
    if (!enterpriseName.trim()) {
      return message.error("请输入企业名称")
    }

    setRegisterLoading(true)
    try {
      const data = {
        name: enterpriseName.trim(),
        phone,
        password: phone, // 使用手机号作为默认密码
        description: enterpriseName.trim(),
        organizationCode: enterpriseName.trim(),
      }

      const res = await createEnterPrise(data)
      if (res) {
        message.success("注册成功!请尽快修改默认密码")
        navigate("/login")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      message.error("注册失败,请重试")
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]'>
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />
      <div className='container mx-auto px-4 min-h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md'
        >
          {/* 页面标题和说明 */}
          <div className="text-center mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              企业注册
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/70"
            >
              注册即想智能账号,开启AI驱动的企业管理之旅
            </motion.p>
          </div>

          <Card className='bg-white/20 border bg-white border-white/30 shadow-2xl backdrop-blur-sm'>
            <CardBody className='gap-4 p-8'>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='space-y-6'
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">开始使用</h2>
                  <p className="text-sm text-white/70">
                    填写以下信息完成注册,注册后即可使用全部功能
                  </p>
                </div>
              </motion.div>

              <form className='flex flex-col gap-4 mt-4' onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1">
                  <Input
                    isRequired
                    label='企业名称'
                    placeholder='请输入企业名称'
                    value={enterpriseName}
                    onChange={(e) => setEnterpriseName(e.target.value)}
                    variant='bordered'
                    description="请输入营业执照上的企业全称"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                      description: "text-white/60"
                    }}
                    startContent={
                      <Icon icon="solar:buildings-bold-duotone" className="text-white/50" />
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white/70 mb-2">
                    手机号验证
                    <span className="text-xs ml-2 text-white/50">
                      (将作为管理员账号使用)
                    </span>
                  </p>
                  <PhoneVerification
                    onSuccess={handleRegister}
                    onError={(error) => {
                      console.error("Phone verification failed:", error)
                      message.error("手机号验证失败,请重试")
                    }}
                    buttonText="注册"
                    loading={registerLoading}
                  />
                </div>

                <div className='flex justify-between items-center mt-4'>
                  <Button
                    variant='light'
                    onClick={() => navigate("/login")}
                    className='text-white'
                    startContent={<Icon icon="solar:arrow-left-line-duotone" />}
                  >
                    返回登录
                  </Button>
                  <Button
                    variant='light'
                    onClick={() => navigate("/")}
                    className='text-white'
                    startContent={<Icon icon="solar:home-angle-line-duotone" />}
                  >
                    返回首页
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-white/50">
                    注册即表示同意
                    <Button 
                      variant="light" 
                      className="text-xs text-white/70 hover:text-white"
                      size="sm"
                    >
                      服务条款
                    </Button>
                    和
                    <Button
                      variant="light"
                      className="text-xs text-white/70 hover:text-white"
                      size="sm"
                    >
                      隐私政策
                    </Button>
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
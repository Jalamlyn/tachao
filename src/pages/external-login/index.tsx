import React, { useState, useRef } from "react"
import { Card, CardBody, Input, Button, Link } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { login } from "@/service/apis/api"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { getPhoneOrgMapping } from "@/service/apis/metadata"
import AccountRequest from "./AccountRequest"
import EnterpriseList from "@/components/EnterpriseList"

export default function ExternalLoginPage() {
  const { t } = useTranslation()
  const [phone, setPhone] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const navigate = useNavigate()

  const loginData = useRef({
    organizationId: "",
    enterpriseName: "",
  })

  const handleLogin = async () => {
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      return message.error(t("phone_required"))
    }

    if (!loginData.current.organizationId) {
      return message.error("请选择企业")
    }

    setLoginLoading(true)
    try {
      // 优先使用选择的组织ID
      const organizationId = loginData.current.organizationId

      // 使用手机号登录
      const res = await login({
        account: trimmedPhone,
        password: trimmedPhone,
        organizationId
      })

      if (res === "has token") {
        const callback = new URL(location.href).searchParams.get("callback")
        if (callback) {
          window.location.href = callback
        } else {
          window.location.href = "/we-chat-app/admin"
        }
      } else {
        message.error(t("login_failed"))
      }
    } catch (error) {
      console.error(t("login_error_log"), error)
      message.error(t("login_error"))
    } finally {
      setLoginLoading(false)
    }
  }

  if (showRequest) {
    return <AccountRequest onBack={() => setShowRequest(false)} />
  }

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light'>
      <div className='container mx-auto px-4 min-h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md'
        >
          <Card className='bg-white/20 border bg-white border-white/30 shadow-2xl'>
            <CardBody className='gap-4 p-8'>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='text-center'
              >
                <h2 className='text-2xl font-bold mb-2 drop-shadow-lg'>欢迎登录</h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className='text-lg mb-6 drop-shadow'
                >
                  沙塔智能, 让天下没有难管的企业
                </motion.p>
              </motion.div>

              <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <EnterpriseList loginData={loginData} />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Input
                    isRequired
                    label={t("phone_number")}
                    placeholder={t("enter_phone_number")}
                    type='tel'
                    variant='bordered'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    classNames={{
                      label: "font-medium",
                    }}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Button
                    color='primary'
                    type='submit'
                    onClick={handleLogin}
                    isLoading={loginLoading}
                    className='w-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl'
                  >
                    {t("login")}
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  <Button
                    variant="light"
                    className="w-full"
                    onClick={() => setShowRequest(true)}
                  >
                    申请账号
                  </Button>
                </motion.div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
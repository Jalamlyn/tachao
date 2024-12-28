import React, { useState, useRef } from "react"
import { Card, CardBody, Input, Button, Link, Image } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { login } from "@/service/apis/api"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import AccountRequest from "./AccountRequest"
import EnterpriseList from "@/components/EnterpriseList"
import { useOid } from "./useOid"
import { LockIcon } from "lucide-react"
import { Icon } from "@iconify/react"

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

  const { hasOidParam } = useOid(loginData)

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
      const organizationId = loginData.current.organizationId

      const res = await login({
        account: `wb_${trimmedPhone}`,
        password: trimmedPhone,
        organizationId,
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
    <div className="min-h-screen relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-100/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-900/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300">
            <CardBody className="gap-6 p-8">
              {/* 品牌区域 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <Icon icon="material-symbols:code" className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                  欢迎使用沙塔智能
                </h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-base text-gray-600 mb-6 drop-shadow"
                >
                  将你的创意转化为现实代码
                </motion.p>
              </motion.div>

              <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {!hasOidParam && <EnterpriseList loginData={loginData} />}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    isRequired
                    label={t("phone_number")}
                    placeholder={t("enter_phone_number")}
                    type="tel"
                    variant="bordered"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    startContent={
                      <Icon icon="material-symbols:phone-android" className="text-gray-400" />
                    }
                    classNames={{
                      label: "font-medium",
                      input: "text-base",
                      inputWrapper: "hover:scale-[1.02] focus:scale-[1.02] transition-all duration-300",
                    }}
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    color="primary"
                    type="submit"
                    onClick={handleLogin}
                    isLoading={loginLoading}
                    className="w-full h-12 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r from-primary-600 to-primary-500"
                  >
                    {t("login")}
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-600 text-center">
                    没有账号？向企业管理员申请开通后即可登录访问
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="bordered"
                      startContent={<Icon icon="material-symbols:person-add-outline" width="20" height="20" />}
                      className="flex-1 text-sm hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                      onClick={() => setShowRequest(true)}
                    >
                      申请账号
                    </Button>
                    <div className="h-6 w-px bg-gray-300/50" />
                    <Button
                      variant="bordered"
                      startContent={<Icon icon="material-symbols:admin-panel-settings" width="20" height="20" />}
                      className="flex-1 text-sm hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                      onClick={() => navigate("/login")}
                    >
                      管理员登录
                    </Button>
                  </div>
                </motion.div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
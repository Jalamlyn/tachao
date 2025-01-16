import React, { useState, useRef, useEffect } from "react"
import { Button, Input, Card, CardBody, Tab, Tabs } from "@nextui-org/react"
import { Checkbox } from "@nextui-org/checkbox"
import { Icon } from "@iconify/react"
import { login } from "@/service/apis/api"
import EnterpriseList from "@/pages/login/EnterpriseList"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { jsonParse, jsonStringify } from "@/utils"
import { motion, AnimatePresence } from "framer-motion"
import AccountRequest from "./AccountRequest"
import { useOid } from "./useOid"
import { PhoneVerification } from "@/components/PhoneVerification"

export default function LoginPage() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("external")
  const [rememberMe, setRememberMe] = useState(false)
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [showRequest, setShowRequest] = useState(false)
  const [sloganVisible, setSloganVisible] = useState(false)

  const loginData = useRef({
    account: "",
    password: "",
    organizationId: "",
    enterpriseName: "",
  })

  const { hasOidParam } = useOid(loginData)

  useEffect(() => {
    const savedLoginData = localStorage.getItem("loginData")
    if (savedLoginData) {
      const parsedData = jsonParse(savedLoginData)
      loginData.current = parsedData
      setAccount(parsedData.account)
      setPassword(parsedData.password)
      setRememberMe(true)
    }

    const timer = setTimeout(() => {
      setSloganVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleExternalLogin = async (phone: string) => {
    if (!loginData.current.organizationId) {
      return message.error(t("organization_required"))
    }

    setLoginLoading(true)
    try {
      const organizationId = loginData.current.organizationId
      const res = await login({
        account: `wb_${phone}`,
        password: phone,
        organizationId,
      })

      if (res === "has token") {
        const callback = new URL(location.href).searchParams.get("callback")
        if (callback) {
          window.location.href = callback
        } else {
          window.location.href = "/admin"
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

  const handleAdminLogin = async () => {
    const trimmedAccount = account.trim()
    const trimmedPassword = password.trim()

    if (!trimmedAccount) {
      return message.error(t("username_required"))
    }

    if (!trimmedPassword) {
      return message.error(t("password_required"))
    }

    if (!loginData.current.organizationId) {
      return message.error(t("organization_id_required"))
    }

    loginData.current.account = trimmedAccount
    loginData.current.password = trimmedPassword

    setLoginLoading(true)

    try {
      const res = await login(loginData.current)
      if (res === "has token") {
        if (rememberMe) {
          localStorage.setItem("loginData", jsonStringify(loginData.current))
        }
        const callback = new URL(location.href).searchParams.get("callback")
        if (callback) {
          window.location.href = callback
        } else {
          window.location.href = "/admin"
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
    <div
      className='min-h-screen relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]
'
    >
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />

      <div className='container mx-auto px-4 min-h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md relative'
        >
          {/* 申请账号按钮 - 右上角 */}
          <Button
            variant='light'
            color='secondary'
            startContent={<Icon icon='material-symbols:person-add-outline' />}
            onClick={() => setShowRequest(true)}
            className='absolute -top-12 right-0 text-sm hover:bg-white/10'
          >
            申请账号
          </Button>

          <Card className='bg-white/20 border bg-white border-white/30 shadow-2xl backdrop-blur-sm'>
            <CardBody className='gap-4 p-8'>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: sloganVisible ? 1 : 0 }}
                transition={{ duration: 1 }}
                className='text-lg drop-shadow'
              >
                <p className='text-left text-3xl font-semibold'>
                  登录
                  <span aria-label='emoji' className='ml-2' role='img'>
                    👋
                  </span>
                </p>
              </motion.p>

              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key.toString())}
                className='mb-4'
                variant='underlined'
                aria-label='登录方式'
              >
                <Tab
                  key='external'
                  title={
                    <div className='flex items-center gap-2'>
                      <span>手机号登录</span>
                    </div>
                  }
                />
                <Tab
                  key='admin'
                  title={
                    <div className='flex items-center gap-2'>
                      <span>账户密码登录</span>
                    </div>
                  }
                />
              </Tabs>

              <AnimatePresence mode='wait'>
                {selectedTab === "external" ? (
                  <motion.form
                    key='external'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className='flex flex-col gap-4'
                    onSubmit={(e) => e.preventDefault()}
                  >
                    {!hasOidParam && <EnterpriseList loginData={loginData} />}
                    <PhoneVerification
                      onSuccess={(phone) => {
                        handleExternalLogin(phone)
                      }}
                      onError={(error) => {
                        console.error("Phone verification failed:", error)
                        message.error("手机号验证失败，请重试")
                      }}
                    />
                  </motion.form>
                ) : (
                  <motion.form
                    key='admin'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className='flex flex-col gap-4'
                    onSubmit={(e) => e.preventDefault()}
                  >
                    {!hasOidParam && <EnterpriseList loginData={loginData} />}
                    <Input
                      isRequired
                      label={t("username")}
                      placeholder={t("enter_your_username")}
                      type='text'
                      variant='bordered'
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      classNames={{
                        label: "font-medium",
                      }}
                    />
                    <Input
                      isRequired
                      endContent={
                        <button type='button' onClick={toggleVisibility} className='focus:outline-none'>
                          {isVisible ? (
                            <Icon className='text-xl transition-colors' icon='solar:eye-closed-linear' />
                          ) : (
                            <Icon className='text-xl transition-colors' icon='solar:eye-bold' />
                          )}
                        </button>
                      }
                      label={t("password")}
                      placeholder={t("enter_your_password")}
                      type={isVisible ? "text" : "password"}
                      variant='bordered'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      classNames={{
                        label: "font-medium",
                      }}
                    />
                    <div className='flex items-center justify-between px-1 py-2'>
                      <Checkbox isSelected={rememberMe} onValueChange={setRememberMe} size='sm'>
                        {t("remember_me")}
                      </Checkbox>
                    </div>
                    <Button
                      color='primary'
                      type='submit'
                      onClick={handleAdminLogin}
                      isLoading={loginLoading}
                      className='w-full t-all duration-300 font-medium shadow-lg hover:shadow-xl'
                    >
                      {t("login")}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
import React, { useState, useRef, useEffect } from "react"
import { Button, Input, Card, CardBody, hiddenInputClasses } from "@nextui-org/react"
import { Checkbox } from "@nextui-org/checkbox"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { login } from "@/service/apis/api"
import EnterpriseList from "@/components/EnterpriseList"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { jsonParse, jsonStringify } from "@/utils"
import { motion } from "framer-motion"

export default function WeChatLoginPage() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("enterprise")
  const [rememberMe, setRememberMe] = useState(false)
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [enterpriseName, setEnterpriseName] = useState("")
  const [sloganVisible, setSloganVisible] = useState(false)

  const loginData = useRef({
    account: "",
    password: "",
    organizationId: 0,
    enterpriseName: "",
  })

  useEffect(() => {
    const savedLoginData = localStorage.getItem("loginData")
    if (savedLoginData) {
      const parsedData = jsonParse(savedLoginData)
      loginData.current = parsedData
      setAccount(parsedData.account)
      setPassword(parsedData.password)
      setEnterpriseName(parsedData.enterpriseName)
      setRememberMe(true)
    }

    const timer = setTimeout(() => {
      setSloganVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleLogin = async () => {
    const trimmedAccount = account.trim()
    const trimmedPassword = password.trim()

    if (!trimmedAccount) {
      return message.error(t("username_required"))
    }

    if (!trimmedPassword) {
      return message.error(t("password_required"))
    }

    if (activeTab === "enterprise" && !loginData.current.organizationId) {
      return message.error(t("organization_id_required"))
    }

    loginData.current.account = trimmedAccount
    loginData.current.password = trimmedPassword

    setLoginLoading(true)

    try {
      const res = await login(loginData.current)
      // const auth = app.auth()

      // 执行 auth.signIn
      // await auth.signIn({
      //   username: `${trimmedAccount}_${trimmedAccount}`,
      //   password: trimmedPassword,
      // })

      if (res === "has token") {
        localStorage.setItem("loginData", jsonStringify(loginData.current))
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "account") {
      setAccount(value)
    } else if (name === "password") {
      setPassword(value)
    }
  }

  const handleRememberMeChange = (isSelected) => {
    setRememberMe(isSelected)
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
                  animate={{ opacity: sloganVisible ? 1 : 0 }}
                  transition={{ duration: 1 }}
                  className='text-lg mb-6 drop-shadow'
                >
                  即想智能, 将你的创意转化为现实代码
                </motion.p>
              </motion.div>

              <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <EnterpriseList loginData={loginData} />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Input
                    isRequired
                    label={t("username")}
                    name='account'
                    placeholder={t("enter_your_username")}
                    type='text'
                    variant='bordered'
                    onChange={handleInputChange}
                    value={account}
                    classNames={{
                      label: "font-medium",
                    }}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
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
                    name='password'
                    placeholder={t("enter_your_password")}
                    type={isVisible ? "text" : "password"}
                    variant='bordered'
                    onChange={handleInputChange}
                    value={password}
                    classNames={{
                      label: "font-medium",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className='flex items-center justify-between px-1 py-2'
                >
                  <Checkbox
                    name='remember'
                    isSelected={rememberMe}
                    onValueChange={handleRememberMeChange}
                    classNames={{
                      hiddenInput: "w-4 h-4",
                    }}
                  >
                    {t("remember_me")}
                  </Checkbox>
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
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

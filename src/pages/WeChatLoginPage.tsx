import React, { useState, useRef, useEffect } from "react"
import {
  Button,
  Input,
  Checkbox,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { login } from "@/service/apis/api"
import EnterpriseList from "@/components/EnterpriseList"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { jsonParse, jsonStringify } from "@/utils"
import { motion } from "framer-motion"
import AnimatedBackground from "@/components/landing/AnimatedBackground"

export default function WeChatLoginPage() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("enterprise")
  const [modalVisible, setModalVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [enterpriseName, setEnterpriseName] = useState("")
  const [sloganVisible, setSloganVisible] = useState(false)

  const navigate = useNavigate()

  const loginData = useRef({
    account: "",
    password: "",
    organizationId: 0,
    enterpriseName: "",
  })

  useEffect(() => {
    const savedLoginData = localStorage.getItem("wechatLoginData")
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

      if (res === "has token") {
        if (rememberMe) {
          localStorage.setItem("wechatLoginData", jsonStringify(loginData.current))
        } else {
          localStorage.removeItem("wechatLoginData")
        }

        const callback = new URL(location.href).searchParams.get("callback")

        if (callback) {
          window.location.href = callback
        } else {
          navigate("/")
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

  const handleForgotPasswordClick = () => {
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleRememberMeChange = (isSelected) => {
    setRememberMe(isSelected)
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light">
      <AnimatedBackground />
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardBody className="gap-4 p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-2">欢迎登录 沙塔 智慧数字系统</h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: sloganVisible ? 1 : 0 }}
                  transition={{ duration: 1 }}
                  className="text-white/80 text-lg mb-6"
                >
                  AI 帮你管单据，工作从未如此轻松
                </motion.p>
              </motion.div>

              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <EnterpriseList loginData={loginData} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    isRequired
                    label={t("username")}
                    name="account"
                    placeholder={t("enter_your_username")}
                    type="text"
                    variant="bordered"
                    onChange={handleInputChange}
                    value={account}
                    classNames={{
                      input: "text-white",
                      label: "text-white",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    isRequired
                    endContent={
                      <button type="button" onClick={toggleVisibility}>
                        {isVisible ? (
                          <Icon className="text-white text-xl" icon="solar:eye-closed-linear" />
                        ) : (
                          <Icon className="text-white text-xl" icon="solar:eye-bold" />
                        )}
                      </button>
                    }
                    label={t("password")}
                    name="password"
                    placeholder={t("enter_your_password")}
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                    onChange={handleInputChange}
                    value={password}
                    classNames={{
                      input: "text-white",
                      label: "text-white",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between px-1 py-2"
                >
                  <Checkbox
                    name="remember"
                    size="sm"
                    isSelected={rememberMe}
                    onValueChange={handleRememberMeChange}
                    classNames={{
                      label: "text-white",
                    }}
                  >
                    {t("remember_me")}
                  </Checkbox>
                  <Link className="text-white" href="#" size="sm" onClick={handleForgotPasswordClick}>
                    {t("forgot_password")}
                  </Link>
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
                    className="w-full bg-white text-primary-dark hover:bg-white/90"
                  >
                    {t("login")}
                  </Button>
                </motion.div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={modalVisible} onClose={handleModalClose}>
        <ModalContent>
          <ModalHeader>{t("forgot_password")}</ModalHeader>
          <ModalBody>
            <p>{t("contact_admin_to_reset_password")}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleModalClose}>
              {t("close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
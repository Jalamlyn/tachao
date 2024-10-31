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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { login } from "@/service/apis/api"
import EnterpriseList from "@/components/EnterpriseList"
import { message } from "@/components/Message"
import { useTranslation } from "react-i18next"
import { jsonParse, jsonStringify } from "@/utils"

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

    // 添加标语动画效果
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
    <div className='flex h-screen w-full items-center justify-center p-2'>
      <div className='flex w-full flex-col gap-4 rounded-large bg-content1 px-4 pb-6 pt-4 shadow-large'>
        <p className='pb-2 text-lg font-medium'>欢迎登录 沙塔 智慧数字系统 </p>
        {/* 新添加的标语 */}
        <div
          className={`text-center text-xl font-bold text-primary transition-opacity duration-1000 ${
            sloganVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          AI 帮你管单据，工作从未如此轻松
        </div>
        <form className='flex flex-col gap-3' onSubmit={(e) => e.preventDefault()}>
          <EnterpriseList loginData={loginData} />
          <Input
            isRequired
            label={t("username")}
            name='account'
            placeholder={t("enter_your_username")}
            type='text'
            variant='bordered'
            onChange={handleInputChange}
            value={account}
          />
          <Input
            isRequired
            endContent={
              <button type='button' onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon className='pointer-events-none text-xl text-default-400' icon='solar:eye-closed-linear' />
                ) : (
                  <Icon className='pointer-events-none text-xl text-default-400' icon='solar:eye-bold' />
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
          />
          <div className='flex items-center justify-between px-1 py-2'>
            <Checkbox name='remember' size='sm' isSelected={rememberMe} onValueChange={handleRememberMeChange}>
              {t("remember_me")}
            </Checkbox>
            <Link className='text-default-500' href='#' size='sm' onClick={handleForgotPasswordClick}>
              {t("forgot_password")}
            </Link>
          </div>
          <Button color='primary' type='submit' onClick={handleLogin} isLoading={loginLoading}>
            {t("login")}
          </Button>
        </form>
      </div>

      <Modal isOpen={modalVisible} onClose={handleModalClose}>
        <ModalContent>
          <ModalHeader>{t("forgot_password")}</ModalHeader>
          <ModalBody>
            <p>{t("contact_admin_to_reset_password")}</p>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={handleModalClose}>
              {t("close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

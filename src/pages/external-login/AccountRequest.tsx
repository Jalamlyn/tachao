import React, { useState } from "react"
import { Card, CardBody, Input, Button } from "@nextui-org/react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { message } from "@/components/Message"
import EnterpriseList from "@/components/EnterpriseList"
import { smsCaptcha, submitWaitList } from "@/service/apis/api"
import { v4 as uuidv4 } from "uuid"

interface AccountRequestProps {
  onBack: () => void
}

export default function AccountRequest({ onBack }: AccountRequestProps) {
  const { t } = useTranslation()
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [smsCooldown, setSmsCooldown] = useState(0)
  const [showQRCode, setShowQRCode] = useState(false)

  const loginData = React.useRef({
    organizationId: "",
    enterpriseName: "",
  })

  const handleSendSms = async () => {
    if (!phone.trim()) {
      return message.error(t("phone_required"))
    }

    try {
      setIsLoading(true)
      await smsCaptcha(phone.trim())

      message.success("验证码已发送")
      setSmsCooldown(60)
      const interval = setInterval(() => {
        setSmsCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Failed to send SMS:", error)
      message.error("发送验证码失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!phone.trim()) {
      return message.error(t("phone_required"))
    }
    if (!smsCode.trim()) {
      return message.error(t("sms_code_required"))
    }
    if (!loginData.current.organizationId) {
      return message.error(t("organization_required"))
    }

    setIsLoading(true)
    try {
      // 提交到等待列表
      await submitWaitList({
        phone: phone.trim(),
        email: "info@mobenai.com.cn",
        developer: false,
        industry: "模本科技",
        purpose: `{
        "status":"pending",
        "type":"account_request",
        "organizationId":"${loginData.current.organizationId}"
        }`,
      })

      setShowQRCode(true)
    } catch (error) {
      console.error("Failed to submit request:", error)
      message.error("提交申请失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  if (showQRCode) {
    return (
      <div className='min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light'>
        <div className='container mx-auto px-4 min-h-screen flex items-center justify-center'>
          <Card className='bg-white/20 border bg-white border-white/30 shadow-2xl'>
            <CardBody className='gap-4 p-8 text-center'>
              <h2 className='text-2xl font-bold mb-4'>申请已提交</h2>
              <p className='mb-4'>请关注公众号，等待审核通知</p>
              <div className='w-48 h-48 mx-auto bg-gray-200 rounded-lg mb-4'>
                <div className='w-full h-full flex items-center justify-center'>
                  <span>二维码占位</span>
                </div>
              </div>
              <Button color='primary' onClick={onBack}>
                返回登录
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
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
                <h2 className='text-2xl font-bold mb-2 drop-shadow-lg'>申请账号</h2>
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
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <div className='flex gap-2'>
                    <Input
                      isRequired
                      label={t("verification_code")}
                      placeholder={t("enter_verification_code")}
                      type='text'
                      variant='bordered'
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                    />
                    <Button size='lg' onClick={handleSendSms} disabled={smsCooldown > 0}>
                      {smsCooldown > 0 ? `${smsCooldown}s` : "获取验证码"}
                    </Button>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <div className='flex gap-2'>
                    <Button variant='light' className='flex-1' onClick={onBack}>
                      返回
                    </Button>
                    <Button color='primary' className='flex-1' onClick={handleSubmit} isLoading={isLoading}>
                      提交申请
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

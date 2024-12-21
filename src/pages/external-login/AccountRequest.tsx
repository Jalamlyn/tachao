import React, { useState } from "react"
import { Card, CardBody, Button, Image } from "@nextui-org/react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { message } from "@/components/Message"
import EnterpriseList from "@/components/EnterpriseList"
import { submitWaitList } from "@/service/apis/api"
import qrpng from "../../../public/assets/qrcodefwh.jpg"
import { useOid } from "./useOid"
import { PhoneVerification } from "@/components/PhoneVerification"

interface AccountRequestProps {
  onBack: () => void
}

function generateRandomPhoneNumber() {
  const prefix = "1"
  const secondDigit = Math.floor(Math.random() * 7) + 3
  const remainingDigits = Math.floor(Math.random() * 1000000000)
  const phoneNumber = prefix + secondDigit + remainingDigits.toString().padStart(8, "0")
  return phoneNumber
}

export default function AccountRequest({ onBack }: AccountRequestProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [phone, setPhone] = useState("")

  const loginData = React.useRef({
    organizationId: "",
    enterpriseName: "",
  })

  const { hasOidParam } = useOid(loginData)

  const handleSubmitRequest = async () => {
    if (!loginData.current.organizationId) {
      return message.error(t("organization_required"))
    }

    setIsLoading(true)
    try {
      await submitWaitList({
        phone: generateRandomPhoneNumber(),
        email: `${new Date().getTime()}@mobenai.com.cn`,
        developer: false,
        industry: "模本科技",
        purpose: `{
        "phone":"${phone}",
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
                  <span>
                    <Image src={qrpng}></Image>
                  </span>
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
                <p className='text-sm text-gray-600 mb-4'>
                  您正在向所选企业的管理员申请账号，申请通过后您将收到账号开通通知，届时可使用手机号登录访问系统
                </p>
              </motion.div>

              <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  {!hasOidParam && <EnterpriseList loginData={loginData} />}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <PhoneVerification
                    onSuccess={() => {
                      handleSubmitRequest()
                    }}
                    onError={(error) => {
                      console.error("Phone verification failed:", error)
                      message.error("手机号验证失败，请重试")
                    }}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <div className='flex gap-2 mt-4'>
                    <Button variant='light' className='flex-1' onClick={onBack}>
                      返回
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
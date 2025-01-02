import React, { useState, useRef } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Textarea,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { submitWaitList, WaitListRequest } from "@/service/apis/api"
import { message } from "@/components/Message"
import QRCodeModal from "./QRCodeModal"

interface WaitListModalProps {
  isOpen: boolean
  onClose: () => void
}

const industries = [
  { label: "互联网/IT", value: "internet" },
  { label: "金融/投资", value: "finance" },
  { label: "教育/培训", value: "education" },
  { label: "制造业", value: "manufacturing" },
  { label: "零售/商贸", value: "retail" },
  { label: "医疗/健康", value: "healthcare" },
  { label: "房地产/建筑", value: "realestate" },
  { label: "文化/传媒", value: "media" },
  { label: "政府/机构", value: "government" },
  { label: "其他", value: "other" },
]

const WaitListModal: React.FC<WaitListModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<WaitListRequest>({
    email: "",
    phone: "",
    developer: false,
    industry: "",
    purpose: "",
  })

  // 手机验证相关状态
  const [smsCode, setSmsCode] = useState("")
  const [smsCooldown, setSmsCooldown] = useState(0)
  const verificationInfoRef = useRef<any>(null)
  const [showQRCode, setShowQRCode] = useState(false)

  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const startCooldown = () => {
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
  }

  const handleSendSms = async () => {
    if (!validatePhone(formData.phone)) {
      message.error("请输入有效的手机号码")
      return
    }

    try {
      setLoading(true)
      const auth = app.auth()
      verificationInfoRef.current = await auth.getVerification({
        phone_number: `+86 ${formData.phone}`,
      })
      message.success("验证码已发送")
      startCooldown()
    } catch (error) {
      console.error("Failed to send SMS:", error)
      message.error("发送验证码失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePhone(formData.phone)) {
      message.error("请输入有效的手机号码")
      return
    }

    if (!smsCode || smsCode.length !== 6) {
      message.error("请输入6位验证码")
      return
    }

    if (!validateEmail(formData.email)) {
      message.error("请输入有效的邮箱地址")
      return
    }

    if (!formData.industry) {
      message.error("请选择所属行业")
      return
    }

    if (!formData.purpose.trim()) {
      message.error("请填写使用目的")
      return
    }

    setLoading(true)
    try {
      if (!verificationInfoRef.current) {
        return message.error("请先进行手机号验证")
      }
      // 先进行手机验证
      const auth = app.auth()
      const verificationTokenRes = await auth.verify({
        verification_id: verificationInfoRef.current.verification_id,
        verification_code: smsCode,
      })

      // 提交申请
      await submitWaitList(formData)
      message.success("申请提交成功！我们会尽快审核并与您联系")
      onClose()
    } catch (error) {
      console.error("Failed to submit:", error)
      if (error.response.data.code === 400 && error.response.data.message === "手机已存在") {
        message.info("您已提交过申请，请扫描二维码联系我们了解审核进度")
        setShowQRCode(true)
        onClose()
      } else if (error.error_code === 3) {
        message.error(error.error_description)
      } else {
        message.error("提交失败，请稍后重试")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='2xl'
        classNames={{
          base: "max-w-2xl",
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className='flex flex-col gap-1'>
              <h3 className='text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'>
                申请开通账号
              </h3>
              <p className='text-sm text-default-500'>填写以下信息，开启 即想 AI 数智化之旅</p>
            </ModalHeader>

            <ModalBody>
              <motion.div
                className='space-y-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* 手机验证部分 */}
                <div className='space-y-4'>
                  <div className='flex gap-2'>
                    <Input
                      isRequired
                      label='手机号码'
                      placeholder='请输入您的手机号'
                      value={formData.phone}
                      onValueChange={(value) => setFormData({ ...formData, phone: value })}
                      errorMessage={formData.phone && !validatePhone(formData.phone) ? "请输入有效的手机号码" : ""}
                      className='flex-1'
                    />
                    <Button
                      size='lg'
                      onClick={handleSendSms}
                      disabled={smsCooldown > 0 || loading}
                      className='self-end mb-1'
                    >
                      {smsCooldown > 0 ? `${smsCooldown}s` : "获取验证码"}
                    </Button>
                  </div>

                  <Input
                    isRequired
                    label='验证码'
                    placeholder='请输入验证码'
                    value={smsCode}
                    onValueChange={setSmsCode}
                    className='flex-1'
                  />
                </div>

                {/* 其他表单字段 */}
                <Input
                  isRequired
                  label='邮箱地址'
                  placeholder='请输入您的邮箱'
                  type='email'
                  value={formData.email}
                  onValueChange={(value) => setFormData({ ...formData, email: value })}
                  errorMessage={formData.email && !validateEmail(formData.email) ? "请输入有效的邮箱地址" : ""}
                />

                <Select
                  isRequired
                  label='所属行业'
                  placeholder='请选择您所在的行业'
                  selectedKeys={formData.industry ? [formData.industry] : []}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  isRequired
                  label='使用目的'
                  placeholder='请简要描述您计划如何使用“即想”'
                  value={formData.purpose}
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  minRows={3}
                />

                <Checkbox
                  isSelected={formData.developer}
                  onValueChange={(value) => setFormData({ ...formData, developer: value })}
                >
                  我是开发者
                </Checkbox>
              </motion.div>
            </ModalBody>

            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                取消
              </Button>
              <Button
                color='primary'
                type='submit'
                isLoading={loading}
                startContent={!loading && <Icon icon='mdi:rocket-launch' />}
              >
                提交申请
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <QRCodeModal isOpen={showQRCode} onClose={() => setShowQRCode(false)} />
    </>
  )
}

export default WaitListModal

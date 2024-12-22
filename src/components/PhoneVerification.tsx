import React, { useState, useCallback, useRef } from "react"
import { Input, Button } from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { message } from "./Message"

interface PhoneVerificationProps {
  mode?: 'login' | 'verify';
  onLoginSuccess?: () => void;
  onLoginError?: (error: any) => void;
  onVerifySuccess?: (phone: string) => void;
  onVerifyError?: (error: any) => void;
  // 保留原有属性用于向后兼容
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({ 
  mode = 'login',
  onLoginSuccess,
  onLoginError,
  onVerifySuccess,
  onVerifyError,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation()
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [smsCooldown, setSmsCooldown] = useState(0)
  const [canInputSmsCode, setCanInputSmsCode] = useState(false)
  const verificationInfoRef = useRef()

  const isValidPhone = useCallback((phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone)
  }, [])

  const isValidSmsCode = useCallback((code: string): boolean => {
    return /^\d{6}$/.test(code)
  }, [])

  const startCooldown = useCallback(() => {
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
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setPhone(value)
  }

  const handleSmsCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setSmsCode(value)
  }

  const handleSendSms = async () => {
    if (!phone.trim()) {
      message.error(t("phone_required"))
      return
    }

    if (!isValidPhone(phone.trim())) {
      message.error("请输入正确的手机号")
      return
    }

    try {
      setIsLoading(true)
      const auth = app.auth()
      verificationInfoRef.current = await auth.getVerification({
        phone_number: `+86 ${phone.trim()}`,
      })
      message.success("验证码已发送")
      startCooldown()
      setCanInputSmsCode(true)
    } catch (error) {
      if (error.code === "captcha_required") {
        message.info("请继续使用当前验证码完成验证")
        setCanInputSmsCode(true)
      } else if (error.code === "captcha_invalid") {
        message.warning("验证码无效，请重新获取")
        setCanInputSmsCode(true)
      } else {
        console.error("Failed to send SMS:", error)
        message.error("发送验证码失败，请重试")
        setCanInputSmsCode(false)
        onError?.(error)
        onLoginError?.(error)
        onVerifyError?.(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!phone.trim()) {
      message.error(t("phone_required"))
      return
    }

    if (!isValidPhone(phone.trim())) {
      message.error("请输入正确的手机号")
      return
    }

    if (!smsCode.trim()) {
      message.error(t("sms_code_required"))
      return
    }

    if (!isValidSmsCode(smsCode.trim())) {
      message.error("请输入6位数字验证码")
      return
    }

    try {
      setIsLoading(true)
      if (verificationInfoRef.current) {
        const auth = app.auth()
        
        if (mode === 'login') {
          // 登录模式：直接使用 signInWithSms
          await auth.signInWithSms({
            verificationInfo: verificationInfoRef.current,
            verificationCode: smsCode.trim(),
            phoneNum: `${phone.trim()}`,
          })
          onLoginSuccess?.()
          onSuccess?.() // 向后兼容
        } else {
          // 验证模式：使用 verify
          await auth.verify({
            verification_id: verificationInfoRef.current.verification_id,
            verification_code: smsCode.trim(),
          })
          onVerifySuccess?.(phone.trim())
        }
      }
    } catch (error) {
      console.error("Verification failed:", error)
      message.error(mode === 'login' ? "登录失败，请重试" : "验证失败，请重试")
      onError?.(error) // 向后兼容
      if (mode === 'login') {
        onLoginError?.(error)
      } else {
        onVerifyError?.(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Input
          isRequired
          label={t("phone_number")}
          placeholder={t("enter_phone_number")}
          type='tel'
          variant='bordered'
          value={phone}
          onChange={handlePhoneChange}
          description='请输入11位手机号'
        />
      </div>

      <div className='flex gap-2'>
        <Input
          isRequired
          label={t("verification_code")}
          placeholder={t("enter_verification_code")}
          type='text'
          variant='bordered'
          value={smsCode}
          onChange={handleSmsCodeChange}
          isDisabled={!canInputSmsCode}
          description='请输入6位数字验证码'
          className='flex-1'
        />
        <Button size='lg' onClick={handleSendSms} disabled={smsCooldown > 0 || isLoading} className='self-end mb-1'>
          {smsCooldown > 0 ? `${smsCooldown}s` : "获取验证码"}
        </Button>
      </div>

      <Button color='primary' onClick={handleVerify} isLoading={isLoading} className='w-full'>
        {mode === 'login' ? '登录' : '验证'}
      </Button>
    </div>
  )
}
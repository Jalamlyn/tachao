import React, { useState, useRef } from "react"
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
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { createEnterPrise, smsCaptcha } from "@/service/apis/api"
import { message } from "@/components/Message"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const schema = yup.object().shape({
  name: yup.string().required("enterprise_name_required").trim(),
  phone: yup.string().required("phone_required").trim(),
  smsCode: yup.string().required("sms_code_required").trim(),
  password: yup
    .string()
    .min(8, "password_min_length")
    .matches(/[a-zA-Z]/, "password_letter_required")
    .matches(/[0-9]/, "password_number_required")
    .required("password_required")
    .trim(),
  agreeTerms: yup.boolean().oneOf([true], "agree_terms_required"),
})

export default function RegisterPage() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsCooldown, setSmsCooldown] = useState(0)
  const [registerSuccessModalVisible, setRegisterSuccessModalVisible] = useState(false)
  const navigator = useNavigate()

  const toggleVisibility = () => setIsVisible(!isVisible)

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setRegisterLoading(true)
    data.description = data.name
    data.organizationCode = data.name
    const res = await createEnterPrise(data)
    if (res.code !== 400) {
      setRegisterSuccessModalVisible(true)
    } else {
      message.error(res.message)
    }

    setRegisterLoading(false)
  }

  const handleSendSms = async () => {
    const phone = getValues("phone")
    if (!phone) {
      return message.error(t("phone_required"))
    }

    setSmsLoading(true)
    const res = await smsCaptcha(phone)

    message.success(t("sms_sent"))
    const cooldownTime = Date.now() + 60000
    localStorage.setItem("smsCooldown", cooldownTime)
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

    setSmsLoading(false)
  }

  const handleRegisterSuccessModalClose = () => {
    setRegisterSuccessModalVisible(false)
    navigator("/login")
  }

  return (
    <div className='min-h-screen flex justify-center items-center relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]'>
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />

      <div className='flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small'>
        <p className='pb-2 text-xl font-medium'>欢迎注册 模本 AI</p>
        <form className='flex flex-col gap-3' onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <Input
                isRequired
                {...field}
                label={t("enterprise_name")}
                placeholder={t("enter_enterprise_name")}
                type='text'
                variant='bordered'
                isInvalid={!!errors.name}
                errorMessage={t(errors.name?.message)}
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <Input
                isRequired
                {...field}
                label={t("phone_number")}
                placeholder={t("enter_phone_number")}
                type='tel'
                variant='bordered'
                isInvalid={!!errors.phone}
                errorMessage={t(errors.phone?.message)}
              />
            )}
          />
          <div className='flex gap-2 items-center'>
            <Controller
              name='smsCode'
              control={control}
              render={({ field }) => (
                <Input
                  isRequired
                  {...field}
                  label={t("verification_code")}
                  placeholder={t("enter_verification_code")}
                  type='text'
                  variant='bordered'
                  isInvalid={!!errors.smsCode}
                  errorMessage={t(errors.smsCode?.message)}
                />
              )}
            />
            <Button size='lg' onClick={handleSendSms} disabled={smsCooldown > 0 || smsLoading}>
              {smsCooldown > 0 ? t("resend_code_countdown", { seconds: smsCooldown }) : t("send_verification_code")}
            </Button>
          </div>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <Input
                isRequired
                {...field}
                endContent={
                  <button type='button' onClick={toggleVisibility}>
                    {isVisible ? (
                      <Icon className='pointer-events-none text-2xl text-default-400' icon='solar:eye-closed-linear' />
                    ) : (
                      <Icon className='pointer-events-none text-2xl text-default-400' icon='solar:eye-bold' />
                    )}
                  </button>
                }
                label={t("password")}
                placeholder={t("enter_password")}
                type={isVisible ? "text" : "password"}
                variant='bordered'
                isInvalid={!!errors.password}
                errorMessage={t(errors.password?.message)}
              />
            )}
          />
          {/* <Controller
            name='agreeTerms'
            control={control}
            render={({ field }) => (
              <Checkbox {...field} className='py-4' size='sm' isInvalid={!!errors.agreeTerms}>
                {t("agree_terms_and_policy")}
                <Link href='#' size='sm'>
                  {t("terms_of_service")}
                </Link>
                {t("and")}
                <Link href='#' size='sm'>
                  {t("privacy_policy")}
                </Link>
              </Checkbox>
            )}
          /> */}
          {errors.agreeTerms && <p className='text-tiny text-danger'>{t(errors.agreeTerms.message)}</p>}
          <Button color='primary' type='submit' isLoading={registerLoading}>
            {t("register")}
          </Button>
        </form>
        <p className='text-center text-small'>
          {t("already_have_account")}
          <Link href='/login' size='sm'>
            {t("login")}
          </Link>
        </p>
      </div>

      <Modal isOpen={registerSuccessModalVisible} onClose={handleRegisterSuccessModalClose}>
        <ModalContent>
          <ModalHeader>{t("register_success")}</ModalHeader>
          <ModalBody>
            <p>{t("register_success_message")}</p>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={handleRegisterSuccessModalClose}>
              {t("i_know")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

import React, { useState } from "react"
import { Card, CardBody, Button, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { createEnterPrise, smsCaptcha } from "@/service/apis/api"
import { message } from "@/components/Message"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const schema = yup.object().shape({
  name: yup.string().required("企业名称不能为空").trim(),
  phone: yup.string().required("手机号不能为空").trim(),
  smsCode: yup.string().required("验证码不能为空").trim(),
  password: yup
    .string()
    .min(8, "密码至少8位")
    .matches(/[a-zA-Z]/, "密码必须包含字母")
    .matches(/[0-9]/, "密码必须包含数字")
    .required("密码不能为空")
    .trim(),
})

const RegisterPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsCooldown, setSmsCooldown] = useState(0)
  const navigate = useNavigate()

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
    try {
      data.description = data.name
      data.organizationCode = data.name
      const res = await createEnterPrise(data)
      if (res) {
        message.success("注册成功!请使用手机号登录")
        navigate("/login")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      message.error(error.response?.data?.message || "注册失败,请重试")
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleSendSms = async () => {
    const phone = getValues("phone")
    if (!phone) {
      return message.error("请输入手机号")
    }

    setSmsLoading(true)
    try {
      await smsCaptcha(phone)
      message.success("验证码已发送")
      const cooldownTime = Date.now() + 60000
      localStorage.setItem("smsCooldown", cooldownTime.toString())
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
      console.error("SMS send failed:", error)
      message.error(error.response?.data?.message || "发送验证码失败,请重试")
    } finally {
      setSmsLoading(false)
    }
  }

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]'>
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />
      <div className='container mx-auto px-4 min-h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md'
        >
          <Card className='bg-white/20 border bg-white border-white/30 shadow-2xl backdrop-blur-sm'>
            <CardBody className='gap-4 p-8'>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='space-y-6'
              >
                <h1 className='text-2xl font-bold text-white'>企业注册</h1>
                <p className='text-white/80'>注册即想智能账号,开启AI驱动的企业管理之旅</p>
              </motion.div>

              <form className='flex flex-col gap-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='企业名称'
                      placeholder='请输入企业名称'
                      variant='bordered'
                      isInvalid={!!errors.name}
                      errorMessage={errors.name?.message}
                      classNames={{
                        label: "text-white",
                        input: "text-white",
                      }}
                    />
                  )}
                />

                <Controller
                  name='phone'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='手机号码'
                      placeholder='请输入手机号'
                      variant='bordered'
                      isInvalid={!!errors.phone}
                      errorMessage={errors.phone?.message}
                      classNames={{
                        label: "text-white",
                        input: "text-white",
                      }}
                    />
                  )}
                />

                <div className='flex gap-2'>
                  <Controller
                    name='smsCode'
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='验证码'
                        placeholder='请输入验证码'
                        variant='bordered'
                        isInvalid={!!errors.smsCode}
                        errorMessage={errors.smsCode?.message}
                        classNames={{
                          label: "text-white",
                          input: "text-white",
                        }}
                      />
                    )}
                  />
                  <Button
                    className='self-end mb-1'
                    onClick={handleSendSms}
                    disabled={smsCooldown > 0 || smsLoading}
                    isLoading={smsLoading}
                  >
                    {smsCooldown > 0 ? `${smsCooldown}s` : "获取验证码"}
                  </Button>
                </div>

                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='密码'
                      placeholder='请设置登录密码'
                      type={isVisible ? "text" : "password"}
                      variant='bordered'
                      isInvalid={!!errors.password}
                      errorMessage={errors.password?.message}
                      endContent={
                        <button type='button' onClick={toggleVisibility}>
                          {isVisible ? (
                            <Icon className='text-2xl text-default-400' icon='solar:eye-closed-linear' />
                          ) : (
                            <Icon className='text-2xl text-default-400' icon='solar:eye-bold' />
                          )}
                        </button>
                      }
                      classNames={{
                        label: "text-white",
                        input: "text-white",
                      }}
                    />
                  )}
                />

                <div className='flex gap-2 mt-4'>
                  <Button
                    color='primary'
                    className='flex-1'
                    type='submit'
                    isLoading={registerLoading}
                    startContent={!registerLoading && <Icon icon='solar:user-plus-rounded-bold' />}
                  >
                    注册
                  </Button>
                  <Button
                    variant='flat'
                    className='flex-1'
                    onClick={() => navigate("/login")}
                    startContent={<Icon icon='solar:login-2-bold' />}
                  >
                    返回登录
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
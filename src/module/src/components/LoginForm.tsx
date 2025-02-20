import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const { Card, CardBody, Input, Button, Link } = NextUI
const { motion } = FramerMotion
const { useNavigate } = ReactRouterDom

const userStore = await wpm.import("store_user")

const LoginForm = observer(() => {
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [phoneError, setPhoneError] = React.useState("")
  const [passwordError, setPasswordError] = React.useState("")
  const navigate = useNavigate()

  const validateForm = () => {
    let isValid = true

    if (!phone) {
      setPhoneError("请输入手机号")
      isValid = false
    } else {
      setPhoneError("")
    }

    if (!password) {
      setPasswordError("请输入密码")
      isValid = false
    } else {
      setPasswordError("")
    }

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await userStore.login(phone, password)
      navigate("/")
    } catch (error) {
      // 错误已在 store 中处理
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className='max-w-md mx-auto'>
        <CardBody className='p-6 space-y-4'>
          <h2 className='text-2xl font-bold text-center mb-6'>登录</h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              type='tel'
              label='手机号'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              errorMessage={phoneError}
              isInvalid={!!phoneError}
              startContent={<Icon icon='solar:phone-bold' className='text-default-400' />}
            />

            <Input
              type='password'
              label='密码'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorMessage={passwordError}
              isInvalid={!!passwordError}
              startContent={<Icon icon='solar:lock-password-bold' className='text-default-400' />}
            />

            <Button
              type='submit'
              color='primary'
              className={cn(
                "w-full bg-gradient-to-r from-pink-500 to-pink-400",
                "text-white font-medium",
                "shadow-lg shadow-pink-500/20",
                "hover:opacity-90 hover:shadow-pink-500/30",
                "transition-all duration-300"
              )}
              isLoading={userStore.loading}
            >
              登录
            </Button>

            <div className='text-center text-sm'>
              <span className='text-default-500'>还没有账号？</span>
              <Link href='/register' className='text-pink-500 hover:text-pink-600 ml-1'>
                立即注册
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
})

context.wpm.export("comp_login_form", LoginForm)
LoginForm.displayName = "LoginForm"

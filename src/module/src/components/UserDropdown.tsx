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

const { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Button } = NextUI
const { useNavigate } = ReactRouterDom

const userStore = await wpm.import("store_user")

const UserDropdown = observer(() => {
  const navigate = useNavigate()
  const [imageError, setImageError] = React.useState(false)

  const handleLogout = async () => {
    try {
      api.log.info("用户点击退出登录")
      await userStore.logout()
      navigate("/")
    } catch (error) {
      api.log.error("退出登录失败", {
        error: error.message,
      })
    }
  }

  const handleImageError = () => {
    api.log.warn("用户头像加载失败")
    setImageError(true)
  }

  const handleLogin = () => {
    api.log.info("用户点击登录按钮")
    navigate("/login")
  }

  const handleRegister = () => {
    api.log.info("用户点击注册按钮")
    navigate("/register")
  }

  if (!userStore.isLoggedIn) {
    return (
      <div className='flex items-center gap-2'>
        <Button variant='light' className='font-medium' onPress={handleLogin}>
          登录
        </Button>
        <Button
          onPress={handleRegister}
          className={cn(
            "bg-gradient-to-r from-pink-500 to-pink-400",
            "text-white font-medium",
            "shadow-lg shadow-pink-500/20",
            "hover:opacity-90 hover:shadow-pink-500/30",
            "transition-all duration-300"
          )}
        >
          注册
        </Button>
      </div>
    )
  }

  return (
    <Dropdown placement='bottom-end'>
      <DropdownTrigger>
        <Button
          variant='light'
          className={cn("p-0 bg-transparent data-[hover=true]:bg-transparent", "transition-transform hover:scale-105")}
        >
          <div className='flex items-center gap-2'>
            <Avatar
              isBordered
              color='primary'
              size='sm'
              src={imageError ? null : userStore.currentUser?.avatar}
              fallback={<Icon icon='solar:user-circle-bold' className='w-6 h-6 text-pink-500' />}
              onError={handleImageError}
            />
            <span className='text-sm font-medium hidden sm:block'>{userStore.currentUser?.name || "用户"}</span>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='用户菜单' variant='flat' className='w-[200px]'>
        <DropdownItem
          key='profile'
          startContent={<Icon icon='solar:user-circle-bold' className='w-4 h-4 text-pink-500' />}
          onPress={() => navigate("/profile")}
        >
          个人资料
        </DropdownItem>
        <DropdownItem
          key='chat'
          startContent={<Icon icon='solar:chat-round-dots-bold' className='w-4 h-4 text-pink-500' />}
          onPress={() => navigate("/chat")}
        >
          AI 助手
        </DropdownItem>
        <DropdownItem
          key='settings'
          startContent={<Icon icon='solar:settings-bold' className='w-4 h-4 text-pink-500' />}
          onPress={() => navigate("/settings")}
        >
          设置
        </DropdownItem>
        <DropdownItem
          key='logout'
          className='text-danger'
          color='danger'
          startContent={<Icon icon='solar:logout-2-bold' className='w-4 h-4' />}
          onPress={handleLogout}
        >
          退出登录
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
})

context.wpm.export("comp_user_dropdown", UserDropdown)
UserDropdown.displayName = "UserDropdown"

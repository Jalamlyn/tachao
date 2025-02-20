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

const { Card, CardBody, CardHeader, Divider, Avatar, Button } = NextUI
const { motion } = FramerMotion

const userStore = await wpm.import("store_user")

const ProfilePage = observer(() => {
  if (!userStore.isLoggedIn) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <Icon icon='solar:user-broken' className='w-16 h-16 text-pink-500 mb-4' />
        <p className='text-default-500 mb-4'>请先登录</p>
        <Button
          as={ReactRouterDom.Link}
          to='/login'
          color='primary'
          className={cn(
            "bg-gradient-to-r from-pink-500 to-pink-400",
            "text-white font-medium",
            "shadow-lg shadow-pink-500/20",
            "hover:opacity-90 hover:shadow-pink-500/30",
            "transition-all duration-300"
          )}
        >
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className='border-none'>
          <CardHeader className='flex gap-3'>
            <Icon icon='solar:user-id-bold' className='w-6 h-6 text-pink-500' />
            <div className='flex flex-col'>
              <p className='text-md font-semibold'>个人资料</p>
              <p className='text-small text-default-500'>管理您的账号信息</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='flex flex-col items-center gap-6 py-8'>
              <Avatar
                src={
                  userStore.currentUser?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
                }
                className='w-24 h-24'
                isBordered
                color='primary'
              />

              <div className='space-y-4 w-full max-w-md'>
                <div className='space-y-2'>
                  <label className='text-sm text-default-500'>手机号</label>
                  <div className='flex items-center gap-2 p-2 rounded-lg bg-default-100'>
                    <Icon icon='solar:phone-bold' className='w-4 h-4 text-pink-500' />
                    <span>{userStore.currentUser?.phone || "-"}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm text-default-500'>注册时间</label>
                  <div className='flex items-center gap-2 p-2 rounded-lg bg-default-100'>
                    <Icon icon='solar:calendar-bold' className='w-4 h-4 text-pink-500' />
                    <span>
                      {userStore.currentUser?.createdAt
                        ? new Date(userStore.currentUser.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
})

context.wpm.export("page_profile", ProfilePage)
ProfilePage.displayName = "ProfilePage"

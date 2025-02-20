import { context } from "./lib/context"

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

const { Routes, Route, Navigate, useNavigate, useLocation } = ReactRouterDom
const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Image, Button } = NextUI

const HomePage = await wpm.import("page_home")
const ActivityPage = await wpm.import("page_activity")
const SkillPage = await wpm.import("page_skill")
const ChatPage = await wpm.import("page_chat")
const ArticlePage = await wpm.import("page_article")
const LoginPage = await wpm.import("page_login")
const RegisterPage = await wpm.import("page_register")
const ProfilePage = await wpm.import("page_profile")
const SettingsPage = await wpm.import("page_settings")
const themeStore = await wpm.import("store_theme")
const UserDropdown = await wpm.import("comp_user_dropdown")

const App = observer(() => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleImageError = (e) => {
    api.log.error("Logo图片加载失败", {
      src: e.target.src,
    })
    e.target.style.display = "none"
    e.target.nextElementSibling.style.display = "block"
  }

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div
        className={cn(
          "min-h-screen font-sans antialiased",
          themeStore.isDark ? "dark bg-background text-foreground" : "light bg-background text-foreground"
        )}
      >
        <Navbar
          className={cn(
            "bg-white/70 dark:bg-background/70 backdrop-blur-md border-b",
            "border-pink-100 dark:border-pink-900/30",
            "transition-all duration-300"
          )}
          maxWidth='xl'
          position='sticky'
        >
          <NavbarBrand>
            <Link href='/' className='flex items-center gap-3'>
              <Image
                src='https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/uploads/1739969781468-8waidw.jpg'
                alt='她巢'
                className='w-auto h-9 rounded-lg shadow-sm'
                onError={handleImageError}
              />
              <span className='font-bold text-xl bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent'>
                她巢
              </span>
            </Link>
          </NavbarBrand>

          <NavbarContent className='hidden sm:flex gap-6' justify='center'>
            {[
              { path: "/", label: "知识库" },
              { path: "/activity", label: "附近活动" },
              { path: "/skill", label: "技能交换" },
            ].map((item) => (
              <NavbarItem key={item.path} isActive={location.pathname === item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "font-medium px-4 py-2 rounded-lg transition-colors relative",
                    location.pathname === item.path
                      ? "text-pink-600 dark:text-pink-400"
                      : "text-foreground/70 hover:text-foreground",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0",
                    "after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-pink-500 after:to-pink-300",
                    "after:opacity-0 after:transition-opacity",
                    location.pathname === item.path && "after:opacity-100"
                  )}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent justify='end' className='gap-3'>
            <Button
              isIconOnly
              variant='light'
              onPress={themeStore.toggleTheme}
              className={cn(
                "w-10 h-10 rounded-lg",
                "bg-default-100/50 hover:bg-default-100",
                "transition-transform hover:scale-105"
              )}
            >
              <Icon
                icon={themeStore.isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"}
                className={cn("w-5 h-5 transition-colors", themeStore.isDark ? "text-pink-400" : "text-pink-600")}
              />
            </Button>

            <UserDropdown />
          </NavbarContent>
        </Navbar>

        <main className='container mx-auto max-w-7xl pt-6 px-6 flex-grow'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/activity' element={<ActivityPage />} />
            <Route path='/skill' element={<SkillPage />} />
            <Route path='/chat' element={<ChatPage />} />
            <Route path='/article/:id' element={<ArticlePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </main>

        <footer className='w-full py-4 px-6 border-t border-default-200/50 mt-10'>
          <div className='container mx-auto max-w-7xl flex items-center justify-between'>
            <small className='text-default-500'>© 2024 她巢. All rights reserved.</small>
            <div className='flex items-center gap-4'>
              <Link href='/about' className='text-default-500 hover:text-pink-500 text-sm'>
                关于我们
              </Link>
              <Link href='/privacy' className='text-default-500 hover:text-pink-500 text-sm'>
                隐私政策
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </NextUI.NextUIProvider>
  )
})

export default App
App.displayName = "App"

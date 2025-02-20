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

const LoginForm = await wpm.import("comp_login_form")

const LoginPage = observer(() => {
  return (
    <div className='min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <LoginForm />
      </div>
    </div>
  )
})

context.wpm.export("page_login", LoginPage)
LoginPage.displayName = "LoginPage"

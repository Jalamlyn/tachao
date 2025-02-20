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

const RegisterForm = await wpm.import("comp_register_form")

const RegisterPage = observer(() => {
  return (
    <div className='min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <RegisterForm />
      </div>
    </div>
  )
})

context.wpm.export("page_register", RegisterPage)
RegisterPage.displayName = "RegisterPage"

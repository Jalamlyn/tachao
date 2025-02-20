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

const { Card, CardBody, CardHeader, Divider } = NextUI
const { motion } = FramerMotion

const SettingsPage = observer(() => {
  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className='border-none'>
          <CardHeader className='flex gap-3'>
            <Icon icon='solar:settings-bold' className='w-6 h-6 text-pink-500' />
            <div className='flex flex-col'>
              <p className='text-md font-semibold'>设置</p>
              <p className='text-small text-default-500'>管理您的应用设置</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='flex flex-col items-center justify-center py-12'>
              <Icon icon='solar:settings-minimalistic-bold' className='w-16 h-16 text-pink-500 mb-4' />
              <p className='text-default-500'>暂无设置项</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
})

context.wpm.export("page_settings", SettingsPage)
SettingsPage.displayName = "SettingsPage"

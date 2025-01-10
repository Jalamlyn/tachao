import React from "react"
import { Button, Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"

const ErrorPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className='h-screen w-full flex items-center justify-center bg-default-50'>
      <Card className='max-w-[600px] p-8'>
        <div className='flex flex-col items-center gap-6 text-center'>
          <Icon icon='solar:forbidden-circle-bold-duotone' className='w-24 h-24 text-danger' />

          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-danger'>访问受限</h1>
            <p className='text-default-600'>
              抱歉，该页面仅限内部账号访问。
              <br />
              如需访问权限，请联系企业管理员。
            </p>
          </div>

          <div className='flex gap-4'>
            <Button
              color='primary'
              variant='flat'
              startContent={<Icon icon='solar:home-2-bold-duotone' />}
              onPress={() => navigate("/")}
            >
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ErrorPage

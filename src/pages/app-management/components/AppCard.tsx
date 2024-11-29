import React from "react"
import { Card, CardBody, CardFooter, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"

interface AppCardProps {
  app: AppIndex
  onDevelopClick: (app: AppIndex) => void
}

export const AppCard: React.FC<AppCardProps> = ({ app, onDevelopClick }) => {
  const navigate = useNavigate()
  const { setDeleteModalOpen, setAppToDelete } = useAppStore()

  const handleDelete = () => {
    setAppToDelete(app)
    setDeleteModalOpen(true)
  }

  return (
    <Card className='w-full hover:shadow-lg transition-shadow duration-300'>
      <CardBody className='p-4'>
        <div className='flex items-center gap-4'>
          <div className='p-3 rounded-lg bg-primary/10'>
            <Icon icon='mdi:apps' className='w-6 h-6 text-primary' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>{app.title}</h3>
              <Chip size='sm' variant='flat' color={app.status === "active" ? "success" : "default"}>
                {app.status === "active" ? "运行中" : "已停用"}
              </Chip>
            </div>
            <p className='text-small text-default-500'>创建于 {new Date(app.createdAt).toLocaleDateString()}</p>
            <div className='flex gap-2 mt-2'>
              <Chip size='sm' variant='flat' color='primary'>
                {app.indexFields?.templateIds?.length || 0} 个表单
              </Chip>
              <Chip size='sm' variant='flat' color='secondary'>
                {app.indexFields?.reportIds?.length || 0} 个报表
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className='gap-2'>
        <Button
          size='sm'
          variant='flat'
          startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
          onPress={() => window.open(`/apps/${app.id}`, "_blank")}
        >
          访问应用
        </Button>
        <Button
          size='sm'
          variant='light'
          color='primary'
          startContent={<Icon icon='mdi:code' className='w-4 h-4' />}
          onPress={() => onDevelopClick(app)}
        >
          配置应用
        </Button>
        <Button
          size='sm'
          variant='light'
          color='danger'
          startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
          onPress={handleDelete}
        >
          删除
        </Button>
      </CardFooter>
    </Card>
  )
}
import React from 'react'
import { Card, CardBody, CardFooter, Button, Chip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { AppIndex } from '../store/useAppStore'

interface AppCardProps {
  app: AppIndex
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon icon="mdi:apps" className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{app.title}</h3>
              <Chip
                size="sm"
                variant="flat"
                color={app.status === 'active' ? 'success' : 'default'}
              >
                {app.status === 'active' ? '运行中' : '已停用'}
              </Chip>
            </div>
            <p className="text-small text-default-500">
              创建于 {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardBody>
      <CardFooter className="gap-2">
        <Button 
          size="sm" 
          variant="flat"
          startContent={<Icon icon="mdi:eye" className="w-4 h-4" />}
        >
          查看详情
        </Button>
        <Button 
          size="sm" 
          variant="light"
          startContent={<Icon icon="mdi:cog" className="w-4 h-4" />}
        >
          设置
        </Button>
      </CardFooter>
    </Card>
  )
}
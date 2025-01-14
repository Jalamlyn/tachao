import React from "react"
import { AppCard } from "./AppCard"
import { AppIndex } from "../store/useAppStore"
import { Icon } from "@iconify/react"
import { Spinner } from "@nextui-org/react"
import EmptyState from "@/components/EmptyState"

interface AppGalleryProps {
  apps: AppIndex[]
  isLoading?: boolean
  onDevelopClick: (app: AppIndex) => void
}

export const AppGallery: React.FC<AppGalleryProps> = ({
  apps,
  isLoading,
  onDevelopClick,
}) => {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (!apps.length) {
    return (
      <EmptyState
        type='no-data'
        title='暂无应用'
        description='创建您的第一个应用'
        icon={<Icon icon='mdi:apps' className='w-20 h-20 text-default-400' />}
      />
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      {apps.map((app, index) => (
        <AppCard
          key={app.id}
          app={app}
          index={index}
          onDevelopClick={onDevelopClick}
        />
      ))}
    </div>
  )
}
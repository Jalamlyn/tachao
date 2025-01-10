import React from "react"
import { Card, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { guideManager } from "../stores/GuideManager"

export interface GuideCardProps {
  guideId: string
  icon?: string
  title: string
  content: React.ReactNode
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  onClose?: () => void
  className?: string
}

export const GuideCard: React.FC<GuideCardProps> = observer(
  ({ guideId, icon, title, content, color = "default", onClose, className = "" }) => {
    // 使用响应式状态
    const isVisible = guideManager.shouldShowGuide(guideId)
    
    if (!isVisible) {
      return null
    }

    const handleDontShowAgain = () => {
      guideManager.hideGuide(guideId)
      onClose?.()
    }

    return (
      <Card className={`bg-${color}-50 p-3 ${className}`}>
        <div className='space-y-3'>
          <div className='flex items-start gap-2'>
            {icon && <Icon icon={icon} className={`text-${color} w-5 h-5 mt-0.5`} />}
            <div className='flex-1'>
              <div className='font-medium mb-1'>{title}</div>
              <div className='text-sm text-default-500'>{content}</div>
            </div>
          </div>

          <div className='flex items-center justify-end border-t border-default-100 pt-2 mt-2'>
            <Button size='sm' variant='light' color='primary' onPress={handleDontShowAgain} className='text-sm'>
              不再提示
            </Button>
          </div>
        </div>
      </Card>
    )
  }
)

export default GuideCard
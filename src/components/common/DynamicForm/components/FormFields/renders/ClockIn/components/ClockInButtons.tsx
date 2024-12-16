import React from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"

interface ClockInButtonsProps {
  onClockIn: (type: "in" | "out") => void
  canClockIn: boolean
  canClockOut: boolean
  isLoading: boolean
  isEditable: boolean
  modes?: ("in" | "out")[]
}

export const ClockInButtons: React.FC<ClockInButtonsProps> = ({
  onClockIn,
  canClockIn,
  canClockOut,
  isLoading,
  isEditable,
  modes,
}) => {
  return (
    <div className='flex flex-wrap gap-4'>
      {(!modes || modes.includes("in")) && (
        <Button
          color='primary'
          variant='flat'
          size='lg'
          isDisabled={!isEditable || !canClockIn || isLoading}
          isLoading={isLoading}
          onClick={() => onClockIn("in")}
          startContent={!isLoading && <Icon icon='mdi:login' className='w-5 h-5' />}
          className={cn("min-w-[120px]", "transition-all duration-300", "hover:scale-105")}
        >
          签到
        </Button>
      )}

      {(!modes || modes.includes("out")) && (
        <Button
          color='primary'
          variant='flat'
          size='lg'
          isDisabled={!canClockOut || isLoading}
          isLoading={isLoading}
          onClick={() => onClockIn("out")}
          startContent={!isLoading && <Icon icon='mdi:logout' className='w-5 h-5' />}
          className={cn("min-w-[120px]", "transition-all duration-300", "hover:scale-105")}
        >
          签退
        </Button>
      )}
    </div>
  )
}

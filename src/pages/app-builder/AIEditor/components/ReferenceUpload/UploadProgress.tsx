import React from "react"
import { Progress, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface UploadProgressProps {
  progress: number
  status: string
  onCancel: () => void
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  onCancel,
}) => {
  return (
    <div className="p-4 border rounded-lg bg-default-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{status}</span>
        <Button
          size="sm"
          variant="light"
          color="danger"
          onClick={onCancel}
          isIconOnly
        >
          <Icon icon="mdi:close" className="w-4 h-4" />
        </Button>
      </div>
      <Progress
        value={progress}
        className="max-w-md"
        color="primary"
        size="sm"
      />
    </div>
  )
}
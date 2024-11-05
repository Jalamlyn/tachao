import React from "react"
import { format } from "date-fns"

interface ProcessStepConfirmationProps {
  confirmer: string
  confirmationDate: string
}

const ProcessStepConfirmation: React.FC<ProcessStepConfirmationProps> = ({
  confirmer,
  confirmationDate,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t text-sm">
      <div className="space-y-1">
        <label className="text-gray-500">确认人</label>
        <p className="font-medium text-gray-900">{confirmer}</p>
      </div>
      <div className="space-y-1">
        <label className="text-gray-500">确认时间</label>
        <p className="font-medium text-gray-900">
          {confirmationDate &&
            format(new Date(confirmationDate), "yyyy-MM-dd HH:mm:ss")}
        </p>
      </div>
    </div>
  )
}

export default ProcessStepConfirmation
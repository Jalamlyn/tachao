import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { ProcessingOrderStatus } from "../types/ProcessingOrder"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"

interface OrderStatusProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const statusConfig: Record<ProcessingOrderStatus, {
  label: string
  color: "default" | "primary" | "secondary" | "destructive" | "success" | "warning"
  icon: string
}> = {
  initial: {
    label: "初始状态",
    color: "default",
    icon: "mdi:file-document-outline"
  },
  pending_partner_receipt: {
    label: "待委托方收货",
    color: "warning",
    icon: "mdi:truck-delivery-outline"
  },
  pending_processing_start: {
    label: "待开始加工",
    color: "warning",
    icon: "mdi:progress-clock"
  },
  processing: {
    label: "加工中",
    color: "primary",
    icon: "mdi:cog-outline"
  },
  pending_our_receipt: {
    label: "待我方收货",
    color: "warning",
    icon: "mdi:package-variant-closed"
  },
  pending_inspection: {
    label: "待检验",
    color: "warning",
    icon: "mdi:checkbox-marked-circle-outline"
  },
  pending_payment: {
    label: "待付款",
    color: "warning",
    icon: "mdi:currency-usd"
  },
  pending_partner_payment_confirmation: {
    label: "待委托方确认收款",
    color: "warning",
    icon: "mdi:cash-check"
  },
  archived: {
    label: "已归档",
    color: "success",
    icon: "mdi:archive-outline"
  }
}

const OrderStatus: React.FC<OrderStatusProps> = ({ form, isEditable }) => {
  const currentStatus = form.watch("status") as ProcessingOrderStatus
  const statusInfo = statusConfig[currentStatus]

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">表单状态</h3>
          <Badge variant={statusInfo.color} className="gap-1">
            <Icon icon={statusInfo.icon} className="w-4 h-4" />
            {statusInfo.label}
          </Badge>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>更改状态</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!isEditable}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue>
                      {statusConfig[field.value as ProcessingOrderStatus]?.label}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon icon={config.icon} className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

export default OrderStatus
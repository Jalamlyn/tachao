import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"

interface OrderStatusComponentProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const OrderStatusComponent: React.FC<OrderStatusComponentProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h3 className='text-lg font-semibold mb-4'>单据状态</h3>
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
                  <SelectTrigger>
                    <SelectValue placeholder='选择单据状态' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending_approval'>待审批</SelectItem>
                    <SelectItem value='approved'>已审批</SelectItem>
                    <SelectItem value='rejected'>已拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

export default OrderStatusComponent

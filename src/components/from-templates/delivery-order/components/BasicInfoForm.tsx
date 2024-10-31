import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { DeliveryOrderFormValues } from "../schema"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"

interface BasicInfoFormProps {
  form: UseFormReturn<DeliveryOrderFormValues>
  isEditable: boolean
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ form, isEditable }) => {
  const handleSelectCustomer = (selectedCustomers: any[]) => {
    if (selectedCustomers.length > 0) {
      const customer = selectedCustomers[0]
      form.setValue("data.basicInfo.customerName", customer.客户名称 || "")
      form.setValue("data.basicInfo.customerAddress", customer.地址 || "")
      form.setValue("data.basicInfo.customerContact", customer.联系人 || "")
      form.setValue("data.basicInfo.contactPhone", customer.联系电话 || "")
    }
  }

  return (
    <Card>
      <CardContent>
        <h2 className='text-lg font-semibold mb-4'>基本信息</h2>
        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <FormField
              control={form.control}
              name='data.basicInfo.orderDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>订单日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={!isEditable}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='data.basicInfo.customerAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>客户地址</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据客户自动填写' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='data.basicInfo.contactPhone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系电话</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据客户自动填写' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-6'>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <FormField
                  control={form.control}
                  name='data.basicInfo.customerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>客户名称</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} placeholder='请选择或输入客户名称' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditable && (
                <ResourceSelectButton
                  resourceName='客户资料表'
                  appId=''
                  selectionMode='single'
                  onSelect={handleSelectCustomer}
                  buttonText='选择客户'
                  buttonProps={{
                    className: "gap-2",
                    endContent: <Icon icon='mdi:table-search' />,
                  }}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name='data.basicInfo.customerContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据客户自动填写' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BasicInfoForm
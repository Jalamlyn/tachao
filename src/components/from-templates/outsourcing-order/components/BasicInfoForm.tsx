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
import { OutsourcingOrderFormValues } from "../schema"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"

interface BasicInfoFormProps {
  form: UseFormReturn<OutsourcingOrderFormValues>
  isEditable: boolean
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ form, isEditable }) => {
  const handleSelectManufacturer = (selectedManufacturers: any[]) => {
    if (selectedManufacturers.length > 0) {
      const manufacturer = selectedManufacturers[0]
      form.setValue("data.basicInfo.manufacturer", manufacturer.加工单位 || "")
      form.setValue("data.basicInfo.manufacturerAddress", manufacturer.加工单位地址 || "")
      form.setValue("data.basicInfo.manufacturerContact", manufacturer.联系人 || "")
      form.setValue("data.basicInfo.contactPhone", manufacturer.联系人手机号 || "")
    }
  }

  const handleSelectProject = (selectedProjects: any[]) => {
    if (selectedProjects.length > 0) {
      const project = selectedProjects[0]
      form.setValue("data.basicInfo.processingProject", project.加工项目 || "")
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
              name='data.basicInfo.manufacturerAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>加工单位地址</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据加工单位自动填写' />
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
                  <FormLabel>联系人电话</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据加工单位自动填写' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <FormField
                  control={form.control}
                  name='data.basicInfo.processingProject'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>加工项目</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} placeholder='请选择加工项目' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isEditable && (
                <ResourceSelectButton
                  resourceName='银隆加工项目表'
                  appId=''
                  selectionMode='single'
                  onSelect={handleSelectProject}
                  buttonText='选择项目'
                  buttonProps={{
                    className: "gap-2",
                    endContent: <Icon icon='mdi:table-search' />,
                  }}
                />
              )}
            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <FormField
                  control={form.control}
                  name='data.basicInfo.manufacturer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>加工单位</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} placeholder='请选择或输入加工单位' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditable && (
                <ResourceSelectButton
                  resourceName='银隆加工单位表格表'
                  appId=''
                  selectionMode='single'
                  onSelect={handleSelectManufacturer}
                  buttonText='选择加工单位'
                  buttonProps={{
                    className: "gap-2",
                    endContent: <Icon icon='mdi:table-search' />,
                  }}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name='data.basicInfo.manufacturerContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} placeholder='根据加工单位自动填写' />
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
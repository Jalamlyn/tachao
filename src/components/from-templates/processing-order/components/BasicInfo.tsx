import React, { useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { Manufacturer } from "../types/ProcessingOrder"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"

interface BasicInfoProps {
  form: UseFormReturn<any>
  manufacturers: Manufacturer[]
  isEditable: boolean
}

const BasicInfo: React.FC<BasicInfoProps> = ({ form, manufacturers, isEditable }) => {
  const handleManufacturerChange = useCallback(
    (value: string) => {
      const selectedManufacturer = manufacturers.find((m) => m.data_id === value)
      if (selectedManufacturer) {
        console.log(selectedManufacturer.address)
        form.setValue("data.basicInfo.manufacturerId", value)
        form.setValue("data.basicInfo.manufacturerName", selectedManufacturer.manufacturerName)
        form.setValue("data.basicInfo.address", selectedManufacturer.address)
        form.setValue("data.basicInfo.contactMethod", selectedManufacturer.contactMethod)
        form.trigger("data.basicInfo")
      }
    },
    [manufacturers, form]
  )

  return (
    <Card>
      <CardContent>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>基本信息</h2>
          {isEditable && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='gap-2'
              onClick={() =>
                form.reset({
                  ...form.getValues(),
                  data: {
                    ...form.getValues().data,
                    basicInfo: {
                      ...form.getValues().data.basicInfo,
                      orderDate: new Date().toISOString().split("T")[0],
                    },
                  },
                })
              }
            >
              <Icon icon='mdi:refresh' className='w-4 h-4' />
              <span>重置日期</span>
            </Button>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='data.basicInfo.manufacturerId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>选择加工厂商</FormLabel>
                <Select onValueChange={handleManufacturerChange} value={field.value} disabled={!isEditable}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='选择加工厂商'>
                        {manufacturers.find((m) => m.data_id === field.value)?.manufacturerName || "选择加工厂商"}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.data_id} value={manufacturer.data_id}>
                        {manufacturer.manufacturerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='data.basicInfo.orderDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
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
            name='data.basicInfo.address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>加工厂商地址</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='加工厂商地址' disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='data.basicInfo.contactMethod'
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系方式</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='联系方式' disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='data.basicInfo.department'
            render={({ field }) => (
              <FormItem>
                <FormLabel>所属部门</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='选择所属部门' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='production'>生产部</SelectItem>
                    <SelectItem value='procurement'>采购部</SelectItem>
                    <SelectItem value='quality'>质量部</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='data.basicInfo.responsiblePerson'
            render={({ field }) => (
              <FormItem>
                <FormLabel>负责人</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='负责人' disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default BasicInfo
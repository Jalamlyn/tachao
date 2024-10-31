"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"

interface BasicInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const BasicInfo: React.FC<BasicInfoProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h2 className='text-lg font-semibold mb-4'>销售订单基本信息</h2>
        <p className='text-sm text-gray-500 mb-4'>销售订单通过标签页，可以一站式完成所有销售业务流程</p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='data.basicInfo.signDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>订单签订日期</FormLabel>
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
            name='data.basicInfo.deliveryDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>订单交付日期</FormLabel>
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
                      disabled={(date) => date < new Date()}
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
            name='data.basicInfo.department'
            render={({ field }) => (
              <FormItem>
                <FormLabel>销售归属部门</FormLabel>
                <FormControl>
                  {isEditable ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='选择销售归属部门' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='市场部'>市场部</SelectItem>
                        <SelectItem value='销售部'>销售部</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input type='text' value={field.value} disabled placeholder='销售归属部门' />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='data.basicInfo.salesperson'
            render={({ field }) => (
              <FormItem>
                <FormLabel>销售负责人</FormLabel>
                <FormControl>
                  {isEditable ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='选择销售负责人' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='王老五'>王老五</SelectItem>
                        <SelectItem value='王老二'>王老二</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input type='text' value={field.value} disabled placeholder='销售负责人' />
                  )}
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
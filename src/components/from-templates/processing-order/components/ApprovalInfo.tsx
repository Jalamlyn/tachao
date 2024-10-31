import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"

interface ApprovalInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const ApprovalInfo: React.FC<ApprovalInfoProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">审批信息</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.approvalInfo.responsiblePerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>负责人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.approvalInfo.confirmationPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.approvalInfo.reviewPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>审核人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.approvalInfo.fillPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>填表人</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.approvalInfo.approvalDate"
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>审批日期</FormLabel>
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
                        disabled={(date) => date > new Date()}
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
              name="data.approvalInfo.approvalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>审批状态</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!isEditable}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择审批状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">待审批</SelectItem>
                      <SelectItem value="approved">已审批</SelectItem>
                      <SelectItem value="rejected">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="data.approvalInfo.comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>审批意见</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入审批意见"
                    disabled={!isEditable}
                    className="min-h-[100px]"
                  />
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

export default ApprovalInfo
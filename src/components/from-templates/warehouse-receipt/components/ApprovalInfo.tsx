import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { APPROVAL_STATUS_OPTIONS, INSPECTION_RESULT_OPTIONS } from "../types/WarehouseReceipt"

interface ApprovalInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const ApprovalInfo: React.FC<ApprovalInfoProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">审批信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data.approvalInfo.status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>审批状态</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择审批状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {APPROVAL_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="data.approvalInfo.approver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>审批人</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.approvalInfo.approvalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>审批日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isEditable}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
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
            name="data.approvalInfo.qualityInspector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>质检员</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.approvalInfo.inspectionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>检验日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isEditable}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
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
            name="data.approvalInfo.inspectionResult"
            render={({ field }) => (
              <FormItem>
                <FormLabel>检验结果</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择检验结果" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INSPECTION_RESULT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <FormField
            control={form.control}
            name="data.approvalInfo.approvalComments"
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

          <FormField
            control={form.control}
            name="data.approvalInfo.inspectionComments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>检验意见</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入检验意见"
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
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
import { RECEIPT_TYPE_OPTIONS } from "../types/WarehouseReceipt"

interface BasicInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const BasicInfo: React.FC<BasicInfoProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data.basicInfo.receiptDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>入库日期</FormLabel>
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
            name="data.basicInfo.receiptType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>入库类型</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择入库类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECEIPT_TYPE_OPTIONS.map((option) => (
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
            name="data.basicInfo.department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>部门</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="warehouse">仓储部</SelectItem>
                    <SelectItem value="production">生产部</SelectItem>
                    <SelectItem value="quality">质检部</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.basicInfo.responsiblePerson"
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
            name="data.basicInfo.supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>供应商</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.basicInfo.sourceDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>来源单据</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择来源单据" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="purchaseOrder">采购订单</SelectItem>
                    <SelectItem value="productionOrder">生产订单</SelectItem>
                    <SelectItem value="returnOrder">退货单</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.basicInfo.sourceDocumentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>来源单据号</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name="data.basicInfo.remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>备注</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入备注信息"
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

export default BasicInfo
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"

interface WarehouseInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ form, isEditable }) => {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">仓库信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data.warehouseInfo.warehouseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>仓库编码</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.warehouseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>仓库名称</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>库区</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.shelf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>货架号</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>库位号</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>温度要求</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} placeholder="例如：18-25℃" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.humidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>湿度要求</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} placeholder="例如：45-75%" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.operator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>操作员</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.checkPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>复核人</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.warehouseInfo.receiveTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>收货时间</FormLabel>
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
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name="data.warehouseInfo.storageRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>存储要求</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入特殊存储要求"
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

export default WarehouseInfo
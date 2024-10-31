import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Button as ShadButton } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"

interface DeliveryPlanProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const DeliveryPlan: React.FC<DeliveryPlanProps> = ({ form, isEditable }) => {
  const deliveryPlan = form.watch("data.deliveryPlan")

  const handleAddDeliveryPlan = () => {
    const currentPlans = form.getValues("data.deliveryPlan.plans") || []
    const newPlan = {
      batch: "",
      plannedDate: "",
      content: "",
    }
    form.setValue("data.deliveryPlan.plans", [...currentPlans, newPlan], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const handleDeleteDeliveryPlan = (index: number) => {
    const currentPlans = form.getValues("data.deliveryPlan.plans") || []
    const updatedPlans = currentPlans.filter((_, i) => i !== index)
    form.setValue("data.deliveryPlan.plans", updatedPlans, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  return (
    <Card>
      <CardContent>
        <h3 className='text-lg font-semibold mb-4'>到货计划</h3>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name="data.deliveryPlan.address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="送货地址"
                    disabled={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.deliveryPlan.detailedAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="送货地址详细"
                    disabled={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>送货批次</TableHead>
                <TableHead>计划送货日期</TableHead>
                <TableHead>计划送货内容备注</TableHead>
                {isEditable && <TableHead>操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryPlan?.plans?.map((plan: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.deliveryPlan.plans.${index}.batch`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            {isEditable ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择批次" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="整批">整批</SelectItem>
                                  <SelectItem value="第一批">第一批</SelectItem>
                                  <SelectItem value="第二批">第二批</SelectItem>
                                  <SelectItem value="第三批">第三批</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input type="text" value={field.value} disabled />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.deliveryPlan.plans.${index}.plannedDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            {isEditable ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <ShadButton
                                    variant={"outline"}
                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                  >
                                    {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </ShadButton>
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
                            ) : (
                              <Input
                                type="text"
                                value={field.value ? format(new Date(field.value), "PPP") : ""}
                                disabled
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.deliveryPlan.plans.${index}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              disabled={!isEditable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  {isEditable && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDeliveryPlan(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Icon icon="mdi:delete" className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isEditable && (
            <Button onClick={handleAddDeliveryPlan} variant="outline" type="button">
              <Icon icon="mdi:plus" className="mr-2" />
              添加送货计划
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DeliveryPlan
import React, { useEffect } from "react"
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

interface FinancialTermsProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const FinancialTerms: React.FC<FinancialTermsProps> = ({ form, isEditable }) => {
  const financialTerms = form.watch("data.financialTerms")
  const totalAmount = form.watch("data.totalAmount")
  const discountAmount = form.watch("data.discountAmount")

  const handleAddPaymentPlan = () => {
    const currentPlans = form.getValues("data.financialTerms.paymentPlans") || []
    const newPlan = {
      item: "",
      percentage: 0,
      amount: 0,
      method: "",
      plannedDate: "",
      notes: "",
    }
    form.setValue("data.financialTerms.paymentPlans", [...currentPlans, newPlan], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const handleDeletePaymentPlan = (index: number) => {
    const currentPlans = form.getValues("data.financialTerms.paymentPlans") || []
    const updatedPlans = currentPlans.filter((_, i) => i !== index)
    form.setValue("data.financialTerms.paymentPlans", updatedPlans, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  // 更新收款金额的函数
  const updatePaymentAmount = (index: number, percentage: number) => {
    const actualTotalAmount = totalAmount - (discountAmount || 0)
    const amount = (actualTotalAmount * percentage) / 100
    const currentPlans = form.getValues("data.financialTerms.paymentPlans")
    currentPlans[index].amount = amount
    form.setValue("data.financialTerms.paymentPlans", currentPlans, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  // 处理收款比例变化
  const handlePercentageChange = (index: number, value: number) => {
    const currentPlans = form.getValues("data.financialTerms.paymentPlans")
    currentPlans[index].percentage = value
    form.setValue("data.financialTerms.paymentPlans", currentPlans, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    updatePaymentAmount(index, value)
  }

  // 监听总金额和优惠金额的变化，更新所有收款计划的金额
  useEffect(() => {
    const plans = form.getValues("data.financialTerms.paymentPlans") || []
    plans.forEach((plan, index) => {
      if (plan.percentage) {
        updatePaymentAmount(index, plan.percentage)
      }
    })
  }, [totalAmount, discountAmount])

  return (
    <Card>
      <CardContent>
        <h3 className='text-lg font-semibold mb-4'>财务条款</h3>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name="data.financialTerms.settlementPeriod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="结算期限"
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
                <TableHead>收款项</TableHead>
                <TableHead>收款比例%</TableHead>
                <TableHead>收款金额</TableHead>
                <TableHead>收款方式</TableHead>
                <TableHead>计划收款日期</TableHead>
                <TableHead>备注</TableHead>
                {isEditable && <TableHead>操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialTerms?.paymentPlans?.map((plan: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.financialTerms.paymentPlans.${index}.item`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            {isEditable ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择收款项" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="整批货款">整批货款</SelectItem>
                                  <SelectItem value="定金">定金</SelectItem>
                                  <SelectItem value="第一批货款">第一批货款</SelectItem>
                                  <SelectItem value="第二批货款">第二批货款</SelectItem>
                                  <SelectItem value="第三批货款">第三批货款</SelectItem>
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
                      name={`data.financialTerms.paymentPlans.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => handlePercentageChange(index, Number(e.target.value))}
                              disabled={!isEditable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>{plan.amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.financialTerms.paymentPlans.${index}.method`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            {isEditable ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择收款方式" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="网上转账">网上转账</SelectItem>
                                  <SelectItem value="支付宝">支付宝</SelectItem>
                                  <SelectItem value="微信支付">微信支付</SelectItem>
                                  <SelectItem value="电汇">电汇</SelectItem>
                                  <SelectItem value="现金">现金</SelectItem>
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
                      name={`data.financialTerms.paymentPlans.${index}.plannedDate`}
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
                      name={`data.financialTerms.paymentPlans.${index}.notes`}
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
                        onClick={() => handleDeletePaymentPlan(index)}
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
            <Button onClick={handleAddPaymentPlan} variant="outline" type="button">
              <Icon icon="mdi:plus" className="mr-2" />
              添加收款计划
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FinancialTerms
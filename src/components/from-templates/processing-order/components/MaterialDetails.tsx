import React, { useCallback, useEffect } from "react"
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
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import numberToWords from "@/utils/numberToWords"
import { MaterialDetail } from "../types/ProcessingOrder"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { cn } from "@/theme/cn"

interface MaterialDetailsProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const MaterialDetails: React.FC<MaterialDetailsProps> = ({ form, isEditable }) => {
  const materialDetails = form.watch("data.materialDetails")

  const handleQuantityChange = useCallback((index: number, value: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    const material = currentMaterials[index]
    material.quantity = value
    material.totalPrice = value * material.unitPrice
    form.setValue(`data.materialDetails.${index}`, material)
    updateTotals(currentMaterials)
  }, [form])

  const handleUnitPriceChange = useCallback((index: number, value: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    const material = currentMaterials[index]
    material.unitPrice = value
    material.totalPrice = value * material.quantity
    form.setValue(`data.materialDetails.${index}`, material)
    updateTotals(currentMaterials)
  }, [form])

  const updateTotals = useCallback((materials: MaterialDetail[]) => {
    const totalAmount = materials.reduce((sum, material) => sum + (material.totalPrice || 0), 0)
    form.setValue("data.totalAmount", totalAmount)
    form.setValue("data.totalAmountInWords", numberToWords(totalAmount))
  }, [form])

  const handleAddMaterial = useCallback(() => {
    const currentMaterials = form.getValues("data.materialDetails") || []
    form.setValue("data.materialDetails", [
      ...currentMaterials,
      {
        id: Date.now().toString(),
        materialName: "",
        specification: "",
        unit: "个",
        quantity: 0,
        processingProcess: "",
        unitPrice: 0,
        totalPrice: 0,
        deliveryDate: new Date().toISOString().split('T')[0],
        status: "pending",
      },
    ])
  }, [form])

  const handleDeleteMaterial = useCallback((index: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    currentMaterials.splice(index, 1)
    form.setValue("data.materialDetails", currentMaterials)
    updateTotals(currentMaterials)
  }, [form, updateTotals])

  useEffect(() => {
    if (materialDetails) {
      updateTotals(materialDetails)
    }
  }, [materialDetails, updateTotals])

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">物料明细</h2>
            <p className="text-sm text-gray-500 mt-1">
              请填写需要加工的物料信息，包括规格、数量等
            </p>
          </div>
          {isEditable && (
            <Button
              onClick={handleAddMaterial}
              variant="outline"
              type="button"
              className="gap-2"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              添加物料
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">序号</TableHead>
                <TableHead>物料名称</TableHead>
                <TableHead>规格</TableHead>
                <TableHead>单位</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>加工工序</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>总价</TableHead>
                <TableHead>交期</TableHead>
                <TableHead>状态</TableHead>
                {isEditable && <TableHead className="w-[100px]">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialDetails?.map((material: MaterialDetail, index: number) => (
                <TableRow key={material.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.materialName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.specification`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditable}
                            >
                              <SelectTrigger className="w-[80px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="个">个</SelectItem>
                                <SelectItem value="件">件</SelectItem>
                                <SelectItem value="套">套</SelectItem>
                                <SelectItem value="米">米</SelectItem>
                                <SelectItem value="千克">千克</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                              disabled={!isEditable}
                              className="w-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.processingProcess`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => handleUnitPriceChange(index, Number(e.target.value))}
                              disabled={!isEditable}
                              className="w-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>{material.totalPrice?.toFixed(2)}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.deliveryDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[130px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={!isEditable}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "yyyy-MM-dd")
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
                                onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditable}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">待处理</SelectItem>
                                <SelectItem value="processing">处理中</SelectItem>
                                <SelectItem value="completed">已完成</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  {isEditable && (
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMaterial(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Icon icon="mdi:delete" className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>删除此物料</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">加工费用总计（小写）/元：</p>
            <p className="text-lg font-medium text-primary">
              {form.watch("data.totalAmount")?.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">加工费用总计（大写）：</p>
            <p className="text-lg font-medium text-primary">
              {form.watch("data.totalAmountInWords")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MaterialDetails
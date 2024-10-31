import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"
import { QUALITY_STATUS_OPTIONS } from "../types/WarehouseReceipt"

interface MaterialDetailsProps {
  form: UseFormReturn<any>
  isEditable: boolean
  onAddMaterial: () => void
  onDeleteMaterial: (index: number) => void
  onQuantityChange: (index: number, value: number) => void
  onUnitPriceChange: (index: number, value: number) => void
}

const MaterialDetails: React.FC<MaterialDetailsProps> = ({
  form,
  isEditable,
  onAddMaterial,
  onDeleteMaterial,
  onQuantityChange,
  onUnitPriceChange,
}) => {
  const materialDetails = form.watch("data.materialDetails")

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>物料明细</h2>
          {isEditable && (
            <Button onClick={onAddMaterial} variant='outline' className='gap-2'>
              <Icon icon='mdi:plus' className='w-4 h-4' />
              添加物料
            </Button>
          )}
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>物料编码</TableHead>
                <TableHead>物料名称</TableHead>
                <TableHead>规格型号</TableHead>
                <TableHead>单位</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>总价</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>生产日期</TableHead>
                <TableHead>有效期</TableHead>
                <TableHead>库位</TableHead>
                <TableHead>质检状态</TableHead>
                <TableHead>备注</TableHead>
                {isEditable && <TableHead>操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialDetails?.map((material: any, index: number) => (
                <TableRow key={material.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.materialCode`}
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
                      name={`data.materialDetails.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) => onQuantityChange(index, Number(e.target.value))}
                              disabled={!isEditable}
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
                      name={`data.materialDetails.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) => onUnitPriceChange(index, Number(e.target.value))}
                              disabled={!isEditable}
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
                      name={`data.materialDetails.${index}.batchNumber`}
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
                      name={`data.materialDetails.${index}.productionDate`}
                      render={({ field }) => (
                        <FormItem>
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
                                  {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>选择日期</span>}
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
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.expirationDate`}
                      render={({ field }) => (
                        <FormItem>
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
                                  {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>选择日期</span>}
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
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.location`}
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
                      name={`data.materialDetails.${index}.qualityStatus`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='选择状态' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {QUALITY_STATUS_OPTIONS.map((option) => (
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
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`data.materialDetails.${index}.remarks`}
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
                  {isEditable && (
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDeleteMaterial(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <Icon icon='mdi:delete' className='w-5 h-5' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default MaterialDetails

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/button"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { TABLE_COLUMNS } from "../../constants/productDetailsConstants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Chip } from "@nextui-org/react"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { message } from "@/components/Message"

interface ProductDetailsTableProps {
  form: UseFormReturn<any>
  isEditable: boolean
  onQuantityChange: (index: number, value: number, type: "inbound" | "outbound") => void
  onUnitPriceChange: (index: number, value: number) => void
  onDeleteProduct: (index: number) => void
}

const ProductDetailsTable: React.FC<ProductDetailsTableProps> = ({
  form,
  isEditable,
  onQuantityChange,
  onUnitPriceChange,
  onDeleteProduct,
}) => {
  const productDetails = form.watch("data.productDetails")

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: "inbound" | "outbound"
  ) => {
    const value = e.target.value
    form.setValue(`data.productDetails.${index}.${type}Quantity`, value)

    if (type === "outbound") {
      form.setValue(`data.productDetails.${index}.quantity`, value) // 保持兼容性
    }

    const numericValue = Number(value) || 0
    onQuantityChange(index, numericValue, type)
  }

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    form.setValue(`data.productDetails.${index}.unitPrice`, value)
    const numericValue = Number(value) || 0
    onUnitPriceChange(index, numericValue)
  }

  const handleSelectServices = (selectedServices: any[], index: number) => {
    const serviceItems = selectedServices.map((service) => service.服务项目 || "")
    form.setValue(`data.productDetails.${index}.serviceItems`, serviceItems)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".dwg")) {
      message.error("请上传CAD图纸(.dwg)文件")
      return
    }

    try {
      // TODO: 实现文件上传逻辑
      const fileId = `file_${Date.now()}`
      const fileUrl = URL.createObjectURL(file)

      form.setValue(`data.productDetails.${index}.cadAttachment`, {
        fileId,
        fileName: file.name,
        fileUrl,
      })
    } catch (error) {
      console.error("Upload error:", error)
      message.error("上传失败，请重试")
    }
  }

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            {TABLE_COLUMNS.map((column) => (
              <TableHead key={column.key} className={`min-w-[${column.width}]`}>
                {column.label}
              </TableHead>
            ))}
            {isEditable && <TableHead className='min-w-[60px]'>操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productDetails?.map((product: any, index: number) => (
            <TableRow key={product.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.productName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className='min-w-[180px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.model`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className='min-w-[150px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div className='flex flex-wrap gap-1'>
                    {product.serviceItems?.map((service: string, sIndex: number) => (
                      <Chip key={sIndex} size='sm' variant='flat' color='primary'>
                        {service}
                      </Chip>
                    ))}
                  </div>
                  {isEditable && (
                    <ResourceSelectButton
                      resourceName='银隆服务项目表格表'
                      appId=''
                      onSelect={(services) => handleSelectServices(services, index)}
                      buttonText='选择'
                      buttonProps={{
                        size: "sm",
                        variant: "light",
                        isIconOnly: true,
                        className: "w-8 h-8",
                      }}
                    >
                      <Icon icon='mdi:plus' className='w-4 h-4' />
                    </ResourceSelectButton>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className='min-w-[60px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.outboundQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='1'
                          onChange={(e) => handleQuantityChange(e, index, "outbound")}
                          disabled={!isEditable}
                          className='text-right font-mono min-w-[80px]'
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
                  name={`data.productDetails.${index}.inboundQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='1'
                          onChange={(e) => handleQuantityChange(e, index, "inbound")}
                          disabled={!isEditable}
                          className='text-right font-mono min-w-[80px]'
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
                  name={`data.productDetails.${index}.defectiveCount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='1'
                          disabled={!isEditable}
                          className='text-right font-mono min-w-[80px]'
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
                  name={`data.productDetails.${index}.squareMeters`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='0.01'
                          disabled={!isEditable}
                          className='text-right font-mono min-w-[80px]'
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
                  name={`data.productDetails.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='0.0001'
                          onChange={(e) => handleUnitPriceChange(e, index)}
                          disabled={!isEditable}
                          className='text-right font-mono min-w-[100px]'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell className='text-right font-mono min-w-[100px]'>{product.totalPrice?.toFixed(2)}</TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.invoiceNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className='min-w-[120px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.invoiceDate`}
                  render={({ field }) => (
                    <FormItem>
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
                              {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>选择日期</span>}
                              <Icon icon='mdi:calendar' className='ml-auto h-4 w-4 opacity-50' />
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
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {isEditable ? (
                    <FormField
                      control={form.control}
                      name={`data.productDetails.${index}.cadAttachment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className='flex items-center gap-2'>
                              <Input
                                type='file'
                                accept='.dwg'
                                onChange={(e) => handleFileUpload(e, index)}
                                className='hidden'
                                id={`cad-upload-${index}`}
                              />
                              <label
                                htmlFor={`cad-upload-${index}`}
                                className='cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-700'
                              >
                                <Icon icon='mdi:upload' className='w-4 h-4' />
                                {field.value?.fileName || "上传CAD"}
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    product.cadAttachment?.fileName && (
                      <Button
                        size='sm'
                        variant='light'
                        onClick={() =>
                          handleDownloadFile(product.cadAttachment.fileUrl, product.cadAttachment.fileName)
                        }
                        className='gap-1'
                      >
                        <Icon icon='mdi:download' className='w-4 h-4' />
                        {product.cadAttachment.fileName}
                      </Button>
                    )
                  )}
                </div>
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.remarks`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className='min-w-[120px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              {isEditable && (
                <TableCell>
                  <Button
                    isIconOnly
                    color='danger'
                    variant='light'
                    onClick={() => onDeleteProduct(index)}
                    className='w-8 h-8'
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
  )
}

export default ProductDetailsTable

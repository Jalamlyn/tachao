import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/button"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { TABLE_COLUMNS } from "../../constants/productDetailsConstants"

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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, type: "inbound" | "outbound") => {
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
                        <Input {...field} disabled={!isEditable} className="min-w-[180px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`data.productDetails.${index}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="min-w-[60px]" />
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
                          type="number"
                          min="0"
                          step="1"
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
                          type="number"
                          min="0"
                          step="1"
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
                  name={`data.productDetails.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.0001"
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
                  name={`data.productDetails.${index}.remarks`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="min-w-[120px]" />
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
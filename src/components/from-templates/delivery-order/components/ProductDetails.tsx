import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/button"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { TABLE_COLUMNS } from "../constants/deliveryOrderConstants"
import { motion, AnimatePresence } from "framer-motion"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"

interface ProductDetailsProps {
  form: UseFormReturn<any>
  isEditable: boolean
  onQuantityChange: (index: number, value: number) => void
  onUnitPriceChange: (index: number, value: number) => void
  onAddProduct: () => void
  onDeleteProduct: (index: number) => void
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  form,
  isEditable,
  onQuantityChange,
  onUnitPriceChange,
  onAddProduct,
  onDeleteProduct,
}) => {
  const productDetails = form.watch("data.productDetails")

  const handleSelectProducts = (selectedProducts: any[]) => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProducts = selectedProducts.map(product => ({
      id: Date.now().toString() + Math.random(),
      productName: product.产品名称 || "",
      specification: product.规格 || "",
      unit: product.单位 || "",
      quantity: "0",
      unitPrice: "0",
      totalPrice: 0,
      remarks: "",
    }))

    form.setValue("data.productDetails", [...currentProducts, ...newProducts])
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    form.setValue(`data.productDetails.${index}.quantity`, value)
    const numericValue = Number(value) || 0
    onQuantityChange(index, numericValue)
  }

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    form.setValue(`data.productDetails.${index}.unitPrice`, value)
    const numericValue = Number(value) || 0
    onUnitPriceChange(index, numericValue)
  }

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>产品明细</h2>
          {isEditable && (
            <div className='flex gap-2'>
              <Button
                onClick={onAddProduct}
                variant='flat'
                className='gap-2'
                endContent={<Icon icon='mdi:plus' />}
              >
                添加产品
              </Button>
              <ResourceSelectButton
                resourceName='产品资料表'
                appId=''
                onSelect={handleSelectProducts}
                buttonText='从产品表选择'
                buttonProps={{
                  variant: "flat",
                  className: "gap-2",
                  endContent: <Icon icon='mdi:table-search' />,
                }}
              />
            </div>
          )}
        </div>

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
              <AnimatePresence mode="popLayout">
                {productDetails?.map((product: any, index: number) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
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
                        name={`data.productDetails.${index}.specification`}
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
                        name={`data.productDetails.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="1"
                                onChange={(e) => handleQuantityChange(e, index)}
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
                                step="0.01"
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
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">总金额：</p>
            <p>{form.watch("data.totalAmount")?.toFixed(2)} 元</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">金额大写：</p>
            <p>{form.watch("data.totalAmountInWords")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductDetails
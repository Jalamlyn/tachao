import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/button"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { SalesOrderFormValues } from "../schema"
import { INITIAL_PRODUCT } from "../constants/salesOrderConstants"
import { TABLE_COLUMNS } from "../types/SalesOrder"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import numberToWords from "@/utils/numberToWords"

interface ProductDetailsProps {
  form: UseFormReturn<SalesOrderFormValues>
  isEditable: boolean
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ form, isEditable }) => {
  const productDetails = form.watch("data.productDetails")

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number(e.target.value) || 0
    form.setValue(`data.productDetails.${index}.quantity`, value)
    updateTotalPrice(index)
  }

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number(e.target.value) || 0
    form.setValue(`data.productDetails.${index}.unitPrice`, value)
    updateTotalPrice(index)
  }

  const updateTotalPrice = (index: number) => {
    const products = form.getValues("data.productDetails")
    const product = products[index]
    const quantity = Number(product.quantity) || 0
    const unitPrice = Number(product.unitPrice) || 0
    const totalPrice = Number((quantity * unitPrice).toFixed(2))
    
    form.setValue(`data.productDetails.${index}.totalPrice`, totalPrice)
    updateTotals(products)
  }

  const updateTotals = (products: any[]) => {
    const totalAmount = products.reduce((sum, product) => {
      const totalPrice = Number(product.totalPrice) || 0
      return sum + totalPrice
    }, 0)
    
    const roundedTotal = Number(totalAmount.toFixed(2))
    form.setValue("data.totalAmount", roundedTotal)
    form.setValue("data.totalAmountInWords", numberToWords(roundedTotal))
  }

  const handleAddProduct = () => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProduct = {
      ...INITIAL_PRODUCT,
      id: Date.now().toString(),
    }
    form.setValue("data.productDetails", [...currentProducts, newProduct])
  }

  const handleDeleteProduct = (index: number) => {
    const currentProducts = form.getValues("data.productDetails")
    const updatedProducts = currentProducts.filter((_, i) => i !== index)
    form.setValue("data.productDetails", updatedProducts)
    updateTotals(updatedProducts)
  }

  const handleSelectProducts = (selectedProducts: any[]) => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProducts = selectedProducts.map(product => ({
      ...INITIAL_PRODUCT,
      id: Date.now().toString() + Math.random(),
      materialCode: product.物料代码 || "",
      nc5tCode: product.NC5T编码 || "",productName: product.产品名称 || "",
      specification: product.料号 || "",
      unit: product.单位 || "",
    }))

    form.setValue("data.productDetails", [...currentProducts, ...newProducts])
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>产品明细</h2>
        {isEditable && (
          <div className="flex gap-2">
            <Button
              onClick={handleAddProduct}
              variant="flat"
              endContent={<Icon icon="mdi:plus" />}
            >
              添加产品
            </Button>
            <ResourceSelectButton
              resourceName='银隆加工物料表'
              appId=''
              onSelect={handleSelectProducts}
              buttonText='从产品表选择'
              buttonProps={{
                variant: "flat",
                endContent: <Icon icon="mdi:table-search" />,
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
            {productDetails?.map((product: any, index: number) => (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`data.productDetails.${index}.materialCode`}
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
                    name={`data.productDetails.${index}.nc5tCode`}
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
                    name={`data.productDetails.${index}.productName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} className="min-w-[200px]" />
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
                          <Input {...field} disabled={!isEditable} className="min-w-[80px]" />
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
                            className='text-right font-mono min-w-[100px]'
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
                            className='text-right font-mono min-w-[120px]'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className='text-right font-mono min-w-[120px]'>{product.totalPrice?.toFixed(2)}</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`data.productDetails.${index}.deliveryDate`}
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
                    name={`data.productDetails.${index}.remarks`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} className="min-w-[150px]" />
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
                      onClick={() => handleDeleteProduct(index)}
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
    </div>
  )
}

export default ProductDetails
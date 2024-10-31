import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { ProductData } from "../types/SalesOrder"
import { handleProductSelection, updateTotals, handleDiscountCalculation, formatAmount } from "../utils/formUtils"

interface ProductDetailsProps {
  form: UseFormReturn<any>
  products: ProductData[]
  isEditable: boolean
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ form, products, isEditable }) => {
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: ProductData }>({})
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [sellingPrices, setSellingPrices] = useState<{ [key: string]: number }>({})

  const productDetails = form.watch("data.productDetails")
  const totalAmount = form.watch("data.totalAmount")
  const discountAmount = form.watch("data.discountAmount")
  const discountRate = form.watch("data.discountRate")
  const grossProfitRate = form.watch("data.grossProfitRate")

  useEffect(() => {
    if (productDetails) {
      const initialProducts: { [key: string]: ProductData } = {}
      const initialQuantities: { [key: string]: number } = {}
      const initialPrices: { [key: string]: number } = {}

      productDetails.forEach((product: any, index: number) => {
        if (product.data_id) {
          initialProducts[index] = product
          initialQuantities[index] = product.quantity || 0
          initialPrices[index] = parseFloat(product["销售单价(含税)/元"]) || 0
        }
      })

      setSelectedProducts(initialProducts)
      setQuantities(initialQuantities)
      setSellingPrices(initialPrices)
    }
  }, [])

  const handleQuantityChange = (index: number, value: number) => {
    const currentProducts = form.getValues("data.productDetails")
    const product = currentProducts[index]
    const sellingPrice = sellingPrices[index] || parseFloat(product["销售单价(含税)/元"])

    setQuantities((prev) => ({
      ...prev,
      [index]: value,
    }))

    currentProducts[index] = {
      ...product,
      quantity: value,
      totalPrice: value * sellingPrice,
      productOriginalTotalPrice: value * sellingPrice,
    }

    form.setValue("data.productDetails", currentProducts, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    updateTotals(form, currentProducts)
  }

  const handleSellingPriceChange = (index: number, value: number) => {
    const currentProducts = form.getValues("data.productDetails")
    const product = currentProducts[index]

    setSellingPrices((prev) => ({
      ...prev,
      [index]: value,
    }))

    currentProducts[index] = {
      ...product,
      ["销售单价(含税)/元"]: value.toString(),
      totalPrice: (quantities[index] || product.quantity) * value,
      productOriginalTotalPrice: (quantities[index] || product.quantity) * value,
    }

    form.setValue("data.productDetails", currentProducts, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    updateTotals(form, currentProducts)
  }

  const handleDeleteProduct = (index: number) => {
    const currentProducts = form.getValues("data.productDetails")
    currentProducts.splice(index, 1)
    form.setValue("data.productDetails", currentProducts, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    updateTotals(form, currentProducts)

    const newSelectedProducts = { ...selectedProducts }
    const newQuantities = { ...quantities }
    const newSellingPrices = { ...sellingPrices }

    delete newSelectedProducts[index]
    delete newQuantities[index]
    delete newSellingPrices[index]

    setSelectedProducts(newSelectedProducts)
    setQuantities(newQuantities)
    setSellingPrices(newSellingPrices)
  }

  const handleAddProduct = () => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProduct = { isProductSelected: false }
    form.setValue("data.productDetails", [...currentProducts, newProduct], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  return (
    <Card>
      <CardContent>
        <h2 className='text-xl font-semibold mb-4'>销售产品明细</h2>
        <p className='text-sm text-gray-500 mb-2'>请选择需要的产品，并在选择完毕后填写销售数量！</p>
        <p className='text-sm text-red-500 mb-4'>毛利率低于 35%，不能通过</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>序号</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>产品编码</TableHead>
              <TableHead>规格型号</TableHead>
              <TableHead>单位</TableHead>
              <TableHead>销售数量</TableHead>
              <TableHead>成本单价/元</TableHead>
              <TableHead>销售单价(含税)</TableHead>
              <TableHead>产品原价合计(含税)/元</TableHead>
              <TableHead>增值税税率</TableHead>
              <TableHead>销售单价(不含税)</TableHead>
              <TableHead>税额</TableHead>
              <TableHead>优惠金额</TableHead>
              <TableHead>总价</TableHead>
              {isEditable && <TableHead>操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {productDetails?.map((product: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`data.productDetails.${index}.data_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {isEditable ? (
                            <Select
                              onValueChange={(value) =>
                                handleProductSelection(
                                  form,
                                  index,
                                  products.find((p) => p.data_id === value)!,
                                  quantities,
                                  sellingPrices
                                )
                              }
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='选择产品' />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.data_id} value={p.data_id}>
                                    {p.产品名称}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input type='text' value={product.产品名称} disabled />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>{product.产品编码}</TableCell>
                <TableCell>{product.规格型号}</TableCell>
                <TableCell>{product.单位}</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`data.productDetails.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            disabled={!product.isProductSelected || !isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>{product["成本单价/元"]}</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`data.productDetails.${index}.销售单价(含税)/元`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e) => handleSellingPriceChange(index, Number(e.target.value))}
                            disabled={!product.isProductSelected || !isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>{formatAmount(product.productOriginalTotalPrice || 0)}</TableCell>
                <TableCell>{product["增值税税率 %"]}</TableCell>
                <TableCell>{product["销售单价(不含税)/元"]}</TableCell>
                <TableCell>{product["税额/元"]}</TableCell>
                <TableCell>{formatAmount(product.discountAmount || 0)}</TableCell>
                <TableCell>{formatAmount(product.totalPrice - (product.discountAmount || 0) || 0)}</TableCell>
                {isEditable && (
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteProduct(index)}
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

        {isEditable && (
          <Button onClick={handleAddProduct} variant='outline' className='mt-4' type='button'>
            <Icon icon='mdi:plus' className='mr-2' />
            添加产品
          </Button>
        )}

        <div className='space-y-2 mt-4'>
          <div className='flex justify-between items-center'>
            <p className='font-semibold'>销售原价总额（含税）/元：</p>
            <p>{formatAmount(totalAmount || 0)}</p>
          </div>
          <div className='flex justify-between items-center'>
            <p className='font-semibold'>销售订单金额（含税）/元：</p>
            <p>{formatAmount(totalAmount - discountAmount || 0)}</p>
          </div>
          <div className='flex justify-between items-center'>
            <p className='font-semibold'>销售订单金额大写：</p>
            <p>{form.watch("data.totalAmountInWords")}</p>
          </div>
          <div className='flex justify-between items-center'>
            <p className='font-semibold'>订单毛利率%：</p>
            <p>{formatAmount(grossProfitRate || 0)}%</p>
          </div>
          <div className='flex items-center justify-between space-x-2'>
            <p className='font-semibold'>优惠金额/元：</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FormField
                    control={form.control}
                    name='data.discountAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e) => handleDiscountCalculation(form, Number(e.target.value))}
                            disabled={!isEditable}
                            className='max-w-xs'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>优惠金额默认按金额比例，均摊到各产品</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='flex items-center justify-between'>
            <p className='font-semibold'>整单折扣率%：</p>
            <p>{formatAmount(discountRate || 0)}%</p>
          </div>
          <p className='text-sm text-gray-500'>优惠后的销售订单金额（含税）/销售原价总额（含税）</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductDetails

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { INITIAL_PRODUCT } from "../../constants/productDetailsConstants"
import ProductDetailsTable from "./ProductDetailsTable"
import ProductDetailsActions from "./ProductDetailsActions"
import ProductDetailsTotalInfo from "./ProductDetailsTotalInfo"

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
  const handleSelectProducts = (selectedProducts: any[]) => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProducts = selectedProducts.map(product => ({
      ...INITIAL_PRODUCT,
      id: Date.now().toString() + Math.random(),
      productName: product.产品名称 || "",
      unit: product.单位 || "",
    }))

    form.setValue("data.productDetails", [...currentProducts, ...newProducts])
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold mb-6">产品明细</h2>
        <ProductDetailsTable
          form={form}
          isEditable={isEditable}
          onQuantityChange={onQuantityChange}
          onUnitPriceChange={onUnitPriceChange}
          onDeleteProduct={onDeleteProduct}
        />
        <ProductDetailsActions
          isEditable={isEditable}
          onAddProduct={onAddProduct}
          onSelectProducts={handleSelectProducts}
        />
        <ProductDetailsTotalInfo form={form} />
      </CardContent>
    </Card>
  )
}

export default ProductDetails
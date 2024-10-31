import React from "react"
import { UseFormReturn } from "react-hook-form"

interface ProductDetailsTotalInfoProps {
  form: UseFormReturn<any>
}

const ProductDetailsTotalInfo: React.FC<ProductDetailsTotalInfoProps> = ({ form }) => {
  return (
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
  )
}

export default ProductDetailsTotalInfo
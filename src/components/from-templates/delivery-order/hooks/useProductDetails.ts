import { UseFormReturn } from "react-hook-form"
import { DeliveryOrderFormValues } from "../schema"
import numberToWords from "@/utils/numberToWords"

export const useProductDetails = (form: UseFormReturn<DeliveryOrderFormValues>) => {
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

  const handleQuantityChange = (index: number, value: number) => {
    updateTotalPrice(index)
  }

  const handleUnitPriceChange = (index: number, value: number) => {
    updateTotalPrice(index)
  }

  const handleAddProduct = () => {
    const currentProducts = form.getValues("data.productDetails") || []
    const newProduct = {
      id: Date.now().toString(),
      productName: "",
      specification: "",
      unit: "",
      quantity: "0",
      unitPrice: "0",
      totalPrice: 0,
      remarks: "",
    }
    form.setValue("data.productDetails", [...currentProducts, newProduct])
  }

  const handleDeleteProduct = (index: number) => {
    const currentProducts = form.getValues("data.productDetails")
    const updatedProducts = currentProducts.filter((_, i) => i !== index)
    form.setValue("data.productDetails", updatedProducts)
    updateTotals(updatedProducts)
  }

  return {
    handleQuantityChange,
    handleUnitPriceChange,
    handleAddProduct,
    handleDeleteProduct,
    updateTotals,
  }
}

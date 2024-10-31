import { UseFormReturn } from "react-hook-form"
import { format } from "date-fns"
import { message } from "@/components/Message"
import { Customer, CustomerContact, ProductData } from "../types/SalesOrder"

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// 日期格式化
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return ""
  return format(new Date(date), "PPP")
}

// 金额格式化
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

// 计算折扣率
export const calculateDiscountRate = (originalAmount: number, discountAmount: number): number => {
  if (originalAmount === 0) return 0
  return ((originalAmount - discountAmount) / originalAmount) * 100
}

// 计算毛利率
export const calculateGrossProfit = (sellingPrice: number, costPrice: number): number => {
  if (sellingPrice === 0) return 0
  return ((sellingPrice - costPrice) / sellingPrice) * 100
}

// 处理客户选择
export const handleCustomerSelection = (
  form: UseFormReturn<any>,
  selectedCustomer: Customer,
  fetchContacts: (customerCode: string) => void
): void => {
  if (selectedCustomer) {
    form.setValue("data.customerInfo.customerId", selectedCustomer.data_id)
    form.setValue("data.customerInfo.customerName", selectedCustomer.客户名称)
    form.setValue("data.customerInfo.customerCode", selectedCustomer.客户编码)
    form.setValue("data.customerInfo.contactId", "")
    form.setValue("data.customerInfo.contactName", "")
    form.setValue("data.customerInfo.contactPhone", "")
    form.trigger("data.customerInfo")
    fetchContacts(selectedCustomer.客户编码)
  }
}

// 处理联系人选择
export const handleContactSelection = (form: UseFormReturn<any>, selectedContact: CustomerContact): void => {
  if (selectedContact) {
    form.setValue("data.customerInfo.contactId", selectedContact.data_id)
    form.setValue("data.customerInfo.contactName", selectedContact.联系人姓名)
    form.setValue("data.customerInfo.contactPhone", selectedContact.联系人手机号)
    form.trigger("data.customerInfo")
  }
}

// 处理产品选择
export const handleProductSelection = (
  form: UseFormReturn<any>,
  index: number,
  selectedProduct: ProductData,
  quantities: { [key: string]: number },
  sellingPrices: { [key: string]: number }
): void => {
  if (selectedProduct) {
    const currentProducts = form.getValues("data.productDetails")
    currentProducts[index] = {
      ...selectedProduct,
      quantity: quantities[index] || 0,
      totalPrice: (quantities[index] || 0) * (sellingPrices[index] || parseFloat(selectedProduct["销售单价(含税)/元"])),
      productOriginalTotalPrice:
        (quantities[index] || 0) * (sellingPrices[index] || parseFloat(selectedProduct["销售单价(含税)/元"])),
      isProductSelected: true,
      discountAmount: 0,
    }
    form.setValue("data.productDetails", currentProducts)
    updateTotals(form, currentProducts)
  }
}

// 更新总计
export const updateTotals = (form: UseFormReturn<any>, products: any[]): void => {
  const newTotalAmount = products.reduce((sum, product) => sum + product.totalPrice, 0)
  const newGrossProfitRate =
    ((newTotalAmount -
      products.reduce((sum, product) => sum + parseFloat(product["成本单价/元"]) * product.quantity, 0)) /
      newTotalAmount) *
    100

  form.setValue("data.productDetails", products)
  form.setValue("data.totalAmount", newTotalAmount)
  form.setValue("data.totalAmountInWords", numberToWords(newTotalAmount))
  form.setValue("data.grossProfitRate", newGrossProfitRate)
}

// 处理折扣计算
export const handleDiscountCalculation = (form: UseFormReturn<any>, discountAmount: number): void => {
  const currentProducts = form.getValues("data.productDetails")
  const totalBeforeDiscount = currentProducts.reduce((sum, product) => sum + product.totalPrice, 0)

  if (discountAmount > totalBeforeDiscount) {
    message.error("优惠金额不能大于总金额")
    return
  }

  const newDiscountRate = ((totalBeforeDiscount - discountAmount) / totalBeforeDiscount) * 100

  currentProducts.forEach((product) => {
    const productRatio = product.totalPrice / totalBeforeDiscount
    product.discountAmount = discountAmount * productRatio
  })

  form.setValue("data.discountAmount", discountAmount)
  form.setValue("data.discountRate", newDiscountRate)
  form.setValue("data.productDetails", currentProducts)
}

// 生成订单编号
export const generateOrderNumber = (): string => {
  return `SQ${Date.now()}`
}

// 验证表单数据
export const validateFormData = (form: UseFormReturn<any>): string[] => {
  const errors = form.formState.errors
  const errorMessages: string[] = []

  const collectErrors = (obj: any) => {
    for (const key in obj) {
      if (obj[key]?.message) {
        errorMessages.push(obj[key].message)
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        collectErrors(obj[key])
      }
    }
  }

  collectErrors(errors)
  return errorMessages
}

// 检查财务信息错误
export const hasFinancialErrors = (form: UseFormReturn<any>): boolean => {
  const errors = form.formState.errors
  return !!(errors.data?.invoiceDetails || errors.data?.bankAccount)
}

// 数字转中文大写
export const numberToWords = (num: number): string => {
  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
  const units = ["", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿"]
  const decimal = ["角", "分"]

  let result = ""
  const numStr = num.toFixed(2)
  const integerPart = Math.floor(num).toString()
  const decimalPart = numStr.split(".")[1]

  // 处理整数部分
  for (let i = 0; i < integerPart.length; i++) {
    const digit = parseInt(integerPart[i])
    const unit = units[integerPart.length - 1 - i]
    if (digit !== 0) {
      result += digits[digit] + unit
    } else {
      if (result[result.length - 1] !== "零" && i !== integerPart.length - 1) {
        result += "零"
      }
    }
  }

  result += "元"

  // 处理小数部分
  if (parseInt(decimalPart) === 0) {
    result += "整"
  } else {
    for (let i = 0; i < 2; i++) {
      const digit = parseInt(decimalPart[i])
      if (digit !== 0) {
        result += digits[digit] + decimal[i]
      }
    }
  }

  return result
}

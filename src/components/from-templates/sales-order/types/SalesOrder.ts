// salesOrder.ts
export interface SalesOrder {
  id: string
  templateId: string
  status: "pending_approval" | "approved" | "rejected"
  title: string
  data: {
    customerInfo: CustomerInfo
    basicInfo: BasicInfo
    productDetails: ProductDetail[]
    totalAmount: number
    totalAmountInWords: string
    grossProfitRate: number
    discountAmount: number
    discountRate: number
    attachment: Attachment | null
    deliveryPlan: DeliveryPlan
    financialTerms: FinancialTerms
    invoiceDetails: InvoiceDetails
    bankAccount: BankAccount
  }
}

export interface CustomerInfo {
  customerId: string
  customerName: string
  customerCode: string
  contactId: string
  contactName: string
  contactPhone: string
}

export interface BasicInfo {
  orderName: string
  signDate: string
  deliveryDate: string
  department: string
  salesperson: string
  orderNumber: string
}

export interface ProductDetail {
  data_id: string
  标题: string
  产品编码: string
  产品属性: string
  产品类型: string
  产品名称: string
  品牌: string
  规格型号: string
  单位: string
  "成本单价/元": string
  "销售单价(含税)/元": string
  "增值税税率 %": string
  "销售单价(不含税)/元": string
  "税额/元": string
  "售价毛利/元": string
  产品权限: string
  提交人: string
  提交时间: string
  更新时间: string
  quantity: number
  totalPrice: number
  productOriginalTotalPrice: number
  actualSellingPrice: number
  actualSellingTotalPrice: number
  isProductSelected: boolean
}

export interface Attachment {
  name: string
  size: number
  type: string
}

export interface DeliveryPlan {
  address: string
  detailedAddress: string
  plans: DeliveryPlanItem[]
}

export interface DeliveryPlanItem {
  batch: string
  plannedDate: string
  content: string
}

export interface FinancialTerms {
  settlementPeriod: string
  paymentPlans: PaymentPlan[]
}

export interface PaymentPlan {
  item: string
  percentage: number
  amount: number
  method: string
  plannedDate: string
  notes: string
}

export interface InvoiceDetails {
  title: string
  taxNumber: string
  taxType: string
  vatRate: string
}

export interface BankAccount {
  account: string
  bank: string
}

export interface Customer {
  data_id: string
  标题: string
  客户编码: string
  客户名称: string
  客户状态: string
  流失原因: string | null
  客户来源: string
  客户标签: string
  所属行业: string
  客户地址: {
    省_自治区_直辖市: string
    市: string
    县_区: string
    详细地址: string | null
  }
  客户详情: string | null
  销售负责人: string
  销售归属部门: string
  协作人: string | null
  结算期限: string | null
  信用额度_元: string
  发票抬头: string
  发票税号: string
  税种: string
  增值税税率: string
  开户电话: string
  开户银行: string
  银行账户: string
  收票邮箱: string
  最近跟进时间: string | null
  提交人: string
  提交时间: string
  更新时间: string
}

export interface CustomerContact {
  data_id: string
  客户名称: string
  客户编码: string
  联系人姓名: string
  联系人手机号: string
  部门: string
  职务: string
  微信号: string
  邮箱: string
  关键决策人: "是" | "否"
  联系人详情: string | null
  提交人: string
  提交时间: string
  更新时间: string
}

export interface ProductData {
  data_id: string
  标题: string
  产品编码: string
  产品属性: string
  产品类型: string
  产品名称: string
  品牌: string
  规格型号: string
  单位: string
  "成本单价/元": string
  "销售单价(含税)/元": string
  "增值税税率 %": string
  "销售单价(不含税)/元": string
  "税额/元": string
  "售价毛利/元": string
  产品权限: string
  提交人: string
  提交时间: string
  更新时间: string
}

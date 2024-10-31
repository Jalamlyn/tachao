export interface OutsourcingOrder {
  id: string
  templateId: string
  status: string
  title: string
  data: {
    basicInfo: BasicInfo
    productDetails: ProductDetail[]
    processConfirmations: ProcessConfirmations
    totalAmount: number
    totalAmountInWords: string
  }
}

export interface BasicInfo {
  orderNumber: string
  orderDate: string
  manufacturer: string
  manufacturerContact: string
  contactPhone: string
  deliveryDate?: string
  department: string
  responsiblePerson: string
}

export interface ProductDetail {
  id: string
  productName: string
  specification: string
  model: string // 新增规格型号字段
  unit: string
  outboundQuantity: number
  inboundQuantity: number
  quantity: number // 保留原字段保持兼容性
  unitPrice: number
  totalPrice: number
  processingRequirements: string
  remarks: string
  // 保持原有字段
  serviceItems?: string[]
  defectiveCount?: number
  squareMeters?: number
  invoiceNumber?: string
  invoiceDate?: string
}

export interface ProcessConfirmations {
  warehouseConfirm: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  purchaseConfirm: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  financeConfirm: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    confirmedAmount: number
    comments: string
  }
  // 保留原字段以保持兼容性
  warehouseOutbound?: any
  manufacturerReceipt?: any
  processingComplete?: any
  warehouseInbound?: any
  financeAmountConfirm?: any
  financePayment?: any
  manufacturerPaymentReceipt?: any
}

export const PROCESS_STEPS = {
  WAREHOUSE_CONFIRM: 'warehouseConfirm',
  PURCHASE_CONFIRM: 'purchaseConfirm',
  FINANCE_CONFIRM: 'financeConfirm'
} as const

export type ProcessStep = typeof PROCESS_STEPS[keyof typeof PROCESS_STEPS]

export const PROCESS_STEP_LABELS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_CONFIRM]: '仓库确认',
  [PROCESS_STEPS.PURCHASE_CONFIRM]: '采购确认',
  [PROCESS_STEPS.FINANCE_CONFIRM]: '财务确认'
}

export const PROCESS_STEP_DESCRIPTIONS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_CONFIRM]: '✨ 仓库已完成物料清点和包装，确认出入库数量无误',
  [PROCESS_STEPS.PURCHASE_CONFIRM]: '📦 采购部门已确认加工质量和数量符合要求',
  [PROCESS_STEPS.FINANCE_CONFIRM]: '💰 财务部门已核实加工费用，确认金额准确无误'
}
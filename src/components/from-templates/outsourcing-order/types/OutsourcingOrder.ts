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
  specification: string // 保留字段保持兼容性
  unit: string
  outboundQuantity: number
  inboundQuantity: number
  quantity: number // 保留原字段保持兼容性
  unitPrice: number
  totalPrice: number
  processingRequirements: string // 保留字段保持兼容性
  remarks: string
}

export interface ProcessConfirmations {
  warehouseOutbound: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  manufacturerReceipt: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  processingComplete: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    deliveryInfo: {
      plateNumber: string
      driverName: string
      driverContact: string
    }
    comments: string
  }
  warehouseInbound: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  financeAmountConfirm: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    confirmedAmount: number
    comments: string
  }
  financePayment: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    paymentAmount: number
    comments: string
  }
  manufacturerPaymentReceipt: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
}

export const PROCESS_STEPS = {
  WAREHOUSE_OUTBOUND: 'warehouseOutbound',
  MANUFACTURER_RECEIPT: 'manufacturerReceipt',
  PROCESSING_COMPLETE: 'processingComplete',
  WAREHOUSE_INBOUND: 'warehouseInbound',
  FINANCE_AMOUNT_CONFIRM: 'financeAmountConfirm',
  FINANCE_PAYMENT: 'financePayment',
  MANUFACTURER_PAYMENT_RECEIPT: 'manufacturerPaymentReceipt'
} as const

export type ProcessStep = typeof PROCESS_STEPS[keyof typeof PROCESS_STEPS]

export const PROCESS_STEP_LABELS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_OUTBOUND]: '仓库出库确认',
  [PROCESS_STEPS.MANUFACTURER_RECEIPT]: '加工单位收货确认',
  [PROCESS_STEPS.PROCESSING_COMPLETE]: '加工完成送货确认',
  [PROCESS_STEPS.WAREHOUSE_INBOUND]: '仓库收货确认',
  [PROCESS_STEPS.FINANCE_AMOUNT_CONFIRM]: '财务金额确认',
  [PROCESS_STEPS.FINANCE_PAYMENT]: '财务付款确认',
  [PROCESS_STEPS.MANUFACTURER_PAYMENT_RECEIPT]: '加工单位收款确认'
}

export const PROCESS_STEP_DESCRIPTIONS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_OUTBOUND]: '✨ 仓库已完成物料清点和包装，即将发往加工单位进行专业加工',
  [PROCESS_STEPS.MANUFACTURER_RECEIPT]: '📦 加工单位已接收物料，将按照要求开始安排生产加工',
  [PROCESS_STEPS.PROCESSING_COMPLETE]: '🚚 加工单位已完成全部加工工序，产品已完成质检并准备送货',
  [PROCESS_STEPS.WAREHOUSE_INBOUND]: '🎯 仓库已验收加工完成的产品，确认质量和数量符合要求',
  [PROCESS_STEPS.FINANCE_AMOUNT_CONFIRM]: '💰 财务部门已核实加工费用，确认金额准确无误',
  [PROCESS_STEPS.FINANCE_PAYMENT]: '💳 财务部门已完成加工费用支付，等待对方确认',
  [PROCESS_STEPS.MANUFACTURER_PAYMENT_RECEIPT]: '🤝 加工单位已确认收到全部加工费用，订单圆满完成'
}
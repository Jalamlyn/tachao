export interface DeliveryOrder {
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
  customerName: string
  customerAddress: string
  customerContact: string
  contactPhone: string
}

export interface ProductDetail {
  id: string
  productName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  remarks: string
}

export interface ProcessConfirmations {
  warehouseConfirm?: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  salesmanConfirm?: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  deliverymanConfirm?: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
  receiverConfirm?: {
    confirmed: boolean
    confirmer: string
    confirmationDate: string
    comments: string
  }
}

export const PROCESS_STEPS = {
  WAREHOUSE_CONFIRM: "warehouseConfirm",
  SALESMAN_CONFIRM: "salesmanConfirm",
  DELIVERYMAN_CONFIRM: "deliverymanConfirm",
  RECEIVER_CONFIRM: "receiverConfirm",
} as const

export type ProcessStep = (typeof PROCESS_STEPS)[keyof typeof PROCESS_STEPS]

export const PROCESS_STEP_LABELS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_CONFIRM]: "仓库确认",
  [PROCESS_STEPS.SALESMAN_CONFIRM]: "业务员确认",
  [PROCESS_STEPS.DELIVERYMAN_CONFIRM]: "送货人确认",
  [PROCESS_STEPS.RECEIVER_CONFIRM]: "收货人确认",
}

export const PROCESS_STEP_DESCRIPTIONS: Record<ProcessStep, string> = {
  [PROCESS_STEPS.WAREHOUSE_CONFIRM]: "✨ 仓库已完成货物清点和包装，准备发货",
  [PROCESS_STEPS.SALESMAN_CONFIRM]: "📋 业务员已确认订单信息和发货细节",
  [PROCESS_STEPS.DELIVERYMAN_CONFIRM]: "🚚 送货人已接收货物并开始配送",
  [PROCESS_STEPS.RECEIVER_CONFIRM]: "🎯 收货人已验收货物，确认无误",
}

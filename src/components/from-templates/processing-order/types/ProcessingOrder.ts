export interface ProcessingOrder {
  id: string
  templateId: string
  status: ProcessingOrderStatus
  title: string
  data: {
    basicInfo: BasicInfo
    materialDetails: MaterialDetail[]
    totalAmount: number
    totalAmountInWords: string
    processingFee: number
    attachment: Attachment | null
    tradingTerms: TradingTerm[]
  }
}

export type ProcessingOrderStatus =
  | "initial"
  | "pending_partner_receipt"
  | "pending_processing_start"
  | "processing"
  | "pending_our_receipt"
  | "pending_inspection"
  | "pending_payment"
  | "pending_partner_payment_confirmation"
  | "archived"

export interface Address {
  province: string
  city: string
  district: string
  detail: string
}

export interface BasicInfo {
  orderNumber: string
  manufacturerName: string
  manufacturerId: string
  address: Address
  contactMethod: string
  orderDate: string
  department?: string
  responsiblePerson?: string
}

export interface MaterialDetail {
  id: string
  materialName: string
  specification: string
  unit: string
  quantity: number
  processingProcess: string
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  notes?: string
  status?: "pending" | "processing" | "completed"
}

export interface Attachment {
  name: string
  size: number
  type: string
  url?: string
  uploadDate?: string
}

export interface TradingTerm {
  id: string
  content: string
  type: "quality" | "delivery" | "payment" | "other"
  isRequired: boolean
}

export interface Manufacturer {
  data_id: string
  manufacturerName: string
  manufacturerId: string
  address: Address
  contactMethod: string
  qualificationLevel?: string
  cooperationHistory?: string
  paymentTerms?: string
  businessLicense?: string
  taxRegistration?: string
}

export interface ProcessingOrderValidationError {
  field: string
  message: string
  type: "error" | "warning"
  code?: string
}

export interface ProcessingOrderCalculation {
  subtotal: number
  tax: number
  processingFee: number
  totalAmount: number
  discount?: number
  finalAmount: number
}
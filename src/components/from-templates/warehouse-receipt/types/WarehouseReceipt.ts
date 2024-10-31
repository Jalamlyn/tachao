export interface WarehouseReceipt {
  id: string
  templateId: string
  status: WarehouseReceiptStatus
  title: string
  data: {
    basicInfo: BasicInfo
    materialDetails: MaterialDetail[]
    warehouseInfo: WarehouseInfo
    approvalInfo: ApprovalInfo
    attachment: Attachment | null
  }
}

export type WarehouseReceiptStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed"

export interface BasicInfo {
  receiptNumber: string
  receiptDate: string
  receiptType: "purchase" | "production" | "return" | "other"
  department: string
  responsiblePerson: string
  supplier?: string
  sourceDocument?: string
  sourceDocumentNumber?: string
  remarks?: string
}

export interface MaterialDetail {
  id: string
  materialCode: string
  materialName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  batchNumber: string
  productionDate?: string
  expirationDate?: string
  location: string
  qualityStatus: "pending" | "qualified" | "unqualified"
  remarks?: string
}

export interface WarehouseInfo {
  warehouseCode: string
  warehouseName: string
  area: string
  shelf: string
  position: string
  temperature?: string
  humidity?: string
  operator: string
  checkPerson: string
  receiveTime: string
  storageRequirements?: string
}

export interface ApprovalInfo {
  status: "pending" | "approved" | "rejected"
  approver: string
  approvalDate?: string
  approvalComments?: string
  qualityInspector?: string
  inspectionDate?: string
  inspectionResult?: "passed" | "failed"
  inspectionComments?: string
}

export interface Attachment {
  name: string
  size: number
  type: string
  url?: string
  uploadDate?: string
}

export const RECEIPT_TYPE_OPTIONS = [
  { label: "采购入库", value: "purchase" },
  { label: "生产入库", value: "production" },
  { label: "退货入库", value: "return" },
  { label: "其他入库", value: "other" },
] as const

export const QUALITY_STATUS_OPTIONS = [
  { label: "待检验", value: "pending" },
  { label: "合格", value: "qualified" },
  { label: "不合格", value: "unqualified" },
] as const

export const APPROVAL_STATUS_OPTIONS = [
  { label: "待审批", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拒绝", value: "rejected" },
] as const

export const INSPECTION_RESULT_OPTIONS = [
  { label: "通过", value: "passed" },
  { label: "不通过", value: "failed" },
] as const
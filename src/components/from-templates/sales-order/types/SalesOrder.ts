export interface SalesOrder {
  id: string
  templateId: string
  status: string
  title: string
  data: {
    basicInfo: BasicInfo
    productDetails: ProductDetail[]
    totalAmount: number
    totalAmountInWords: string
  }
}

export interface BasicInfo {
  orderNumber: string
  orderDate: string
  customerName: string
  customerOrderNumber: string
  deliveryDate: string
  contactPerson: string
  contactPhone: string
  deliveryAddress: string
}

export interface ProductDetail {
  id: string
  materialCode: string
  nc5tCode: string
  productName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  remarks: string
}

export const TABLE_COLUMNS = [
  { label: "序号", key: "index", width: "60px" },
  { label: "物料代码", key: "materialCode", width: "120px" },
  { label: "NC5T编码", key: "nc5tCode", width: "120px" },
  { label: "产品名称", key: "productName", width: "200px" },
  { label: "规格型号", key: "specification", width: "120px" },
  { label: "计量单位", key: "unit", width: "80px" },
  { label: "销售数量", key: "quantity", width: "100px" },
  { label: "拟销售单价", key: "unitPrice", width: "120px" },
  { label: "销售金额", key: "totalPrice", width: "120px" },
  { label: "拟发货时间", key: "deliveryDate", width: "120px" },
  { label: "备注", key: "remarks", width: "150px" },
]
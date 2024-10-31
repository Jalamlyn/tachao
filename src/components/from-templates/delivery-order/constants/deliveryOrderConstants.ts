import { ProductDetail } from "../types/DeliveryOrder"

export const FORM_TEMPLATE_ID = 'deliveryOrder'

export const INITIAL_BASIC_INFO = {
  orderNumber: "",
  orderDate: new Date().toISOString(),
  customerName: "",
  customerAddress: "",
  customerContact: "",
  contactPhone: "",
}

export const INITIAL_PRODUCT: ProductDetail = {
  id: "",
  productName: "",
  specification: "",
  unit: "",
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  remarks: "",
}

export const INITIAL_FORM_VALUES = {
  id: "",
  title: "",
  status: "draft",
  templateId: FORM_TEMPLATE_ID,
  data: {
    basicInfo: INITIAL_BASIC_INFO,
    productDetails: [],
    totalAmount: 0,
    totalAmountInWords: "",
  },
}

export const TABLE_COLUMNS = [
  { label: "序号", key: "index", width: "60px" },
  { label: "产品名称", key: "productName", width: "200px" },
  { label: "规格", key: "specification", width: "120px" },
  { label: "单位", key: "unit", width: "80px" },
  { label: "数量", key: "quantity", width: "100px" },
  { label: "单价", key: "unitPrice", width: "120px" },
  { label: "总价", key: "totalPrice", width: "120px" },
  { label: "备注", key: "remarks", width: "150px" },
]
import { ProductDetail } from "../types/OutsourcingOrder"

export const INITIAL_PRODUCT: ProductDetail = {
  id: "",
  productName: "",
  specification: "", // 保留字段保持兼容性
  unit: "",
  outboundQuantity: 0,
  inboundQuantity: 0,
  quantity: 0, // 保留原字段保持兼容性
  unitPrice: 0,
  totalPrice: 0,
  processingRequirements: "", // 保留字段保持兼容性
  remarks: "",
}

export const TABLE_COLUMNS = [
  { label: "序号", key: "index", width: "60px" },
  { label: "产品名称", key: "productName", width: "200px" },
  { label: "单位", key: "unit", width: "80px" },
  { label: "出库数", key: "outboundQuantity", width: "100px" },
  { label: "入库数", key: "inboundQuantity", width: "100px" },
  { label: "单价", key: "unitPrice", width: "120px" },
  { label: "总价", key: "totalPrice", width: "120px" },
  { label: "备注", key: "remarks", width: "150px" },
]
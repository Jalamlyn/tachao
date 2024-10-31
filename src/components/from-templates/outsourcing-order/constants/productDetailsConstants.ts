import { ProductDetail } from "../types/OutsourcingOrder"

export const INITIAL_PRODUCT: ProductDetail = {
  id: "",
  productName: "",
  specification: "",
  model: "", // 新增规格型号字段
  unit: "",
  outboundQuantity: 0,
  inboundQuantity: 0,
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  processingRequirements: "",
  remarks: "",
  // 保持原有字段
  serviceItems: [],
  defectiveCount: 0,
  squareMeters: 0,
  invoiceNumber: "",
  invoiceDate: "",
  // 新增CAD图纸附件字段
  cadAttachment: {
    fileId: "",
    fileName: "",
    fileUrl: "",
  },
}

export const TABLE_COLUMNS = [
  { label: "序号", key: "index", width: "60px" },
  { label: "产品名称", key: "productName", width: "200px" },
  { label: "料号", key: "model", width: "150px" },
  { label: "服务项目", key: "serviceItems", width: "200px" },
  { label: "单位", key: "unit", width: "80px" },
  { label: "出库数", key: "outboundQuantity", width: "100px" },
  { label: "入库数", key: "inboundQuantity", width: "100px" },
  { label: "不良数", key: "defectiveCount", width: "100px" },
  { label: "平方数", key: "squareMeters", width: "100px" },
  { label: "单价", key: "unitPrice", width: "120px" },
  { label: "总价", key: "totalPrice", width: "120px" },
  { label: "发票号", key: "invoiceNumber", width: "120px" },
  { label: "开票日期", key: "invoiceDate", width: "120px" },
  { label: "CAD图纸", key: "cadAttachment", width: "150px" },
  { label: "备注", key: "remarks", width: "150px" },
]

export const PRINT_COLUMNS = [
  { label: "序号", key: "index", width: "60px" },
  { label: "产品名称", key: "productName", width: "200px" },
  { label: "料号", key: "model", width: "150px" },
  { label: "送货数", key: "inboundQuantity", width: "100px" },
  { label: "平方数", key: "squareMeters", width: "100px" },
]
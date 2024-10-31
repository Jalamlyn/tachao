export const DEFAULT_FORM_VALUES = {
  id: "",
  templateId: "salesOrder",
  status: "pending_approval",
  title: "",
  data: {
    customerInfo: {
      customerId: "",
      customerName: "",
      customerCode: "",
      contactId: "",
      contactName: "",
      contactPhone: "",
    },
    basicInfo: {
      orderName: "",
      signDate: "",
      deliveryDate: "",
      department: "",
      salesperson: "",
      orderNumber: "",
    },
    productDetails: [],
    totalAmount: 0,
    totalAmountInWords: "",
    grossProfitRate: 0,
    discountAmount: 0,
    discountRate: 0,
    attachment: null,
    deliveryPlan: {
      address: "",
      detailedAddress: "",
      plans: [],
    },
    financialTerms: {
      settlementPeriod: "",
      paymentPlans: [],
    },
    invoiceDetails: {
      title: "",
      taxNumber: "",
      taxType: "",
      vatRate: "",
    },
    bankAccount: {
      account: "",
      bank: "",
    },
  },
}

export const FORM_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export const DELIVERY_BATCH_OPTIONS = [
  { label: "整批", value: "整批" },
  { label: "第一批", value: "第一批" },
  { label: "第二批", value: "第二批" },
  { label: "第三批", value: "第三批" },
] as const

export const PAYMENT_ITEM_OPTIONS = [
  { label: "整批货款", value: "整批货款" },
  { label: "定金", value: "定金" },
  { label: "第一批货款", value: "第一批货款" },
  { label: "第二批货款", value: "第二批货款" },
  { label: "第三批货款", value: "第三批货款" },
] as const

export const PAYMENT_METHOD_OPTIONS = [
  { label: "网上转账", value: "网上转账" },
  { label: "支付宝", value: "支付宝" },
  { label: "微信支付", value: "微信支付" },
  { label: "电汇", value: "电汇" },
  { label: "现金", value: "现金" },
] as const

export const DEPARTMENT_OPTIONS = [
  { label: "市场部", value: "市场部" },
  { label: "销售部", value: "销售部" },
] as const

export const SALESPERSON_OPTIONS = [
  { label: "王老五", value: "王老五" },
  { label: "王老二", value: "王老二" },
] as const

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

export const FORM_TABS = {
  ORDER: "salesOrder",
  HISTORY: "modificationHistory",
} as const

export const FORM_DETAIL_TABS = {
  ORDER_DETAILS: "orderDetails",
  FINANCIAL_DETAILS: "financialDetails",
} as const

export const MIN_GROSS_PROFIT_RATE = 35

export const FORM_MESSAGES = {
  CREATE_SUCCESS: "表单创建成功",
  UPDATE_SUCCESS: "表单更新成功",
  SUBMIT_ERROR: "提交表单失败",
  FETCH_ERROR: "获取表单数据失败",
  FETCH_CUSTOMER_ERROR: "获取客户数据失败",
  FETCH_CONTACT_ERROR: "获取联系人数据失败",
  FETCH_PRODUCT_ERROR: "获取产品数据失败",
  DISCOUNT_ERROR: "优惠金额不能大于总金额",
} as const

export const ORDER_PREFIX = "SQ"
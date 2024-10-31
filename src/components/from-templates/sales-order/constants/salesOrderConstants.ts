export const FORM_TEMPLATE_ID = 'salesOrder'

export const INITIAL_BASIC_INFO = {
  orderNumber: "",
  orderDate: new Date().toISOString(),
  customerName: "",
  customerOrderNumber: "",
  deliveryDate: "",
  contactPerson: "",
  contactPhone: "",
  deliveryAddress: "",
}

export const INITIAL_PRODUCT = {
  id: "",
  materialCode: "",
  nc5tCode: "",
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
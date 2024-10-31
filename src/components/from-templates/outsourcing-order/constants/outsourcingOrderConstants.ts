export const FORM_TEMPLATE_ID = 'outsourcingOrder'

export const INITIAL_BASIC_INFO = {
  orderNumber: "",
  orderDate: new Date().toISOString(),
  manufacturer: "",
  manufacturerAddress: "",
  manufacturerContact: "",
  contactPhone: "",
  deliveryDate: "",
  processingProject: "",
}

export const INITIAL_APPROVAL_INFO = {
  warehouseApproval: {
    approved: false,
    approver: "",
    approvalDate: "",
    comments: "",
  },
  financeApproval: {
    approved: false,
    approver: "",
    approvalDate: "",
    comments: "",
  },
  purchaseApproval: {
    approved: false,
    approver: "",
    approvalDate: "",
    comments: "",
  },
}

export const INITIAL_PROCESS_CONFIRMATIONS = {
  warehouseConfirm: {
    confirmed: false,
    confirmer: "",
    confirmationDate: "",
    comments: "",
  },
  purchaseConfirm: {
    confirmed: false,
    confirmer: "",
    confirmationDate: "",
    comments: "",
  },
  financeConfirm: {
    confirmed: false,
    confirmer: "",
    confirmationDate: "",
    confirmedAmount: "",
    comments: "",
  },
}

export const INITIAL_FORM_VALUES = {
  id: "",
  title: "",
  status: "draft",
  templateId: FORM_TEMPLATE_ID,
  data: {
    basicInfo: INITIAL_BASIC_INFO,
    serviceItems: [],
    productDetails: [],
    approvalInfo: INITIAL_APPROVAL_INFO,
    processConfirmations: INITIAL_PROCESS_CONFIRMATIONS,
    totalAmount: 0,
    totalAmountInWords: "",
  },
}
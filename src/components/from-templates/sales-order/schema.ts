import * as z from "zod"

export const formSchema = z.object({
  id: z.string(),
  status: z.string(),
  templateId: z.string(),
  title: z.string(),
  data: z.object({
    customerInfo: z.object({
      customerId: z.string().min(1, { message: "请选择客户" }),
      customerName: z.string(),
      customerCode: z.string(),
      contactId: z.string().min(1, { message: "请选择联系人" }),
      contactName: z.string(),
      contactPhone: z.string(),
    }),
    basicInfo: z.object({
      orderName: z.string(),
      signDate: z.string().min(1, { message: "请选择订单签订日期" }),
      deliveryDate: z.string().min(1, { message: "请选择订单出库日期" }),
      department: z.string().min(1, { message: "请选择销售归属部门" }),
      salesperson: z.string().min(1, { message: "请选择销售负责人" }),
      orderNumber: z.string(),
    }),
    productDetails: z.array(z.any()).min(1, { message: "请至少添加一个产品" }),
    totalAmount: z.number(),
    totalAmountInWords: z.string(),
    grossProfitRate: z.number(),
    discountAmount: z.number(),
    discountRate: z.number(),
    attachment: z.any().nullable(),
    deliveryPlan: z.object({
      address: z.string().min(1, { message: "请输入送货地址" }),
      detailedAddress: z.string(),
      plans: z.array(z.any()).min(1, { message: "请至少添加一个送货计划" }),
    }),
    financialTerms: z.object({
      settlementPeriod: z.string().min(1, { message: "请输入结算期限" }),
      paymentPlans: z.array(z.any()).min(1, { message: "请至少添加一个收款计划" }),
    }),
    invoiceDetails: z.object({
      title: z.string().min(1, { message: "请输入发票抬头" }),
      taxNumber: z.string().min(1, { message: "请输入发票税号" }),
      taxType: z.string(),
      vatRate: z.string(),
    }),
    bankAccount: z.object({
      account: z.string().min(1, { message: "请输入银行账户" }),
      bank: z.string().min(1, { message: "请输入开户银行" }),
    }),
  }),
})

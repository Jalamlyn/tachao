import * as z from "zod"

export const salesOrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  templateId: z.string(),
  data: z.object({
    basicInfo: z.object({
      orderNumber: z.string(),
      orderDate: z.string().min(1, { message: "请选择申请日期" }),
      customerName: z.string().min(1, { message: "请输入客户名称" }),
      customerOrderNumber: z.string().min(1, { message: "请输入客户订单号" }),
      deliveryDate: z.string().min(1, { message: "请选择预计发货日期" }),
      contactPerson: z.string().min(1, { message: "请输入联系人" }),
      contactPhone: z.string().min(1, { message: "请输入联系电话" }),
      deliveryAddress: z.string().min(1, { message: "请输入送货地址" }),
    }),
    productDetails: z
      .array(
        z.object({
          id: z.string(),
          materialCode: z.string().min(1, { message: "请输入物料代码" }),
          nc5tCode: z.string(),
          productName: z.string().min(1, { message: "请输入产品名称" }),
          specification: z.string(),
          unit: z.string().min(1, { message: "请输入单位" }),
          quantity: z.coerce.number().min(0, "数量不能为负数"),
          unitPrice: z.coerce.number().min(0, "单价不能为负数"),
          totalPrice: z.number().min(0, "总价不能为负数"),
          remarks: z.string(),
        })
      )
      .min(1, { message: "请至少添加一个产品" }),
    totalAmount: z.number().min(0, { message: "总金额不能为负数" }),
    totalAmountInWords: z.string(),
  }),
})

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>
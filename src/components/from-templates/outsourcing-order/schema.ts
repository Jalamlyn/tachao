import * as z from "zod"

export const outsourcingOrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  templateId: z.string(),
  data: z.object({
    basicInfo: z.object({
      orderNumber: z.string(),
      orderDate: z.string().min(1, { message: "请选择订单日期" }),
      manufacturer: z.string().min(1, { message: "请输入加工单位" }),
      manufacturerAddress: z.string(),
      manufacturerContact: z.string().min(1, { message: "请输入联系人" }),
      contactPhone: z.string().min(1, { message: "请输入联系电话" }),
      deliveryDate: z.string().optional(),
      processingProject: z.string().min(1, { message: "请选择加工项目" }),
    }),
    serviceItems: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        code: z.string(),
        unit: z.string(),
        remarks: z.string().optional(),
      })
    ),
    productDetails: z
      .array(
        z.object({
          id: z.string(),
          productName: z.string().min(1, { message: "请输入产品名称" }),
          specification: z.string(),
          unit: z.string().min(1, { message: "请输入单位" }),
          outboundQuantity: z.coerce.number().min(0, "不能为空"),
          inboundQuantity: z.coerce.number().min(0, "不能为空"),
          quantity: z.coerce.number().min(0, "不能为空"),
          unitPrice: z.coerce.number().min(0, "不能为空"),
          totalPrice: z.number().min(0, "总价不能为负数"),
          processingRequirements: z.string(),
          remarks: z.string(),
          serviceItems: z.array(z.string()).optional(),
          defectiveCount: z.coerce.number().min(0, "不良数不能为负数").optional(),
          squareMeters: z.coerce.number().min(0, "平方数不能为负数").optional(),
          invoiceNumber: z.string().optional(),
          invoiceDate: z.string().optional(),
          cadAttachment: z.object({
            fileId: z.string(),
            fileName: z.string(),
            fileUrl: z.string(),
          }).optional(),
        })
      )
      .min(1, { message: "请至少添加一个产品" }),
    totalAmount: z.number().min(0, { message: "总金额不能为负数" }),
    totalAmountInWords: z.string(),
    processConfirmations: z
      .object({
        warehouseConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        purchaseConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        financeConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            confirmedAmount: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
})

export type OutsourcingOrderFormValues = z.infer<typeof outsourcingOrderSchema>
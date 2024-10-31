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
          specification: z.string(), // 保留字段保持兼容性
          unit: z.string().min(1, { message: "请输入单位" }),
          outboundQuantity: z.string()
            .regex(/^\d+$/, "出库数必须是整数")
            .transform(Number)
            .refine((n) => n >= 0, "出库数不能为负数"),
          inboundQuantity: z.string()
            .regex(/^\d+$/, "入库数必须是整数")
            .transform(Number)
            .refine((n) => n >= 0, "入库数不能为负数"),
          quantity: z.string(), // 保留原字段保持兼容性
          unitPrice: z.string()
            .regex(/^\d*\.?\d{0,4}$/, "单价最多支持4位小数")
            .transform(Number)
            .refine((n) => n >= 0, "单价不能为负数"),
          totalPrice: z.number()
            .min(0, "总价不能为负数"),
          processingRequirements: z.string(), // 保留字段保持兼容性
          remarks: z.string(),
        })
      )
      .min(1, { message: "请至少添加一个产品" }),
    totalAmount: z.number().min(0, { message: "总金额不能为负数" }),
    totalAmountInWords: z.string(),
    processConfirmations: z
      .object({
        warehouseOutbound: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        manufacturerReceipt: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        processingComplete: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            deliveryInfo: z
              .object({
                plateNumber: z.string().optional(),
                driverName: z.string().optional(),
                driverContact: z.string().optional(),
              })
              .optional(),
            comments: z.string().optional(),
          })
          .optional(),
        warehouseInbound: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        financeAmountConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            confirmedAmount: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        financePayment: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            paymentAmount: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        manufacturerPaymentReceipt: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
})

export type OutsourcingOrderFormValues = z.infer<typeof outsourcingOrderSchema>
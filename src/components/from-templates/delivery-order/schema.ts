import * as z from "zod"

export const deliveryOrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  templateId: z.string(),
  data: z.object({
    basicInfo: z.object({
      orderNumber: z.string(),
      orderDate: z.string().min(1, { message: "请选择订单日期" }),
      customerName: z.string().min(1, { message: "请输入客户名称" }),
      customerAddress: z.string().min(1, { message: "请输入客户地址" }),
      customerContact: z.string().min(1, { message: "请输入联系人" }),
      contactPhone: z.string().min(1, { message: "请输入联系电话" }),
    }),
    productDetails: z
      .array(
        z.object({
          id: z.string(),
          productName: z.string().min(1, { message: "请输入产品名称" }),
          specification: z.string(),
          unit: z.string().min(1, { message: "请输入单位" }),
          quantity: z
            .string()
            .regex(/^\d+$/, "数量必须是整数")
            .transform(Number)
            .refine((n) => n >= 0, "数量不能为负数"),
          unitPrice: z
            .string()
            .regex(/^\d*\.?\d{0,2}$/, "单价最多支持2位小数")
            .transform(Number)
            .refine((n) => n >= 0, "单价不能为负数"),
          totalPrice: z.number().min(0, "总价不能为负数"),
          remarks: z.string(),
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
        salesmanConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        deliverymanConfirm: z
          .object({
            confirmed: z.boolean().optional(),
            confirmer: z.string().optional(),
            confirmationDate: z.string().optional(),
            comments: z.string().optional(),
          })
          .optional(),
        receiverConfirm: z
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

export type DeliveryOrderFormValues = z.infer<typeof deliveryOrderSchema>

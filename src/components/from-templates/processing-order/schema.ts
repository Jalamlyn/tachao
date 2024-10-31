import * as z from "zod"

const materialDetailSchema = z.object({
  id: z.string(),
  materialName: z.string().min(1, { message: "请输入物料名称" }),
  specification: z.string().min(1, { message: "请输入料号" }),
  unit: z.string().min(1, { message: "请输入单位" }),
  quantity: z.number().min(0.01, { message: "数量必须大于0" }),
  processingProcess: z.string().min(1, { message: "请输入加工工序" }),
  unitPrice: z.number().min(0, { message: "单价不能为负数" }),
  totalPrice: z.number().min(0, { message: "总价不能为负数" }),
  deliveryDate: z.string().min(1, { message: "请选择交期" }),
  notes: z.string().optional(),
  status: z.enum(["pending", "processing", "completed"]).optional(),
})

export const processingOrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum([
    "initial",
    "pending_partner_receipt",
    "pending_processing_start",
    "processing",
    "pending_our_receipt",
    "pending_inspection",
    "pending_payment",
    "pending_partner_payment_confirmation",
    "archived",
  ] as const),
  templateId: z.string(),
  data: z.object({
    basicInfo: z.object({
      orderNumber: z.string().min(1, { message: "订单编号不能为空" }),
      manufacturerName: z.string().min(1, { message: "请输入加工厂商名称" }),
      manufacturerId: z.string().min(1, { message: "请选择加工厂商" }),
      address: z.string().min(1, { message: "请输入地址" }),
      contactMethod: z.string().min(1, { message: "请输入联系方式" }),
      orderDate: z.string().min(1, { message: "请选择订单日期" }),
      department: z.string().min(1, { message: "请选择部门" }),
      responsiblePerson: z.string().min(1, { message: "请输入负责人" }),
    }),
    materialDetails: z.array(materialDetailSchema).min(1, { message: "请至少添加一个物料" }),
    totalAmount: z.number(),
    totalAmountInWords: z.string(), // 移除验证规则，因为是自动生成的
    processingFee: z.number().min(0, { message: "加工费用不能为负数" }),
    attachment: z.any().nullable(),
    tradingTerms: z.array(z.string()),
  }),
})

export type ProcessingOrderFormValues = z.infer<typeof processingOrderSchema>
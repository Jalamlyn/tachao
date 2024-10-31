import * as z from "zod"

export const warehouseReceiptSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "completed"]),
  title: z.string(),
  data: z.object({
    basicInfo: z.object({
      receiptNumber: z.string().min(1, { message: "请输入入库单号" }),
      receiptDate: z.string().min(1, { message: "请选择入库日期" }),
      receiptType: z.enum(["purchase", "production", "return", "other"], {
        required_error: "请选择入库类型",
      }),
      department: z.string().min(1, { message: "请选择部门" }),
      responsiblePerson: z.string().min(1, { message: "请输入负责人" }),
      supplier: z.string().optional(),
      sourceDocument: z.string().optional(),
      sourceDocumentNumber: z.string().optional(),
      remarks: z.string().optional(),
    }),
    materialDetails: z
      .array(
        z.object({
          id: z.string(),
          materialCode: z.string().min(1, { message: "请输入物料编码" }),
          materialName: z.string().min(1, { message: "请输入物料名称" }),
          specification: z.string().min(1, { message: "请输入规格型号" }),
          unit: z.string().min(1, { message: "请输入单位" }),
          quantity: z.number().min(0.01, { message: "数量必须大于0" }),
          unitPrice: z.number().min(0, { message: "单价不能为负数" }),
          totalPrice: z.number().min(0, { message: "总价不能为负数" }),
          batchNumber: z.string().min(1, { message: "请输入批次号" }),
          productionDate: z.string().optional(),
          expirationDate: z.string().optional(),
          location: z.string().min(1, { message: "请输入库位" }),
          qualityStatus: z.enum(["pending", "qualified", "unqualified"], {
            required_error: "请选择质检状态",
          }),
          remarks: z.string().optional(),
        })
      )
      .min(1, { message: "请至少添加一个物料" }),
    warehouseInfo: z.object({
      warehouseCode: z.string().min(1, { message: "请输入仓库编码" }),
      warehouseName: z.string().min(1, { message: "请输入仓库名称" }),
      area: z.string().min(1, { message: "请输入库区" }),
      shelf: z.string().min(1, { message: "请输入货架号" }),
      position: z.string().min(1, { message: "请输入库位号" }),
      temperature: z.string().optional(),
      humidity: z.string().optional(),
      operator: z.string().min(1, { message: "请输入操作员" }),
      checkPerson: z.string().min(1, { message: "请输入复核人" }),
      receiveTime: z.string().min(1, { message: "请选择收货时间" }),
      storageRequirements: z.string().optional(),
    }),
    approvalInfo: z.object({
      status: z.enum(["pending", "approved", "rejected"], {
        required_error: "请选择审批状态",
      }),
      approver: z.string().min(1, { message: "请输入审批人" }),
      approvalDate: z.string().optional(),
      approvalComments: z.string().optional(),
      qualityInspector: z.string().optional(),
      inspectionDate: z.string().optional(),
      inspectionResult: z.enum(["passed", "failed"]).optional(),
      inspectionComments: z.string().optional(),
    }),
    attachment: z.any().nullable(),
  }),
})

export type WarehouseReceiptFormValues = z.infer<typeof warehouseReceiptSchema>
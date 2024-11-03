import SalesOrderContainer from "./sales-order/SalesOrderContainer"
import ProcessingOrderContainer from "./processing-order/ProcessingOrderContainer"
import OutsourcingOrderContainer from "./outsourcing-order/OutsourcingOrderContainer"
import WarehouseReceiptContainer from "./warehouse-receipt/WarehouseReceiptContainer"
import YinlongSalesOrderContainer from "./sales-order/SalesOrderContainer"
import LeaveRequestContainer from "./leave-request/LeaveRequestContainer"
import { useFormMetadata } from "./hook/useFormMetadata"

export interface FormTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
  isCustom?: boolean
}

// 内置的官方模板
export const builtInTemplates: FormTemplate[] = [
  {
    id: "salesOrder",
    name: "销售订单",
    component: SalesOrderContainer,
    isCustom: false,
  },
  {
    id: "processingOrder",
    name: "委外加工单",
    component: ProcessingOrderContainer,
    isCustom: false,
  },
  {
    id: "outsourcingOrder",
    name: "银隆委外加工单",
    component: OutsourcingOrderContainer,
    isCustom: false,
  },
  {
    id: "warehouseReceipt",
    name: "入库单",
    component: WarehouseReceiptContainer,
    isCustom: false,
  },
  {
    id: "yinlongSalesOrder",
    name: "银隆销售订单申请单",
    component: YinlongSalesOrderContainer,
    isCustom: false,
  },
  {
    id: "leaveRequest",
    name: "请假申请单",
    component: LeaveRequestContainer,
    isCustom: false,
  },
]

// 获取所有表单模板(包括内置和自定义)
export const useFormTemplates = () => {
  const { forms } = useFormMetadata()

  // 过滤出类型为模板的表单
  const customTemplates = forms
    .filter((form) => form.templateId?.startsWith("template_"))
    .map((form) => ({
      id: form.id,
      name: form.data.name || form.title,
      component: form.data.component,
      isCustom: form.data.type === "custom",
    }))

  // 合并内置模板和自定义模板
  return [...builtInTemplates, ...customTemplates]
}

// 默认导出所有模板
export const formTemplates = builtInTemplates
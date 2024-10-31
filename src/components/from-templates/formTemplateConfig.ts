import SalesOrderContainer from "./sales-order/SalesOrderContainer"
import ProcessingOrderContainer from "./processing-order/ProcessingOrderContainer"
import OutsourcingOrderContainer from "./outsourcing-order/OutsourcingOrderContainer"
import WarehouseReceiptContainer from "./warehouse-receipt/WarehouseReceiptContainer"
import YinlongSalesOrderContainer from "./sales-order/SalesOrderContainer"
import LeaveRequestContainer from "./leave-request/LeaveRequestContainer"

export interface FormTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
}

export const formTemplates: FormTemplate[] = [
  {
    id: "salesOrder",
    name: "销售订单",
    component: SalesOrderContainer,
  },
  {
    id: "processingOrder",
    name: "委外加工单",
    component: ProcessingOrderContainer,
  },
  {
    id: "outsourcingOrder",
    name: "银隆委外加工单",
    component: OutsourcingOrderContainer,
  },
  {
    id: "warehouseReceipt",
    name: "入库单",
    component: WarehouseReceiptContainer,
  },
  {
    id: "yinlongSalesOrder",
    name: "银隆销售订单申请单",
    component: YinlongSalesOrderContainer,
  },
  {
    id: "leaveRequest",
    name: "请假申请单",
    component: LeaveRequestContainer,
  },
]
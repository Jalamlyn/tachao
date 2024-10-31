import SalesOrderContainer from "./sales-order/SalesOrderContainer"
import ProcessingOrderContainer from "./processing-order/ProcessingOrderContainer"
import OutsourcingOrderContainer from "./outsourcing-order/OutsourcingOrderContainer"
import WarehouseReceiptContainer from "./warehouse-receipt/WarehouseReceiptContainer"
import DeliveryOrderContainer from "./delivery-order/DeliveryOrderContainer"

export interface FormTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
}

export const formTemplates: FormTemplate[] = [
  {
    id: "deliveryOrder",
    name: "送货单",
    component: DeliveryOrderContainer,
  },
]

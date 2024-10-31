import SalesOrderReport from "./sales-order-report/SalesOrderReport"
import SalesOrderProfitReport from "./sales-order-profit-report/SalesOrderProfitReport"
import ProductPriceFluctuationReport from "./product-price-fluctuation/ProductPriceFluctuationReport"

export interface ReportTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "salesOrderReport",
    name: "销售订单统计报表",
    component: SalesOrderReport,
  },
  {
    id: "salesOrderProfitReport",
    name: "销售订单毛利率分析报表",
    component: SalesOrderProfitReport,
  },
  {
    id: "productPriceFluctuationReport",
    name: "产品销售价格-波动统计/月",
    component: ProductPriceFluctuationReport,
  },
]

export const reportTemplatesMap = Object.fromEntries(
  reportTemplates.map((template) => [template.id, template.component])
)

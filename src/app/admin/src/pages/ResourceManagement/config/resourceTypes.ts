import { ResourceTypeConfig } from "../types"
import ExcelPreview from "../components/previews/ExcelPreview"

export const resourceTypes: ResourceTypeConfig = {
  excel: {
    id: "excel",
    name: "Excel表格",
    icon: "mdi:file-excel",
    description: "支持.xlsx,.xls,.csv格式的Excel表格文件",
    previewComponent: ExcelPreview,
  },
}

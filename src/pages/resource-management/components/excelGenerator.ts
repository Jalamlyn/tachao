import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

interface DetailRow {
  date: string
  category: string
  amount: number
  description: string
}

interface SummaryRow {
  category: string
  totalAmount: number
  count: number
}

export const generateDetailTemplate = () => {
  // 创建示例数据
  const data: DetailRow[] = [
    {
      date: "2024-01-01",
      category: "示例类别1",
      amount: 100,
      description: "这是一个示例描述",
    },
    {
      date: "2024-01-02",
      category: "示例类别2",
      amount: 200,
      description: "另一个示例描述",
    },
  ]

  // 添加说明行
  const instructions = [["日期", "类别", "金额", "描述"]]

  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data, {
    origin: instructions.length,
  })

  // 添加说明
  XLSX.utils.sheet_add_aoa(ws, instructions, { origin: 0 })

  // 设置列宽
  ws["!cols"] = [
    { wch: 12 }, // 日期
    { wch: 15 }, // 类别
    { wch: 10 }, // 金额
    { wch: 30 }, // 描述
  ]

  XLSX.utils.book_append_sheet(wb, ws, "明细表")

  // 生成并下载文件
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, "明细表模板.xlsx")
}

export const generateSummaryTemplate = () => {
  // 创建示例数据
  const data: SummaryRow[] = [
    {
      category: "类别1",
      totalAmount: 1000,
      count: 5,
    },
    {
      category: "类别2",
      totalAmount: 2000,
      count: 8,
    },
  ]

  // 添加说明行
  const instructions = [["类别", "总金额", "数量"]]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data, {
    origin: instructions.length,
  })

  XLSX.utils.sheet_add_aoa(ws, instructions, { origin: 0 })

  ws["!cols"] = [
    { wch: 15 }, // 类别
    { wch: 12 }, // 总金额
    { wch: 10 }, // 数量
  ]

  XLSX.utils.book_append_sheet(wb, ws, "汇总表")

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, "汇总表模板.xlsx")
}

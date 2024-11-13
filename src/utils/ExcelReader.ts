import * as XLSX from "xlsx"
import { logger } from "./logger"

// 将工作表转换为 CSV 格式
const sheetToCSV = (worksheet: XLSX.WorkSheet, isMultipleHeaders: boolean = false): string => {
  try {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
    const rows: string[] = []
    const merges = worksheet["!merges"] || []

    // 处理表头
    for (let R = range.s.r; R <= (isMultipleHeaders ? 1 : 0); ++R) {
      const row: string[] = []
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
        let value = cell ? String(cell.v).replace(/,/g, "\\,").replace(/\n/g, "\\n") : ""

        if (!value) {
          const mergeCell = merges.find(
            (m) => R >= m.s.r && R <= m.e.r && C >= m.s.c && C <= m.e.c
          )
          if (mergeCell) {
            const mainCell = worksheet[
              XLSX.utils.encode_cell({
                r: mergeCell.s.r,
                c: mergeCell.s.c,
              })
            ]
            value = mainCell ? String(mainCell.v).replace(/,/g, "\\,").replace(/\n/g, "\\n") : ""
          }
        }
        row.push(value)
      }
      rows.push(row.join(","))
    }

    // 处理数据行
    const startRow = isMultipleHeaders ? 2 : 1
    for (let R = startRow; R <= range.e.r; ++R) {
      const row: string[] = []
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
        const value = cell ? String(cell.v).replace(/,/g, "\\,").replace(/\n/g, "\\n") : ""
        row.push(value)
      }
      rows.push(row.join(","))
    }

    const csv = rows.join("\n")

    // 记录转换后的文本大小
    const csvSizeInBytes = new Blob([csv]).size
    const csvSizeInMB = (csvSizeInBytes / (1024 * 1024)).toFixed(2)

    logger.info("CSV Conversion Stats", {
      rowCount: rows.length,
      columnCount: range.e.c - range.s.c + 1,
      csvSizeInBytes,
      csvSizeInMB: `${csvSizeInMB}MB`,
    })

    return csv
  } catch (error) {
    logger.error("Error converting sheet to CSV:", error as Error, {
      worksheet: worksheet["!ref"],
    })
    throw error
  }
}

export const readExcel = async (file: File, isMultipleHeaders: boolean = false): Promise<{ data: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // 记录原始文件大小
        const fileSizeInBytes = file.size
        const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)

        logger.info("Original Excel File Stats", {
          fileName: file.name,
          fileSize: fileSizeInBytes,
          fileSizeInMB: `${fileSizeInMB}MB`,
        })

        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 转换为 CSV
        const csv = sheetToCSV(worksheet, isMultipleHeaders)

        // 将 CSV 转换为对象数组以保持兼容性
        const lines = csv.split("\n")
        const headers = lines[0].split(",")
        const jsonData = lines.slice(1).map((line) => {
          const values = line.split(",")
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index]?.replace(/\\,/g, ",").replace(/\\n/g, "\n") || ""
          })
          return obj
        })

        resolve({
          data: jsonData,
        })
      } catch (error) {
        logger.error("Error processing Excel file:", error as Error, {
          fileName: file.name,
        })
        reject(error)
      }
    }

    reader.onerror = (error) => {
      logger.error("Error reading file:", error as Error, {
        fileName: file.name,
      })
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}
import * as XLSX from "xlsx"

export const readExcel = (file: File, isMultipleHeaders: boolean = false): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        if (!isMultipleHeaders) {
          // 单行表头的简单处理逻辑
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "null",
            raw: false,
          })
          resolve(jsonData)
          return
        }

        // 以下是多行表头的处理逻辑
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        const merges = worksheet['!merges'] || []

        // 处理表头
        let headers: string[][] = []
        for(let R = range.s.r; R <= range.e.r && R < 2; ++R) {
          let row: string[] = []
          for(let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})]
            let value = cell ? cell.v : ''
            if (!value) {
              const mergeCell = merges.find(m => 
                R >= m.s.r && R <= m.e.r && 
                C >= m.s.c && C <= m.e.c
              )
              if (mergeCell) {
                const mainCell = worksheet[XLSX.utils.encode_cell({
                  r: mergeCell.s.r,
                  c: mergeCell.s.c
                })]
                value = mainCell ? mainCell.v : ''
              }
            }
            row.push(value)
          }
          headers.push(row)
        }

        // 合并表头并处理
        const mergedHeaders = headers[0].map((_, colIndex) => {
          const headerParts = headers
            .map(row => row[colIndex])
            .filter(Boolean)
          
          if (headerParts.length === 2) {
            // 检查是否为重复的单行表头
            if (headerParts[0] === headerParts[1]) {
              return headerParts[0]
            }
            return headerParts.join('-')
          }
          
          return headerParts[0]
        })

        // 使用处理后的表头读取数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "null",
          raw: false,
          header: mergedHeaders,
          range: headers.length > 1 ? range.s.r + 2 : range.s.r + 1
        })

        resolve(jsonData)
      } catch (error) {
        console.error('Error processing Excel file:', error)
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
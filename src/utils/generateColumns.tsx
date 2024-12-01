// 生成列配置
export const generateColumns = (data: any[]) => {
  if (!data || data.length === 0) return []

  const firstItem = data[0]
  const columns: any[] = []

  const processObject = (obj: any, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      if (Array.isArray(value)) {
        // 处理数组类型
        const arrayColumns = processArrayColumns(value, prefix ? `${prefix}.${key}` : key)
        columns.push(...arrayColumns)
        return
      }

      if (typeof value === "object") {
        processObject(value, prefix ? `${prefix}.${key}` : key)
        return
      }

      const accessorKey = prefix ? `${prefix}.${key}` : key

      columns.push({
        header: accessorKey,
        accessorKey,
        cell: (value: any) => {
          if (value === null || value === undefined) return "-"
          if (typeof value === "boolean") return value ? "true" : "false"
          if (typeof value === "number") return value.toString()
          return value
        },
      })
    })
  }

  processObject(firstItem)
  return columns
}

// 处理数组列配置
const processArrayColumns = (array: any[], prefix: string) => {
  const columns: any[] = []

  if (array.length === 0) return columns

  const firstItem = array[0]
  if (typeof firstItem === "object" && firstItem !== null) {
    Object.keys(firstItem).forEach((key) => {
      columns.push({
        header: `${prefix}[].${key}`,
        accessorKey: `${prefix}[0].${key}`,
        cell: (value: any) => {
          if (value === null || value === undefined) return "-"
          if (typeof value === "boolean") return value ? "true" : "false"
          if (typeof value === "number") return value.toString()
          return value
        },
      })
    })
  } else {
    columns.push({
      header: prefix,
      accessorKey: `${prefix}[0]`,
      cell: (value: any) => {
        if (value === null || value === undefined) return "-"
        if (typeof value === "boolean") return value ? "true" : "false"
        if (typeof value === "number") return value.toString()
        return value
      },
    })
  }

  return columns
}

// 处理数组数据
export const processArrayData = (array: any[], prefix = "") => {
  const result: any = {}

  array.forEach((item, index) => {
    if (typeof item === "object" && item !== null) {
      const flatItem = flattenData([item])[0]
      Object.entries(flatItem).forEach(([key, value]) => {
        result[`${prefix}[${index}].${key}`] = value
      })
    } else {
      result[`${prefix}[${index}]`] = item
    }
  })

  return result
}

// 检查字符串是否为 base64 图片
const isBase64Image = (str: string): boolean => {
  if (typeof str !== "string") return false
  // 检查是否是 base64 图片格式
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i
  return base64Regex.test(str) && str.length > 100 // 长度检查避免误判
}

// 扁平化数据
export const flattenData = (data: any[]) => {
  return data.map((item) => {
    const flatItem: any = {}

    const flatten = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined) return

        if (Array.isArray(value)) {
          // 处理数组类型
          const arrayData = processArrayData(value, prefix ? `${prefix}.${key}` : key)
          Object.assign(flatItem, arrayData)
          return
        }

        if (typeof value === "object") {
          flatten(value, prefix ? `${prefix}.${key}` : key)
          return
        }

        const accessorKey = prefix ? `${prefix}.${key}` : key
        // 检查是否为 base64 图片，如果是则用 true 代替
        flatItem[accessorKey] = typeof value === "string" && isBase64Image(value) ? true : value
      })
    }

    flatten(item)
    return flatItem
  })
}

export const extractShataAICode = (content: string) => {
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    return match[1].trim()
  }
  return null
}

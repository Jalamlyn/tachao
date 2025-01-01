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

/**
 * 从内容中提取 mo-ai-code 标签中的代码
 * 支持以下格式:
 * 1. 简单标签: <mo-ai-code>code</mo-ai-code>
 * 2. 带参数标签: <mo-ai-code type="page" pageid="xxx" title="xxx">code</mo-ai-code>
 * 3. 带参数标签: <mo-ai-code type="store" name="xxx">code</mo-ai-code>
 * @param content 包含代码的字符串
 * @returns 提取的代码内容
 */
export const extractShataAICode = (content: string): string => {
  if (!content) return content

  try {
    // 匹配带参数的 mo-ai-code 标签
    // [\s\S]*? 用于非贪婪匹配任意字符(包括换行)
    // [^>]* 用于匹配除>之外的任意字符(标签参数)
    const regex = /<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/
    const match = content.match(regex)
    
    if (match && match[1]) {
      return match[1].trim()
    }
    
    // 如果没有匹配到标签或内容为空,返回原始内容
    return content
  } catch (error) {
    console.error('Error extracting mo-ai-code:', error)
    // 发生错误时返回原始内容
    return content
  }
}
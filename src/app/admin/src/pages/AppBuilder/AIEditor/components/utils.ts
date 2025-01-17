export const getCodeTypeIcon = (type: string) => {
  switch (type) {
    case "app":
      return "mdi:application"
    case "page":
      return "mdi:file-code"
    case "store":
      return "mdi:database"
    case "service":
      return "mdi:api"
    case "module":
      return "mdi:puzzle"
    case "markdown":
      return "mdi:markdown"
    default:
      return "mdi:code-tags"
  }
}

export const getCodeTypeColor = (type: string) => {
  switch (type) {
    case "app":
      return "primary"
    case "page":
      return "success"
    case "store":
      return "warning"
    case "service":
      return "danger"
    case "module":
      return "secondary"
    default:
      return "default"
  }
}

// 计算模块大小
export const calculateModuleSize = (code: string): number => {
  return new Blob([code]).size
}

// 格式化文件大小
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

// 获取模块大小的颜色标识
export const getModuleSizeColor = (bytes: number): "success" | "warning" | "danger" => {
  if (bytes < 5 * 1024) return "success" // 小于10KB
  if (bytes < 10 * 1024) return "warning" // 小于50KB
  return "danger" // 大于50KB
}

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

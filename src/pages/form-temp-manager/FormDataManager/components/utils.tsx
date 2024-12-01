import { Column, ColumnDef } from "@tanstack/react-table"
import { CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

// 固定列样式处理函数
export const getPinningStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right")

  return {
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    backgroundColor: isPinned ? "#ffffff" : undefined,
    boxShadow: isLastLeftPinnedColumn
      ? "-2px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "2px 0 4px -4px gray inset"
        : undefined,
    opacity: isPinned ? 0.95 : 1,
    zIndex: isPinned ? 1 : 0,
  }
}

// 辅助函数：检测是否为base64图片
const isBase64Image = (str: string): boolean => {
  try {
    return typeof str === 'string' && str.startsWith('data:image') && str.includes('base64');
  } catch {
    return false;
  }
}

// 辅助函数：获取对象的值，支持嵌套路径
export const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj)
}

// 辅助函数：展平对象
export const flattenObject = (obj: any, prefix = "") => {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre = prefix.length ? prefix + "." : ""
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

// 辅助函数：生成多级表头配置
export const generateColumns = (obj: any, parentKey: string = "", level: number = 0): ColumnDef<any>[] => {
  if (typeof obj !== "object" || obj === null) {
    return []
  }

  return Object.entries(obj).reduce((acc: ColumnDef<any>[], [key, value]) => {
    const currentPath = parentKey ? `${parentKey}.${key}` : key

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // 如果是对象，创建一个分组列
      const subColumns = generateColumns(value, currentPath, level + 1)
      if (subColumns.length > 0) {
        acc.push({
          id: currentPath,
          header: key,
          columns: subColumns,
        })
      }
    } else {
      // 如果是基础类型，创建一个普通列
      acc.push({
        accessorFn: (row) => getNestedValue(row, currentPath),
        id: currentPath,
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className='hover:bg-transparent'
          >
            {key}
            <Icon
              icon={
                column.getIsSorted() === "asc"
                  ? "lucide:chevron-up"
                  : column.getIsSorted() === "desc"
                    ? "lucide:chevron-down"
                    : "lucide:chevrons-up-down"
              }
              className='ml-2 h-4 w-4'
            />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue()
          if (!value) return '-'

          // 处理base64图片
          if (typeof value === 'string' && isBase64Image(value)) {
            return (
              <div className="relative group">
                <img 
                  src={value} 
                  alt="图片" 
                  className="max-h-20 max-w-40 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const img = new Image()
                    img.src = value
                    const w = window.open("")
                    if (w) {
                      w.document.write(img.outerHTML)
                      w.document.title = "图片预览"
                      w.document.close()
                    }
                  }}
                />
                <div className="absolute hidden group-hover:flex items-center justify-center gap-2 top-0 right-0 bg-black/50 p-1 rounded">
                  <a 
                    href={value} 
                    download="image.png"
                    className="text-white hover:text-gray-200 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon icon="lucide:download" className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )
          }

          if (Array.isArray(value)) {
            return `[${value.length} items]`
          }
          return value?.toString() || "-"
        },
      })
    }
    return acc
  }, [])
}
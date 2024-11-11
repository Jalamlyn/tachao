import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Tooltip,
  Pagination,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface Resource {
  id: string
  name: string
  type: string
  size: string
  updatedAt: string
  status: "active" | "processing" | "error"
}

const mockData: Resource[] = [
  {
    id: "1",
    name: "销售数据.xlsx",
    type: "Excel",
    size: "2.5MB",
    updatedAt: "2024-01-20 10:30",
    status: "active",
  },
  // 添加更多模拟数据...
]

const ResourceTable: React.FC = () => {
  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const filteredItems = mockData.filter((item) =>
    item.name.toLowerCase().includes(filterValue.toLowerCase())
  )

  const pages = Math.ceil(filteredItems.length / rowsPerPage)
  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const renderCell = (item: Resource, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <Icon icon="mdi:file-excel" className="w-5 h-5 text-success" />
            <span>{item.name}</span>
          </div>
        )
      case "status":
        return (
          <Chip
            color={item.status === "active" ? "success" : item.status === "processing" ? "primary" : "danger"}
            size="sm"
            variant="flat"
          >
            {item.status === "active" ? "已上传" : item.status === "processing" ? "处理中" : "失败"}
          </Chip>
        )
      case "actions":
        return (
          <div className="flex gap-2">
            <Tooltip content="预览">
              <Button isIconOnly size="sm" variant="light">
                <Icon icon="mdi:eye" className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="编辑">
              <Button isIconOnly size="sm" variant="light">
                <Icon icon="mdi:pencil" className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="删除">
              <Button isIconOnly size="sm" variant="light" className="text-danger">
                <Icon icon="mdi:delete" className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return item[columnKey as keyof Resource]
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          isClearable
          className="w-full max-w-xs"
          placeholder="搜索资料..."
          startContent={<Icon icon="mdi:search" />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
        />
      </div>

      <Table
        aria-label="资料列表"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn key="name">资料名称</TableColumn>
          <TableColumn key="type">类型</TableColumn>
          <TableColumn key="size">大小</TableColumn>
          <TableColumn key="updatedAt">更新时间</TableColumn>
          <TableColumn key="status">状态</TableColumn>
          <TableColumn key="actions">操作</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ResourceTable
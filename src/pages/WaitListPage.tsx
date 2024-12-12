import React, { useEffect, useState, useMemo } from "react"
import { queryWaitList, WaitListQueryParams } from "@/service/apis/api"
import {
  Input,
  Checkbox,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Chip,
} from "@nextui-org/react"

interface WaitListItem {
  id: string
  email: string
  phone: string
  developer: boolean
  industry: string
  purpose: string
  createdAt: string
}

interface SortDescriptor {
  column?: string
  direction?: "ascending" | "descending"
}

const WaitListPage: React.FC = () => {
  const [waitList, setWaitList] = useState<WaitListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({})
  const [queryParams, setQueryParams] = useState<WaitListQueryParams>({
    email: "",
    phone: "",
    developer: undefined,
    industry: "",
    purpose: "",
  })

  const fetchWaitList = async () => {
    try {
      setLoading(true)
      const response = await queryWaitList(queryParams)
      setWaitList(response.data || [])
    } catch (error) {
      console.error("Failed to fetch wait list:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitList()
  }, [])

  const handleSearch = () => {
    setPage(1)
    fetchWaitList()
  }

  const handleResetSearch = async () => {
    setPage(1)
    setSearchText("")
    setQueryParams({
      email: "",
      phone: "",
      developer: undefined,
      industry: "",
      purpose: "",
    })
    try {
      setLoading(true)
      const response = await queryWaitList({
        email: "",
        phone: "",
        developer: undefined,
        industry: "",
        purpose: "",
      })
      setWaitList(response.data || [])
    } catch (error) {
      console.error("Failed to fetch wait list:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      name: "邮箱",
      uid: "email",
      sortable: true,
    },
    {
      name: "手机",
      uid: "phone",
      sortable: true,
    },
    {
      name: "是否开发者",
      uid: "developer",
    },
    {
      name: "行业",
      uid: "industry",
      sortable: true,
    },
    {
      name: "用途",
      uid: "purpose",
      sortable: true,
    },
    {
      name: "创建时间",
      uid: "createdAt",
      sortable: true,
    },
  ]

  const renderCell = (item: WaitListItem, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof WaitListItem]

    switch (columnKey) {
      case "developer":
        return (
          <Chip color={cellValue ? "success" : "default"} size="sm" variant="flat">
            {cellValue ? "是" : "否"}
          </Chip>
        )
      case "createdAt":
        return new Date(cellValue).toLocaleString()
      default:
        return cellValue
    }
  }

  // 模糊搜索逻辑
  const filteredItems = useMemo(() => {
    let filtered = [...waitList]
    
    if (searchText) {
      filtered = filtered.filter((item) => {
        return (
          item.email.toLowerCase().includes(searchText.toLowerCase()) ||
          item.phone.toLowerCase().includes(searchText.toLowerCase()) ||
          item.industry.toLowerCase().includes(searchText.toLowerCase()) ||
          item.purpose.toLowerCase().includes(searchText.toLowerCase())
        )
      })
    }
    return filtered
  }, [waitList, searchText])

  // 排序逻辑
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof WaitListItem]
      const second = b[sortDescriptor.column as keyof WaitListItem]

      if (typeof first === 'boolean' || typeof second === 'boolean') {
        return sortDescriptor.direction === "ascending" 
          ? (first === second ? 0 : first ? 1 : -1)
          : (first === second ? 0 : first ? -1 : 1)
      }

      const cmp = String(first).localeCompare(String(second))
      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [filteredItems, sortDescriptor])

  const pages = Math.ceil(sortedItems.length / rowsPerPage)
  const items = sortedItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="邮箱"
          value={queryParams.email}
          onChange={(e) => setQueryParams({ ...queryParams, email: e.target.value })}
          clearable
        />
        <Input
          label="手机"
          value={queryParams.phone}
          onChange={(e) => setQueryParams({ ...queryParams, phone: e.target.value })}
          clearable
        />
        <Input
          label="行业"
          value={queryParams.industry}
          onChange={(e) => setQueryParams({ ...queryParams, industry: e.target.value })}
          clearable
        />
        <Input
          label="用途"
          value={queryParams.purpose}
          onChange={(e) => setQueryParams({ ...queryParams, purpose: e.target.value })}
          clearable
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="搜索邮箱、手机、行业或用途..."
          value={searchText}
          onClear={() => setSearchText("")}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <Checkbox
            isSelected={queryParams.developer}
            onValueChange={(checked) => setQueryParams({ ...queryParams, developer: checked })}
          >
            是否开发者
          </Checkbox>
          <Button size="sm" color="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button size="sm" variant="bordered" onClick={handleResetSearch}>
            重置
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <span className="text-default-400 text-small">
          总计: {sortedItems.length} 条记录
        </span>
      </div>
    </div>
  )

  const bottomContent = (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="text-small text-default-400">
        {`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, sortedItems.length)} of ${sortedItems.length}`}
      </span>
      <Pagination
        showControls
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  )

  return (
    <div className="p-6">
      <Table
        aria-label="Wait List Table"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: "max-h-[600px]",
          table: "min-h-[400px]",
        }}
        shadow="sm"
        radius="lg"
        isStriped
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn 
              key={column.uid} 
              allowsSorting={column.sortable}
              className={column.sortable ? "cursor-pointer" : ""}
            >
              {column.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={loading ? <Spinner label="加载中..." /> : "暂无数据"}
          isLoading={loading}
        >
          {(item: WaitListItem) => (
            <TableRow key={item.id}>
              {(columnKey: React.Key) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default WaitListPage
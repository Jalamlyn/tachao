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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react"

// 添加 ChevronDownIcon 组件
const ChevronDownIcon = ({ strokeWidth = 1.5, ...props }: { strokeWidth?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
)

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

const developerOptions = [
  { name: "全部", uid: "all" },
  { name: "是", uid: "true" },
  { name: "否", uid: "false" },
]

const WaitListPage: React.FC = () => {
  const [waitList, setWaitList] = useState<WaitListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({})
  const [developerFilter, setDeveloperFilter] = useState(new Set(["all"]))
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
    setDeveloperFilter(new Set(["all"]))
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
          <Chip color={cellValue ? "success" : "default"} size='sm' variant='flat'>
            {cellValue ? "是" : "否"}
          </Chip>
        )
      case "createdAt":
        return new Date(cellValue).toLocaleString()
      default:
        return cellValue
    }
  }

  // 模糊搜索和过滤逻辑
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

    // 开发者状态过滤
    const selectedDeveloper = Array.from(developerFilter)[0]
    if (selectedDeveloper !== "all") {
      filtered = filtered.filter((item) => {
        return item.developer === (selectedDeveloper === "true")
      })
    }

    return filtered
  }, [waitList, searchText, developerFilter])

  // 排序逻辑
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof WaitListItem]
      const second = b[sortDescriptor.column as keyof WaitListItem]

      if (typeof first === "boolean" || typeof second === "boolean") {
        return sortDescriptor.direction === "ascending"
          ? first === second
            ? 0
            : first
              ? 1
              : -1
          : first === second
            ? 0
            : first
              ? -1
              : 1
      }

      const cmp = String(first).localeCompare(String(second))
      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [filteredItems, sortDescriptor])

  const pages = Math.ceil(sortedItems.length / rowsPerPage)
  const items = sortedItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const topContent = (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row justify-between gap-3 items-end'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='搜索邮箱、手机、行业或用途...'
          value={searchText}
          onClear={() => setSearchText("")}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className='flex gap-3'>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button 
                endContent={<ChevronDownIcon className="text-small" />}
                variant="flat" 
                size="sm"
              >
                开发者状态
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="开发者状态过滤"
              closeOnSelect={true}
              selectedKeys={developerFilter}
              selectionMode="single"
              onSelectionChange={setDeveloperFilter}
            >
              {developerOptions.map((option) => (
                <DropdownItem key={option.uid} className="capitalize">
                  {option.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className='flex justify-end'>
        <span className='text-default-400 text-small'>总计: {sortedItems.length} 条记录</span>
      </div>
    </div>
  )

  const bottomContent = (
    <div className='py-2 px-2 flex justify-between items-center'>
      <span className='text-small text-default-400'>
        {`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, sortedItems.length)} of ${sortedItems.length}`}
      </span>
      <Pagination showControls color='primary' page={page} total={pages} onChange={setPage} />
    </div>
  )

  return (
    <div className='p-6'>
      <Table
        aria-label='Wait List Table'
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        topContent={topContent}
        topContentPlacement='outside'
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: "max-h-[600px]",
          table: "min-h-[400px]",
        }}
        shadow='sm'
        radius='lg'
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
          emptyContent={loading ? <Spinner label='加载中...' /> : "暂无数据"}
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
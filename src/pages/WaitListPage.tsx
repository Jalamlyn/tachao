import React, { useEffect, useState } from "react"
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
  TableCell
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

const WaitListPage: React.FC = () => {
  const [waitList, setWaitList] = useState<WaitListItem[]>([])
  const [loading, setLoading] = useState(false)
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
    fetchWaitList()
  }

  const columns = [
    { 
      name: "Email",
      uid: "email",
      sortable: true,
    },
    { 
      name: "Phone", 
      uid: "phone",
      sortable: true,
    },
    { 
      name: "Developer", 
      uid: "developer" 
    },
    { 
      name: "Industry", 
      uid: "industry",
      sortable: true,
    },
    { 
      name: "Purpose", 
      uid: "purpose",
      sortable: true,
    },
    { 
      name: "Created At", 
      uid: "createdAt",
      sortable: true,
    },
  ]

  const renderCell = (item: WaitListItem, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof WaitListItem]

    switch (columnKey) {
      case "developer":
        return cellValue ? "Yes" : "No"
      case "createdAt":
        return new Date(cellValue).toLocaleString()
      default:
        return cellValue
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-6 flex flex-wrap gap-4'>
        <Input
          label='Email'
          value={queryParams.email}
          onChange={(e) => setQueryParams({ ...queryParams, email: e.target.value })}
        />
        <Input
          label='Phone'
          value={queryParams.phone}
          onChange={(e) => setQueryParams({ ...queryParams, phone: e.target.value })}
        />
        <Input
          label='Industry'
          value={queryParams.industry}
          onChange={(e) => setQueryParams({ ...queryParams, industry: e.target.value })}
        />
        <Input
          label='Purpose'
          value={queryParams.purpose}
          onChange={(e) => setQueryParams({ ...queryParams, purpose: e.target.value })}
        />
        <Checkbox
          isSelected={queryParams.developer}
          onValueChange={(checked) => setQueryParams({ ...queryParams, developer: checked })}
        >
          Developer
        </Checkbox>
        <Button color='primary' onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Table
        aria-label="Wait List Table"
        isHeaderSticky
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
            >
              {column.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody 
          items={waitList}
          emptyContent={loading ? "Loading..." : "No wait list records found"}
        >
          {(item: WaitListItem) => (
            <TableRow key={item.id}>
              {(columnKey: React.Key) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default WaitListPage
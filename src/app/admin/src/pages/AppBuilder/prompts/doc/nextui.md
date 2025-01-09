```jsx
import React, { useState } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Select,
  SelectItem,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Chip as NextUIChip,
} from "@nextui-org/react"
import { Image, ChevronDownIcon, VerticalDotsIcon, SearchIcon, PlusIcon } from "@nextui-org-icons/react"

// Shared data
export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Tech Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Sr. Dev",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
]

// Table columns and options
export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "AGE", uid: "age", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "TEAM", uid: "team" },
  { name: "EMAIL", uid: "email" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
]

export const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
]

// Utility function
export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ""
}

// Icons
const PlusIconComponent = ({ size = 24 }) => <PlusIcon size={size} className='text-current' />

const VerticalDotsIconComponent = ({ size = 24 }) => <VerticalDotsIcon size={size} className='text-current' />

const SearchIconComponent = ({ size = 24 }) => <SearchIcon size={size} className='text-current' />

const ChevronDownIconComponent = ({ size = 24 }) => <ChevronDownIcon size={size} className='text-current' />

// App component
export default function App() {
  // State for Table
  const [filterValue, setFilterValue] = useState("")
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(["name", "role", "status", "actions"]))
  const [statusFilter, setStatusFilter] = useState("all")
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState({ column: "age", direction: "ascending" })
  const [page, setPage] = useState(1)

  // Derived states for Table
  const hasSearchFilter = Boolean(filterValue)
  const filteredItems = users.filter((user) =>
    hasSearchFilter ? user.name.toLowerCase().includes(filterValue.toLowerCase()) : true
  )
  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const sortedItems = [...items].sort((a, b) => {
    const first = a[sortDescriptor.column]
    const second = b[sortDescriptor.column]
    const cmp = first < second ? -1 : first > second ? 1 : 0
    return sortDescriptor.direction === "descending" ? -cmp : cmp
  })
  const pages = Math.ceil(users.length / rowsPerPage)

  // Render cell for Table
  const renderCell = (user, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "full", size: "sm", src: user.avatar }}
            description={user.email}
            name={user.name}
          />
        )
      case "role":
        return (
          <div className='flex flex-col'>
            <p className='text-bold text-small capitalize'>{user.role}</p>
            <p className='text-bold text-tiny capitalize text-default-500'>{user.team}</p>
          </div>
        )
      case "status":
        return (
          <NextUIChip
            color={user.status === "active" ? "success" : user.status === "paused" ? "danger" : "warning"}
            variant='dot'
            size='sm'
          >
            {user.status}
          </NextUIChip>
        )
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size='sm' variant='light'>
                <VerticalDotsIconComponent />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key='view'>View</DropdownItem>
              <DropdownItem key='edit'>Edit</DropdownItem>
              <DropdownItem key='delete'>Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )
      default:
        return user[columnKey]
    }
  }

  // Top content for Table
  const topContent = (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between gap-3 items-end'>
        <Input
          isClearable
          placeholder='Search by name...'
          size='sm'
          startContent={<SearchIconComponent />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={(e) => setFilterValue(e.target.value)}
        />
        <div className='flex gap-3'>
          <Dropdown>
            <DropdownTrigger>
              <Button endContent={<ChevronDownIconComponent />} size='sm' variant='flat'>
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Table Columns'
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode='multiple'
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid}>{capitalize(status.name)}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button endContent={<ChevronDownIconComponent />} size='sm' variant='flat'>
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Table Columns'
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode='multiple'
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid}>{capitalize(column.name)}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button className='bg-foreground text-background' endContent={<PlusIconComponent />}>
            Add New
          </Button>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-default-400 text-small'>Total {users.length} users</span>
        <label className='flex items-center text-default-400 text-small'>
          Rows per page:
          <select
            className='bg-transparent outline-none text-default-400 text-small'
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value='5'>5</option>
            <option value='10'>10</option>
            <option value='15'>15</option>
          </select>
        </label>
      </div>
    </div>
  )

  // Bottom content for Table
  const bottomContent = (
    <div className='py-2 px-2 flex justify-between items-center'>
      <Pagination showControls color='default' page={page} total={pages} onChange={setPage} />
      <span className='text-small text-default-400'>
        {selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${items.length} selected`}
      </span>
    </div>
  )

  // Render Table
  const renderTable = () => (
    <Table
      isCompact
      aria-label='Example table with custom cells, pagination and sorting'
      bottomContent={bottomContent}
      bottomContentPlacement='outside'
      selectedKeys={selectedKeys}
      selectionMode='multiple'
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement='outside'
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns.filter((col) => visibleColumns.has(col.uid))}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent='No users found' items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )

  // Render Select
  const renderSelect = () => (
    <Select
      classNames={{
        base: "max-w-xs",
        trigger: "h-12",
      }}
      items={users}
      label='Assigned to'
      labelPlacement='outside'
      placeholder='Select a user'
      renderValue={(selected) => (
        <div className='flex items-center gap-2'>
          <Avatar alt={selected.data.name} size='sm' src={selected.data.avatar} />
          <div className='flex flex-col'>
            <span>{selected.data.name}</span>
            <span className='text-default-500 text-tiny'>{selected.data.email}</span>
          </div>
        </div>
      )}
    >
      {(user) => (
        <SelectItem key={user.id} textValue={user.name}>
          <div className='flex gap-2 items-center'>
            <Avatar alt={user.name} size='sm' src={user.avatar} />
            <div className='flex flex-col'>
              <span className='text-small'>{user.name}</span>
              <span className='text-tiny text-default-400'>{user.email}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  )

  // Render Card
  const renderCard = () => (
    <Card className='max-w-[400px] mb-6'>
      <CardHeader>
        <h4 className='font-bold text-xl'>Basic Card</h4>
      </CardHeader>
      <CardBody>
        <p>This is a basic card with some text content.</p>
      </CardBody>
      <CardFooter>
        <Button color='primary'>Action</Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className='bg-gradient-to-tr from-[#FFB457] to-[#FF705B] p-6 rounded-lg'>
      {/* Card Example */}
      {renderCard()}

      {/* Select Example */}
      {renderSelect()}

      {/* Table Example */}
      {renderTable()}
    </div>
  )
}
```

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

## Listbox Component

```jsx
export default function App() {
  return (
    <Listbox
      aria-label='User Menu'
      className='p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium'
      itemClasses={{
        base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
      }}
      onAction={(key) => alert(key)}
    >
      <ListboxItem
        key='issues'
        href='#issues'
        endContent={<ItemCounter number={13} />}
        startContent={<IconWrapper icon={bugIcon} className='bg-success/10 text-success' />}
      >
        Issues
      </ListboxItem>
      <ListboxItem
        key='pull_requests'
        href='#pull_requests'
        endContent={<ItemCounter number={6} />}
        startContent={<IconWrapper icon={pullRequestIcon} className='bg-primary/10 text-primary' />}
      >
        Pull Requests
      </ListboxItem>
      {/* Repeat for other ListboxItem components, replacing icons and adding href as needed */}
    </Listbox>
  )
}
```

## NextUI Card Component

```jsx
import React from "react";
import {Card, CardHeader, CardBody, CardFooter, Avatar, Button} from "@nextui-org/react";

export default function App() {
  const [isFollowed, setIsFollowed] = React.useState(false);

  return (
    <Card className="max-w-[340px]">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar
            isBordered
            radius="full"
            size="md"
            src="https://nextui.org/avatars/avatar-1.png"
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">Zoey Lang</h4>
            <h5 className="text-small tracking-tight text-default-400">@zoeylang</h5>
          </div>
        </div>
        <Button
          className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
          color="primary"
          radius="full"
          size="sm"
          variant={isFollowed ? "bordered" : "solid"}
          onPress={() => setIsFollowed(!isFollowed)}
        >
          {isFollowed ? "Unfollow" : "Follow"}
        </Button>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <p>Frontend developer and UI/UX enthusiast. Join me on this coding adventure!</p>
        <span className="pt-2">
          #FrontendWithZoey
          <span aria-label="computer" className="py-2" role="img">
            💻
          </span>
        </span>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">4</p>
          <p className=" text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">97.1K</p>
          <p className="text-default-400 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
}

import {Card, CardFooter, Image, Button} from "@nextui-org/react";

export default function App() {
  return (
    <Card isFooterBlurred className="border-none" radius="lg">
      <Image
        alt="Woman listing to music"
        className="object-cover"
        height={200}
        src="https://nextui.org/images/hero-card.jpeg"
        width={200}
      />
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <p className="text-tiny text-white/80">Available soon.</p>
        <Button
          className="text-tiny text-white bg-black/20"
          color="default"
          radius="lg"
          size="sm"
          variant="flat"
        >
          Notify me
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Card, CardHeader, CardFooter, Image, Button } from "@nextui-org/react"

export default function App() {
  return (
    <div className='max-w-[900px] gap-2 grid grid-cols-12 grid-rows-2 px-8'>
      <Card className='col-span-12 sm:col-span-4 h-[300px]'>
        <CardHeader className='absolute z-10 top-1 flex-col !items-start'>
          <p className='text-tiny text-white/60 uppercase font-bold'>What to watch</p>
          <h4 className='text-white font-medium text-large'>Stream the Acme event</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt='Card background'
          className='z-0 w-full h-full object-cover'
          src='https://nextui.org/images/card-example-4.jpeg'
        />
      </Card>
      <Card className='col-span-12 sm:col-span-4 h-[300px]'>
        <CardHeader className='absolute z-10 top-1 flex-col !items-start'>
          <p className='text-tiny text-white/60 uppercase font-bold'>Plant a tree</p>
          <h4 className='text-white font-medium text-large'>Contribute to the planet</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt='Card background'
          className='z-0 w-full h-full object-cover'
          src='https://nextui.org/images/card-example-3.jpeg'
        />
      </Card>
      <Card className='col-span-12 sm:col-span-4 h-[300px]'>
        <CardHeader className='absolute z-10 top-1 flex-col !items-start'>
          <p className='text-tiny text-white/60 uppercase font-bold'>Supercharged</p>
          <h4 className='text-white font-medium text-large'>Creates beauty like a beast</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt='Card background'
          className='z-0 w-full h-full object-cover'
          src='https://nextui.org/images/card-example-2.jpeg'
        />
      </Card>
      <Card isFooterBlurred className='w-full h-[300px] col-span-12 sm:col-span-5'>
        <CardHeader className='absolute z-10 top-1 flex-col items-start'>
          <p className='text-tiny text-white/60 uppercase font-bold'>New</p>
          <h4 className='text-black font-medium text-2xl'>Acme camera</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt='Card example background'
          className='z-0 w-full h-full scale-125 -translate-y-6 object-cover'
          src='https://nextui.org/images/card-example-6.jpeg'
        />
        <CardFooter className='absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between'>
          <div>
            <p className='text-black text-tiny'>Available soon.</p>
            <p className='text-black text-tiny'>Get notified.</p>
          </div>
          <Button className='text-tiny' color='primary' radius='full' size='sm'>
            Notify Me
          </Button>
        </CardFooter>
      </Card>
      <Card isFooterBlurred className='w-full h-[300px] col-span-12 sm:col-span-7'>
        <CardHeader className='absolute z-10 top-1 flex-col items-start'>
          <p className='text-tiny text-white/60 uppercase font-bold'>Your day your way</p>
          <h4 className='text-white/90 font-medium text-xl'>Your checklist for better sleep</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt='Relaxing app background'
          className='z-0 w-full h-full object-cover'
          src='https://nextui.org/images/card-example-5.jpeg'
        />
        <CardFooter className='absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100'>
          <div className='flex flex-grow gap-2 items-center'>
            <Image
              alt='Breathing app icon'
              className='rounded-full w-10 h-11 bg-black'
              src='https://nextui.org/images/breathing-app-icon.jpeg'
            />
            <div className='flex flex-col'>
              <p className='text-tiny text-white/60'>Breathing App</p>
              <p className='text-tiny text-white/60'>Get a good night&#39;s sleep.</p>
            </div>
          </div>
          <Button radius='full' size='sm'>
            Get App
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```
export default `
const {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter} = context.NextUI
const {Popover, PopoverTrigger, PopoverContent, Button, Input} = context.NextUI;

export default function App() {
  return (
    <Popover showArrow offset={10} placement="bottom">
      <PopoverTrigger>
        <Button color="primary">Customize</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        {(titleProps) => (
          <div className="px-1 py-2 w-full">
            <p className="text-small font-bold text-foreground" {...titleProps}>
              Dimensions
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <Input defaultValue="100%" label="Width" size="sm" variant="bordered" />
              <Input defaultValue="300px" label="Max. width" size="sm" variant="bordered" />
              <Input defaultValue="24px" label="Height" size="sm" variant="bordered" />
              <Input defaultValue="30px" label="Max. height" size="sm" variant="bordered" />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

# NextUI Select 多行选择的例子

<Select
  selectionMode="multiple"
  isMultiline={true}
  placeholder="选择快捷上下文"
  selectedKeys={appCodeStore.viewState.selectedShortcuts}
  onSelectionChange={(keys) => appCodeStore.applyContextShortcuts(Array.from(keys) as string[])}
  className="w-full"
  items={appCodeStore.viewState.contextShortcuts}
  labelPlacement="outside"
  classNames={{
    trigger: "min-h-12 py-2",
    value: "text-small",
  }}
  renderValue={(items) => {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip
            key={item.key}
            variant="flat"
            color="primary"
            startContent={
              <Icon 
                icon="solar:bookmark-square-minimalistic-linear" 
                className="w-3 h-3"
              />
            }
          >
            {item.data.name}
            <span className="text-tiny ml-1">
              ({item.data.moduleIds.length}个模块)
            </span>
          </Chip>
        ))}
      </div>
    );
  }}
>
  {(shortcut) => (
    <SelectItem 
      key={shortcut.id} 
      textValue={shortcut.name}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon 
              icon="solar:bookmark-square-minimalistic-linear" 
              className="w-4 h-4 text-primary"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-small">{shortcut.name}</span>
            <span className="text-tiny text-default-400">
              {shortcut.moduleIds.length} 个模块
            </span>
          </div>
        </div>
        <Button
          size="sm"
          isIconOnly
          variant="light" 
          color="danger"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            appCodeStore.deleteContextShortcut(shortcut.id)
          }}
        >
          <Icon icon="mdi:delete" className="w-4 h-4"/>
        </Button>
      </div>
    </SelectItem>
  )}
</Select>

# NextUI 组件使用的例子，仅供参考

const { Card, CardBody, CardFooter, CardHeader, Image, Input, Select, SelectItem, Button } = context.NextUI;

export default function App() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h3 className="font-bold text-large">{project.title}</h3>
        <div className="flex items-center gap-2 text-sm text-default-500">
          <span>{project.style}</span>
          <span>·</span>
          <span>{project.area}m²</span>
        </div>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <div className="relative">
          <Image
            src={project.coverImage}
            alt={project.title}
            className="object-cover rounded-xl w-full aspect-video"
            loading="lazy"
          />
          <CardFooter className="justify-end before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
            <Button
              isIconOnly
              className={portfolioStore.favorites.has(project.id)
                ? "bg-transparent text-danger border-danger-200"
                : "bg-white/70 backdrop-blur-sm"
              }
              color={portfolioStore.favorites.has(project.id) ? "danger" : "default"}
              radius="lg"
              size="sm"
              variant={portfolioStore.favorites.has(project.id) ? "bordered" : "solid"}
              onPress={() => portfolioStore.toggleFavorite(project.id)}
              aria-label={
                portfolioStore.favorites.has(project.id)
                  ? "取消收藏"
                  : "收藏"
              }
            >
              <Icon
                icon={
                  portfolioStore.favorites.has(project.id)
                    ? "solar:heart-bold"
                    : "solar:heart-linear"
                }
                className="w-4 h-4"
              />
            </Button>
          </CardFooter>
        </div>
      </CardBody>
    </Card>
  );
}

const { Card, CardBody, CardFooter, CardHeader, Image, Input, Select, SelectItem, Button } = context.NextUI;

export default function App() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h3 className="font-bold text-large">{project.title}</h3>
        <div className="flex items-center gap-2 text-sm text-default-500">
          <span>{project.style}</span>
          <span>·</span>
          <span>{project.area}m²</span>
        </div>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <div className="relative">
          <Image
            src={project.coverImage}
            alt={project.title}
            className="object-cover rounded-xl w-full aspect-video"
            loading="lazy"
          />
          <CardFooter className="justify-end before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
            <Button
              isIconOnly
              className={portfolioStore.favorites.has(project.id)
                ? "bg-transparent text-danger border-danger-200"
                : "bg-white/70 backdrop-blur-sm"
              }
              color={portfolioStore.favorites.has(project.id) ? "danger" : "default"}
              radius="lg"
              size="sm"
              variant={portfolioStore.favorites.has(project.id) ? "bordered" : "solid"}
              onPress={() => portfolioStore.toggleFavorite(project.id)}
              aria-label={
                portfolioStore.favorites.has(project.id)
                  ? "取消收藏"
                  : "收藏"
              }
            >
              <Icon
                icon={
                  portfolioStore.favorites.has(project.id)
                    ? "solar:heart-bold"
                    : "solar:heart-linear"
                }
                className="w-4 h-4"
              />
            </Button>
          </CardFooter>
        </div>
      </CardBody>
    </Card>
  );
}
const {
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
  Listbox,
  ListboxItem,
  Image,
} = context.NextUI
import { ChevronDownIcon, VerticalDotsIcon, SearchIcon, PlusIcon } from "@nextui-org-icons/react";

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
];

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "AGE", uid: "age", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "TEAM", uid: "team" },
  { name: "EMAIL", uid: "email" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const PlusIconComponent = ({ size = 24 }) => <PlusIcon size={size} className='text-current' />;

const VerticalDotsIconComponent = ({ size = 24 }) => <VerticalDotsIcon size={size} className='text-current' />;

const SearchIconComponent = ({ size = 24 }) => <SearchIcon size={size} className='text-current' />;

const ChevronDownIconComponent = ({ size = 24 }) => <ChevronDownIcon size={size} className='text-current' />;

export default function App() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(["name", "role", "status", "actions"]));
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "age", direction: "ascending" });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);
  const filteredItems = users.filter((user) =>
    hasSearchFilter ? user.name.toLowerCase().includes(filterValue.toLowerCase()) : true
  );
  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const sortedItems = [...items].sort((a, b) => {
    const first = a[sortDescriptor.column];
    const second = b[sortDescriptor.column];
    const cmp = first < second ? -1 : first > second ? 1 : 0;
    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });
  const pages = Math.ceil(users.length / rowsPerPage);

  const renderCell = (user, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "full", size: "sm", src: user.avatar }}
            description={user.email}
            name={user.name}
          />
        );
      case "role":
        return (
          <div className='flex flex-col'>
            <p className='text-bold text-small capitalize'>{user.role}</p>
            <p className='text-bold text-tiny capitalize text-default-500'>{user.team}</p>
          </div>
        );
      case "status":
        return (
          <NextUIChip
            color={user.status === "active" ? "success" : user.status === "paused" ? "danger" : "warning"}
            variant='dot'
            size='sm'
          >
            {user.status}
          </NextUIChip>
        );
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
        );
      default:
        return user[columnKey];
    }
  };

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
  );

  const bottomContent = (
    <div className='py-2 px-2 flex justify-between items-center'>
      <Pagination showControls color='default' page={page} total={pages} onChange={setPage} />
      <span className='text-small text-default-400'>
        {selectedKeys === "all" ? "All items selected" : \`\${selectedKeys.size} of \${items.length} selected\`}
      </span>
    </div>
  );

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
  );

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
  );

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
  );

  return (
    <div className='bg-gradient-to-tr from-[#FFB457] to-[#FF705B] p-6 rounded-lg'>
      {renderCard()}
      {renderSelect()}
      {renderTable()}
    </div>
  );
}
`

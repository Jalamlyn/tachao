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
"use client";

import React from "react";
import {
  Chip,
  Button,
  Card,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
  Spacer,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis} from "recharts";

type ChartData = {
  month: string;
  value: number;
  lastYearValue: number;
};

type Chart = {
  key: string;
  title: string;
  value: number;
  suffix: string;
  type: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  chartData: ChartData[];
};

const data: Chart[] = [
  {
    key: "unique-visitors",
    title: "Unique Visitors",
    suffix: "visitors",
    value: 147000,
    type: "number",
    change: "12.8%",
    changeType: "positive",
    chartData: [
      {month: "Jan", value: 98000, lastYearValue: 43500},
      {month: "Feb", value: 125000, lastYearValue: 38500},
      {month: "Mar", value: 89000, lastYearValue: 58300},
      {month: "Apr", value: 156000, lastYearValue: 35300},
      {month: "May", value: 112000, lastYearValue: 89600},
      {month: "Jun", value: 167000, lastYearValue: 56400},
      {month: "Jul", value: 138000, lastYearValue: 45200},
      {month: "Aug", value: 178000, lastYearValue: 84600},
      {month: "Sep", value: 129000, lastYearValue: 73500},
      {month: "Oct", value: 159000, lastYearValue: 65900},
      {month: "Nov", value: 147000, lastYearValue: 82300},
      {month: "Dec", value: 127000, lastYearValue: 95000},
    ],
  },
  {
    key: "total-visits",
    title: "Total Visits",
    suffix: "visits",
    value: 623000,
    type: "number",
    change: "-2.1%",
    changeType: "neutral",
    chartData: [
      {month: "Jan", value: 587000, lastYearValue: 243500},
      {month: "Feb", value: 698000, lastYearValue: 318500},
      {month: "Mar", value: 542000, lastYearValue: 258300},
      {month: "Apr", value: 728000, lastYearValue: 335300},
      {month: "May", value: 615000, lastYearValue: 289600},
      {month: "Jun", value: 689000, lastYearValue: 256400},
      {month: "Jul", value: 573000, lastYearValue: 245200},
      {month: "Aug", value: 695000, lastYearValue: 384600},
      {month: "Sep", value: 589000, lastYearValue: 273500},
      {month: "Oct", value: 652000, lastYearValue: 365900},
      {month: "Nov", value: 623000, lastYearValue: 282300},
      {month: "Dec", value: 523000, lastYearValue: 295000},
    ],
  },
  {
    key: "total-page-views",
    title: "Total Page Views",
    suffix: "views",
    value: 2312000,
    type: "number",
    change: "-5.7%",
    changeType: "negative",
    chartData: [
      {month: "Jan", value: 2820000, lastYearValue: 1435000},
      {month: "Feb", value: 2380000, lastYearValue: 1285000},
      {month: "Mar", value: 2690000, lastYearValue: 1583000},
      {month: "Apr", value: 2145000, lastYearValue: 1235000},
      {month: "May", value: 2760000, lastYearValue: 1896000},
      {month: "Jun", value: 2280000, lastYearValue: 1564000},
      {month: "Jul", value: 2620000, lastYearValue: 1452000},
      {month: "Aug", value: 2145000, lastYearValue: 1846000},
      {month: "Sep", value: 2470000, lastYearValue: 1735000},
      {month: "Oct", value: 2230000, lastYearValue: 1659000},
      {month: "Nov", value: 2312000, lastYearValue: 1823000},
      {month: "Dec", value: 2230000, lastYearValue: 1950000},
    ],
  },
  {
    key: "bounce-rate",
    title: "Bounce Rate",
    value: 36.78,
    suffix: "bounce rate",
    type: "percentage",
    change: "2.4%",
    changeType: "positive",
    chartData: [
      {month: "Jan", value: 42.82, lastYearValue: 25.12},
      {month: "Feb", value: 35.95, lastYearValue: 18.45},
      {month: "Mar", value: 39.25, lastYearValue: 22.85},
      {month: "Apr", value: 34.58, lastYearValue: 15.92},
      {month: "May", value: 40.92, lastYearValue: 24.38},
      {month: "Jun", value: 35.15, lastYearValue: 16.75},
      {month: "Jul", value: 38.75, lastYearValue: 21.45},
      {month: "Aug", value: 33.95, lastYearValue: 17.82},
      {month: "Sep", value: 39.65, lastYearValue: 23.15},
      {month: "Oct", value: 35.85, lastYearValue: 19.95},
      {month: "Nov", value: 36.78, lastYearValue: 20.45},
      {month: "Dec", value: 34.78, lastYearValue: 18.25},
    ],
  },
];

const formatValue = (value: number, type: string | undefined) => {
  if (type === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k";
    }

    return value.toLocaleString();
  }
  if (type === "percentage") return \`\${value}%\`;

  return value;
};

const formatMonth = (month: string) => {
  const monthNumber =
    {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    }[month] ?? 0;

  return new Intl.DateTimeFormat("en-US", {month: "long"}).format(new Date(2024, monthNumber, 1));
};
export default function Component() {
  const [activeChart, setActiveChart] = React.useState<(typeof data)[number]["key"]>(data[0].key);

  const activeChartData = React.useMemo(() => {
    const chart = data.find((d) => d.key === activeChart);

    return {
      chartData: chart?.chartData ?? [],
      color:
        chart?.changeType === "positive"
          ? "success"
          : chart?.changeType === "negative"
            ? "danger"
            : "default",
      suffix: chart?.suffix,
      type: chart?.type,
    };
  }, [activeChart]);

  const {chartData, color, suffix, type} = activeChartData;

  return (
    <Card as="dl" className="border border-transparent dark:border-default-100">
      <section className="flex flex-col flex-nowrap">
        <div className="flex flex-col justify-between gap-y-2 p-6">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-0">
              <dt className="text-medium font-medium text-foreground">Analytics</dt>
            </div>
            <Spacer y={2} />
            <Tabs size="sm">
              <Tab key="6-months" title="6 Months" />
              <Tab key="3-months" title="3 Months" />
              <Tab key="30-days" title="30 Days" />
              <Tab key="7-days" title="7 Days" />
              <Tab key="24-hours" title="24 Hours" />
            </Tabs>
            <div className="mt-2 flex w-full items-center">
              <div className="-my-3 flex w-full max-w-[800px] items-center gap-x-3 overflow-x-auto py-3">
                {data.map(({key, change, changeType, type, value, title}) => (
                  <button
                    key={key}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-medium p-3 transition-colors",
                      {
                        "bg-default-100": activeChart === key,
                      },
                    )}
                    onClick={() => setActiveChart(key)}
                  >
                    <span
                      className={cn("text-small font-medium text-default-500 transition-colors", {
                        "text-primary": activeChart === key,
                      })}
                    >
                      {title}
                    </span>
                    <div className="flex items-center gap-x-3">
                      <span className="text-3xl font-bold text-foreground">
                        {formatValue(value, type)}
                      </span>
                      <Chip
                        classNames={{
                          content: "font-medium",
                        }}
                        color={
                          changeType === "positive"
                            ? "success"
                            : changeType === "negative"
                              ? "danger"
                              : "default"
                        }
                        radius="sm"
                        size="sm"
                        startContent={
                          changeType === "positive" ? (
                            <Icon height={16} icon={"solar:arrow-right-up-linear"} width={16} />
                          ) : changeType === "negative" ? (
                            <Icon height={16} icon={"solar:arrow-right-down-linear"} width={16} />
                          ) : (
                            <Icon height={16} icon={"solar:arrow-right-linear"} width={16} />
                          )
                        }
                        variant="flat"
                      >
                        <span>{change}</span>
                      </Chip>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ResponsiveContainer
          className="min-h-[300px] [&_.recharts-surface]:outline-none"
          height="100%"
          width="100%"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            height={300}
            margin={{
              left: 0,
              right: 0,
            }}
            width={500}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="10%"
                  stopColor={\`hsl(var(--heroui-\${color}-500))\`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={\`hsl(var(--heroui-\${color}-100))\`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
              stroke="hsl(var(--heroui-default-200))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              style={{fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)"}}
              tickLine={false}
            />
            <Tooltip
              content={({label, payload}) => (
                <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                  <div className="flex w-full flex-col gap-y-0">
                    {payload?.map((p, index) => {
                      const name = p.name;
                      const value = p.value;

                      return (
                        <div key={\`\${index}-${name}\`} className="flex w-full items-center gap-x-2">
                          <div className="flex w-full items-center gap-x-1 text-small text-background">
                            <span>{formatValue(value as number, type)}</span>
                            <span>{suffix}</span>
                          </div>
                        </div>
                      );
                    })}
                    <span className="text-small font-medium text-foreground-400">
                      {formatMonth(label)} 25, 2024
                    </span>
                  </div>
                </div>
              )}
              cursor={{
                strokeWidth: 0,
              }}
            />
            <Area
              activeDot={{
                stroke: \`hsl(var(--heroui-\${color === "default" ? "foreground" : color}))\`,
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="value"
              fill="url(#colorGradient)"
              stroke={\`hsl(var(--heroui-\${color === "default" ? "foreground" : color}))\`}
              strokeWidth={2}
              type="monotone"
            />
            <Area
              activeDot={{
                stroke: "hsl(var(--heroui-default-400))",
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="lastYearValue"
              fill="transparent"
              stroke="hsl(var(--heroui-default-400))"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
        <Dropdown
          classNames={{
            content: "min-w-[120px]",
          }}
          placement="bottom-end"
        >
          <DropdownTrigger>
            <Button
              isIconOnly
              className="absolute right-2 top-2 w-auto rounded-full"
              size="sm"
              variant="light"
            >
              <Icon height={16} icon="solar:menu-dots-bold" width={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            itemClasses={{
              title: "text-tiny",
            }}
            variant="flat"
          >
            <DropdownItem key="view-details">View Details</DropdownItem>
            <DropdownItem key="export-data">Export Data</DropdownItem>
            <DropdownItem key="set-alert">Set Alert</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </section>
    </Card>
  );
}

`

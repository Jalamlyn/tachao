import React, { useEffect, useState, useMemo, useCallback } from "react"
import { queryWaitList, WaitListQueryParams } from "@/service/apis/api"
import {
  Input,
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { message } from "@/components/Message"

// 添加 ChevronDownIcon 组件
const ChevronDownIcon = ({ strokeWidth = 1.5, ...props }: { strokeWidth?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
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
  const { isOpen, onOpen, onClose } = useDisclosure()
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

  // 手机验证相关状态
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [smsCooldown, setSmsCooldown] = useState(0)
  const [verificationInfo, setVerificationInfo] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)

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

  const startCooldown = useCallback(() => {
    setSmsCooldown(60)
    const interval = setInterval(() => {
      setSmsCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleSendSms = async () => {
    if (!phone.trim()) {
      message.error("请输入手机号")
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      message.error("请输入正确的手机号")
      return
    }

    try {
      setVerifying(true)
      const auth = app.auth()
      const verification = await auth.getVerification({
        phone_number: `+86 ${phone.trim()}`,
      })
      setVerificationInfo(verification)
      message.success("验证码已发送")
      startCooldown()
    } catch (error) {
      console.error("Failed to send SMS:", error)
      message.error("发送验证码失败，请重试")
    } finally {
      setVerifying(false)
    }
  }

  const handleVerify = async () => {
    if (!phone.trim() || !smsCode.trim()) {
      message.error("请输入手机号和验证码")
      return
    }

    if (!/^\d{6}$/.test(smsCode.trim())) {
      message.error("请输入6位数字验证码")
      return
    }

    try {
      setVerifying(true)
      const auth = app.auth()
      const verificationTokenRes = await auth.verify({
        verification_id: verificationInfo.verification_id,
        verification_code: smsCode.trim(),
      })

      if (verificationInfo.is_user) {
        await auth.signIn({
          username: `+86 ${phone.trim()}`,
          verification_token: verificationTokenRes.verification_token,
        })
      } else {
        await auth.signUp({
          phone_number: `+86 ${phone.trim()}`,
          verification_code: smsCode.trim(),
          verification_token: verificationTokenRes.verification_token,
          password: "admin_123",
          username: "admin_admin",
        })
      }

      message.success("验证成功")
      onClose()
      // 这里可以添加后续的账号申请逻辑
    } catch (error) {
      console.error("Failed to verify:", error)
      message.error("验证失败，请重试")
    } finally {
      setVerifying(false)
    }
  }

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

    const selectedDeveloper = Array.from(developerFilter)[0]
    if (selectedDeveloper !== "all") {
      filtered = filtered.filter((item) => {
        return item.developer === (selectedDeveloper === "true")
      })
    }

    return filtered
  }, [waitList, searchText, developerFilter])

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
            <DropdownTrigger className='hidden sm:flex'>
              <Button endContent={<ChevronDownIcon className='text-small' />} variant='flat' size='sm'>
                开发者状态
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='开发者状态过滤'
              closeOnSelect={true}
              selectedKeys={developerFilter}
              selectionMode='single'
              onSelectionChange={setDeveloperFilter}
            >
              {developerOptions.map((option) => (
                <DropdownItem key={option.uid} className='capitalize'>
                  {option.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" onClick={onOpen}>申请开通账号</Button>
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>手机号验证</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="手机号"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              />
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  label="验证码"
                  placeholder="请输入验证码"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <Button
                  className="self-end"
                  isDisabled={smsCooldown > 0 || verifying}
                  onClick={handleSendSms}
                >
                  {smsCooldown > 0 ? `${smsCooldown}s` : "获取验证码"}
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleVerify} isLoading={verifying}>
              验证并申请
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default WaitListPage
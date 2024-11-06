import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Chip,
  Tooltip,
  Spinner,
  Switch,
} from "@nextui-org/react"
import { PlusIcon, EyeIcon, EditIcon, DeleteIcon } from "lucide-react"
import {
  queryRoles,
  createRole,
  updateRole,
  getRoleDetails,
  disableRole,
  enableRole,
  deleteRole,
} from "@/service/apis/api"

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState(null)
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure()

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const res = await queryRoles({})
      setRoles(res.data)
    } catch (error) {
      console.error("获取角色列表失败", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async (values) => {
    try {
      await createRole(values)
      onCreateModalClose()
      fetchRoles()
    } catch (error) {
      console.error("创建角色失败", error)
    }
  }

  const handleEditRole = async (values) => {
    try {
      await updateRole({ ...values, id: selectedRole.id })
      onEditModalClose()
      fetchRoles()
    } catch (error) {
      console.error("编辑角色失败", error)
    }
  }

  const handleDeleteRole = async () => {
    try {
      await deleteRole(selectedRole.id)
      onDeleteModalClose()
      fetchRoles()
    } catch (error) {
      console.error("删除角色失败", error)
    }
  }

  const handleToggleRoleStatus = async (id, isActive) => {
    try {
      if (isActive) {
        await disableRole(id)
      } else {
        await enableRole(id)
      }
      fetchRoles()
    } catch (error) {
      console.error("切换角色状态失败", error)
    }
  }

  const handleViewDetails = async (id) => {
    try {
      const details = await getRoleDetails(id)
      setSelectedRole(details)
      onDetailsModalOpen()
    } catch (error) {
      console.error("获取角色详情失败", error)
    }
  }

  const columns = [
    { name: "名称", uid: "name" },
    { name: "英文名称", uid: "keyz" },
    { name: "是否禁用", uid: "active" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (role, columnKey) => {
    switch (columnKey) {
      case "active":
        return <Switch defaultSelected={role.active} onChange={() => handleToggleRoleStatus(role.id, role.active)} />
      case "actions":
        return (
          <div className='flex justify-center gap-2'>
            <Tooltip content='查看详情'>
              <Button isIconOnly size='sm' variant='light' onPress={() => handleViewDetails(role.id)}>
                <EyeIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content='编辑角色'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => {
                  setSelectedRole(role)
                  onEditModalOpen()
                }}
              >
                <EditIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content='删除角色' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='danger'
                onPress={() => {
                  setSelectedRole(role)
                  onDeleteModalOpen()
                }}
              >
                <DeleteIcon size={16} />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return role[columnKey]
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>角色管理</h2>
        <Button color='primary' endContent={<PlusIcon />} onPress={onCreateModalOpen}>
          创建角色
        </Button>
      </div>

      <Table aria-label='角色列表' isHeaderSticky>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={roles} isLoading={isLoading} loadingContent={<Spinner label='加载中...' />}>
          {(item) => (
            <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const values = Object.fromEntries(formData.entries())
                handleCreateRole(values)
              }}
            >
              <ModalHeader>创建角色</ModalHeader>
              <ModalBody>
                <Input name='name' label='名称' required />
                <Input name='keyz' label='键值' required />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' type='submit'>
                  创建
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const values = Object.fromEntries(formData.entries())
                handleEditRole(values)
              }}
            >
              <ModalHeader>编辑角色</ModalHeader>
              <ModalBody>
                <Input name='name' label='名称' defaultValue={selectedRole?.name} required />
                <Input name='keyz' label='键值' defaultValue={selectedRole?.keyz} required />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' type='submit'>
                  保存
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>您确定要删除角色 "{selectedRole?.name}" 吗？此操作不可撤销。</ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onDeleteModalClose}>
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteRole}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} size='lg'>
        <ModalContent>
          <ModalHeader>角色详情</ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold'>名称</h3>
                <p>{selectedRole?.name}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>键值</h3>
                <p>{selectedRole?.keyz}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>状态</h3>
                <Chip color={selectedRole?.active ? "success" : "danger"}>
                  {selectedRole?.active ? "启用" : "禁用"}
                </Chip>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>系统角色</h3>
                <p>{selectedRole?.system ? "是" : "否"}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>组织ID</h3>
                <p>{selectedRole?.organizationId}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>创建时间</h3>
                <p>{new Date(selectedRole?.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold'>更新时间</h3>
                <p>{new Date(selectedRole?.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onDetailsModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default RoleManagement

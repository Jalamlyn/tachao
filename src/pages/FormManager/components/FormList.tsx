import React from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { MetadataDetail } from "@/components/from-templates/hook/useMetadata"

interface FormListProps {
  forms: MetadataDetail[]
}

const FormList: React.FC<FormListProps> = ({ forms }) => {
  const navigate = useNavigate()

  const handleView = (formId: string) => {
    navigate(`/we-chat-app/admin/forms/${formId}`)
  }

  const handleEdit = (formId: string) => {
    navigate(`/we-chat-app/admin/forms/edit/${formId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Table aria-label="单据列表">
      <TableHeader>
        <TableColumn>标题</TableColumn>
        <TableColumn>状态</TableColumn>
        <TableColumn>更新时间</TableColumn>
        <TableColumn>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {forms.map((form) => (
          <TableRow key={form.id}>
            <TableCell>{form.title}</TableCell>
            <TableCell>{form.status}</TableCell>
            <TableCell>{formatDate(form.updatedAt)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content="查看">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleView(form.id)}
                  >
                    <Icon icon="mdi:eye" className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="编辑">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleEdit(form.id)}
                  >
                    <Icon icon="mdi:pencil" className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FormList
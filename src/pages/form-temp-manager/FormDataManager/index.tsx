import React, { useState, useEffect, useMemo } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Button, Card, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import PageLayout from "@/components/PageLayout"
import FormDataTable from "./components/FormDataTable"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const FormDataManager: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const location = useLocation()
  const { title } = location.state || {}

  const [formData, setFormData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const { updateBreadcrumbs } = useBreadcrumb()

  const { loadFilteredDetails, remove } = useMetadata("form")

  // 加载表单数据
  const loadFormData = async () => {
    if (!templateId) return

    setIsLoading(true)
    try {
      const forms = await loadFilteredDetails((index) => index.indexFields?.templateId === templateId)
      setFormData(forms)
    } catch (error) {
      console.error("Failed to load form data:", error)
      message.error("加载表单数据失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFormData()
  }, [templateId])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "表单模板管理", href: "/admin/documents" },
      { label: `${title || "表单"} - 数据管理`, href: "" },
    ])
  }, [])

  // 处理数据统计
  const statistics = useMemo(() => {
    return {
      total: formData.length,
      completed: formData.filter((item) => item.processConfirmations?.completed).length,
      pending: formData.filter((item) => !item.processConfirmations?.completed).length,
    }
  }, [formData])

  const handleEdit = (row: any) => {
    // 实现编辑逻辑
    console.log("Edit row:", row)
  }

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id)
      message.success("删除成功")
      loadFormData()
    } catch (error) {
      console.error("Delete failed:", error)
      message.error("删除失败")
    }
  }

  const pageActions = <></>

  return (
    <PageLayout title={`${title || "表单"} - 数据管理`} titleIcon='mdi:database' actions={pageActions}>
      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card className='p-4'>
          <div className='text-sm text-gray-500'>总数据量</div>
          <div className='text-2xl font-bold'>{statistics.total}</div>
        </Card>
        <Card className='p-4'>
          <div className='text-sm text-gray-500'>已完成</div>
          <div className='text-2xl font-bold text-success'>{statistics.completed}</div>
        </Card>
        <Card className='p-4'>
          <div className='text-sm text-gray-500'>待处理</div>
          <div className='text-2xl font-bold text-warning'>{statistics.pending}</div>
        </Card>
      </div>

      {/* 数据表格 */}
      <FormDataTable
        data={formData}
        isLoading={isLoading}
        onSelectionChange={setSelectedRows}
        onRefresh={loadFormData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageLayout>
  )
}

export default FormDataManager

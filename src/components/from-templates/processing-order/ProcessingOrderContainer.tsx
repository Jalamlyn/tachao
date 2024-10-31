import React, { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProcessingOrderForm from "./ProcessingOrderForm"
import FormHistoryTable from "../../forms/FormHistoryTable"
import { useParams } from "react-router-dom"
import { Icon } from "@iconify/react"
import StatusFlowChart from "../StatusFlowChart"
import { ProcessingOrderStatus } from "./types/ProcessingOrder"
import { message } from "@/components/Message"

const ProcessingOrderContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isEditable, setIsEditable] = useState(id === "create")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("processingOrder")

  const toggleEditMode = useCallback(() => {
    setIsEditable(prev => !prev)
  }, [])

  const handleFormSaved = useCallback(() => {
    setIsEditable(false)
  }, [])

  const handleTabChange = useCallback((value: string) => {
    if (isEditable && value !== "processingOrder") {
      message.warning("请先保存或取消编辑")
      return
    }
    setActiveTab(value)
  }, [isEditable])

  const getStatusDescription = useCallback((status: ProcessingOrderStatus) => {
    const statusMap: Record<ProcessingOrderStatus, string> = {
      initial: "初始状态",
      pending_partner_receipt: "待委托方收货",
      pending_processing_start: "待开始加工",
      processing: "加工中",
      pending_our_receipt: "待我方收货",
      pending_inspection: "待检验",
      pending_payment: "待付款",
      pending_partner_payment_confirmation: "待委托方确认收款",
      archived: "已归档"
    }
    return statusMap[status] || status
  }, [])

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-4'>
          <div className="flex items-center gap-4">
            <h1 className='text-2xl font-bold'>委外加工单</h1>
            {id !== "create" && (
              <span className="text-sm text-gray-500">
                单号: {id}
              </span>
            )}
          </div>
          {id !== "create" && (
            <div className="flex gap-2">
              <Button 
                onClick={toggleEditMode} 
                variant={isEditable ? "destructive" : "outline"}
                size="default"
                className="gap-2"
              >
                <Icon icon={isEditable ? "mdi:close" : "mdi:pencil"} />
                {isEditable ? "取消编辑" : "编辑"}
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className={`grid w-full ${id === "create" ? "grid-cols-1" : "grid-cols-2"}`}>
            <TabsTrigger value="processingOrder">委外加工单</TabsTrigger>
            {id !== "create" && <TabsTrigger value="status">状态流程</TabsTrigger>}
          </TabsList>

          <TabsContent value="processingOrder" className="space-y-4">
            <ProcessingOrderForm
              isEditable={isEditable}
              formId={id || ""}
              isSaving={isSaving}
              onFormSaved={handleFormSaved}
              onSavingStateChange={setIsSaving}
            />
          </TabsContent>

          {id !== "create" && (
            <TabsContent value="status">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">当前状态</h3>
                  <p className="text-primary">{getStatusDescription("initial")}</p>
                </div>
                <StatusFlowChart currentStatus="initial" />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProcessingOrderContainer
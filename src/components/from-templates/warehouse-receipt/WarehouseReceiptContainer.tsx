import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WarehouseReceiptForm from "./WarehouseReceiptForm"
import FormHistoryTable from "../../forms/FormHistoryTable"
import { useParams } from "react-router-dom"
import { Icon } from "@iconify/react"

const WarehouseReceiptContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isEditable, setIsEditable] = useState(id === "create")
  const [isSaving, setIsSaving] = useState(false)

  const toggleEditMode = () => {
    setIsEditable(!isEditable)
  }

  const handleFormSaved = () => {
    setIsEditable(false)
  }

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">入库单</h1>
            {id !== "create" && (
              <span className="text-sm text-gray-500">
                单号: {id}
              </span>
            )}
          </div>
          {id !== "create" && (
            <Button
              onClick={toggleEditMode}
              variant={isEditable ? "destructive" : "outline"}
              size="default"
              className="gap-2"
            >
              <Icon icon={isEditable ? "mdi:close" : "mdi:pencil"} />
              {isEditable ? "取消编辑" : "编辑"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="warehouseReceipt">
          <TabsList>
            <TabsTrigger value="warehouseReceipt">入库单</TabsTrigger>
            {id !== "create" && !isEditable && (
              <TabsTrigger value="modificationHistory">修改记录</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="warehouseReceipt">
            <WarehouseReceiptForm
              isEditable={isEditable}
              formId={id || ""}
              isSaving={isSaving}
              onFormSaved={handleFormSaved}
            />
          </TabsContent>

          {id !== "create" && !isEditable && (
            <TabsContent value="modificationHistory">
              <FormHistoryTable formId={id || ""} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default WarehouseReceiptContainer
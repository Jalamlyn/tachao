import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SalesOrderForm from "./SalesOrderForm"
import FormHistoryTable from "../../forms/FormHistoryTable"
import { useParams } from "react-router-dom"
import { Icon } from "@iconify/react"

const SalesOrderContainer: React.FC = () => {
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
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold'>销售订单</h1>
          {id !== "create" && (
            <Button 
              onClick={toggleEditMode} 
              variant="outline"
              size="default"
              className="gap-2"
            >
              <Icon icon={isEditable ? "mdi:close" : "mdi:pencil"} />
              {isEditable ? "取消编辑" : "编辑"}
            </Button>
          )}
        </div>
        <Tabs defaultValue="salesOrder">
          <TabsList>
            <TabsTrigger value="salesOrder">销售订单</TabsTrigger>
            {id !== "create" && !isEditable && (
              <TabsTrigger value="modificationHistory">修改记录</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="salesOrder">
            <SalesOrderForm
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

export default SalesOrderContainer
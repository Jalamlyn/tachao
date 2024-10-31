import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SalesOrderForm from "./SalesOrderForm"
import FormHistoryTable from "../../forms/FormHistoryTable"
import { useParams } from "react-router-dom"
import { Icon } from "@iconify/react"
import { useSalesOrderForm } from "./hooks/useSalesOrderForm"

const SalesOrderContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isEditable, setIsEditable] = useState(id === "create")
  const [isSaving, setIsSaving] = useState(false)
  const { form, loading } = useSalesOrderForm(id || "", () => {
    setIsEditable(false)
  })

  const toggleEditMode = () => {
    setIsEditable(!isEditable)
  }

  const handleFormSaved = () => {
    setIsEditable(false)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Icon icon='mdi:loading' className='w-8 h-8 text-blue-500 animate-spin' />
      </div>
    )
  }

  return (
    <div className='w-full'>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className='flex justify-between items-center mb-4'>
            <h1 className='text-2xl font-bold'>
              银隆销售订单申请单
            </h1>
            
            {id !== "create" && (
              <div>
                <Button 
                  onClick={toggleEditMode} 
                  variant='outline' 
                  size='default' 
                  className='gap-2 relative overflow-hidden group'
                >
                  <span>
                    <Icon icon={isEditable ? "mdi:close" : "mdi:pencil"} className="w-4 h-4" />
                  </span>
                  <span className="ml-2">
                    {isEditable ? "取消编辑" : "编辑"}
                  </span>
                </Button>
              </div>
            )}
          </div>

          <Tabs defaultValue='salesOrder'>
            <TabsList className="relative">
              <TabsTrigger value='salesOrder' className="relative">
                订单信息
              </TabsTrigger>
              {id !== "create" && !isEditable && (
                <TabsTrigger value='modificationHistory' className="relative">
                  修改记录
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value='salesOrder'>
              <div>
                <SalesOrderForm
                  isEditable={isEditable}
                  formId={id || ""}
                  isSaving={isSaving}
                  onFormSaved={handleFormSaved}
                />
              </div>
            </TabsContent>
            {id !== "create" && !isEditable && (
              <TabsContent value='modificationHistory'>
                <div>
                  <FormHistoryTable formId={id || ""} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesOrderContainer
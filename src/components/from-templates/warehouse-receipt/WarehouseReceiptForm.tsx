import React from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Icon } from "@iconify/react"
import { message } from "@/components/Message"
import BasicInfo from "./components/BasicInfo"
import MaterialDetails from "./components/MaterialDetails"
import WarehouseInfo from "./components/WarehouseInfo"
import ApprovalInfo from "./components/ApprovalInfo"
import Attachment from "../sales-order/components/Attachment"
import OrderNumberField from "@/components/common/OrderNumberField"
import { useWarehouseReceiptForm } from "./hooks/useWarehouseReceiptForm"

interface WarehouseReceiptFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
}

const WarehouseReceiptForm: React.FC<WarehouseReceiptFormProps> = ({
  formId,
  isEditable,
  isSaving,
  onFormSaved,
}) => {
  const {
    form,
    loading,
    isSaving: isSubmitting,
    onSubmit,
    handleAddMaterial,
    handleDeleteMaterial,
    handleQuantityChange,
    handleUnitPriceChange,
  } = useWarehouseReceiptForm(formId, onFormSaved)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = form.formState.errors
    const errorMessages: string[] = []

    const collectErrors = (obj: any) => {
      for (const key in obj) {
        if (obj[key]?.message) {
          errorMessages.push(obj[key].message)
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          collectErrors(obj[key])
        }
      }
    }

    collectErrors(errors)

    if (errorMessages.length > 0) {
      message.error(errorMessages)
      return
    }

    form.handleSubmit(onSubmit)(e)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <OrderNumberField
          form={form}
          prefix="RK"
          fieldName="data.basicInfo.receiptNumber"
          disabled={!isEditable}
        />

        <BasicInfo form={form} isEditable={isEditable} />

        <MaterialDetails
          form={form}
          isEditable={isEditable}
          onAddMaterial={handleAddMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onQuantityChange={handleQuantityChange}
          onUnitPriceChange={handleUnitPriceChange}
        />

        <WarehouseInfo form={form} isEditable={isEditable} />

        <ApprovalInfo form={form} isEditable={isEditable} />

        <Attachment form={form} isEditable={isEditable} />

        <div className="flex justify-between mt-6 space-x-4">
          {isEditable && (
            <Button
              type="submit"
              disabled={isSubmitting || isSaving}
              variant="default"
              size="default"
              className="gap-2"
            >
              <Icon icon="mdi:content-save" />
              {formId === "create" ? "创建" : "保存"}
              {(isSubmitting || isSaving) && (
                <Icon icon="mdi:loading" className="animate-spin" />
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default WarehouseReceiptForm
import React from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Icon } from "@iconify/react"
import { useFormMetadata } from "../hook/useFormMetadata"
import BasicInfo from "./components/BasicInfo"
import MaterialDetails from "./components/MaterialDetails"
import OrderStatus from "./components/OrderStatus"
import Attachment from "../sales-order/components/Attachment"
import { cn } from "@/theme/cn"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import OrderNumberField from "@/components/common/OrderNumberField"
import { useProcessingOrderForm } from "./hooks/useProcessingOrderForm"
import { useProcessingOrderSubmit } from "./hooks/useProcessingOrderSubmit"
import { useProcessingOrderInit } from "./hooks/useProcessingOrderInit"
import { message } from "@/components/Message"
import { validateFormData } from "../sales-order/utils/formUtils"

interface ProcessingOrderFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
  onSavingStateChange?: (saving: boolean) => void
}

const   ProcessingOrderForm: React.FC<ProcessingOrderFormProps> = ({
  formId,
  isEditable,
  isSaving: externalIsSaving,
  onFormSaved,
  onSavingStateChange,
}) => {
  const { getFormById, addForm, updateForm } = useFormMetadata()
  const form = useProcessingOrderForm()
  const { loading, manufacturers } = useProcessingOrderInit({ form, formId, getFormById })
  const { isSaving, handleSubmit } = useProcessingOrderSubmit({
    form,
    formId,
    validateForm: () => {
      const errorMessages = validateFormData(form)
      if (errorMessages.length > 0) {
        message.error(errorMessages)
        return false
      }
      return true
    },
    addForm,
    updateForm,
    onFormSaved,
    onSavingStateChange,
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errorMessages = validateFormData(form)
    if (errorMessages.length > 0) {
      message.error(errorMessages)
      return
    }
    form.handleSubmit(handleSubmit)(e)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Icon icon='mdi:loading' className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className='space-y-6'>
        <OrderNumberField form={form} prefix='KJNN' fieldName='data.basicInfo.orderNumber' disabled={!isEditable} />

        <BasicInfo form={form} manufacturers={manufacturers} isEditable={isEditable} />
        <MaterialDetails form={form} isEditable={isEditable} />
        <Attachment form={form} isEditable={isEditable} />
        <OrderStatus form={form} isEditable={isEditable} />

        <div className='flex justify-between mt-6 space-x-4'>
          {isEditable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type='submit'
                      disabled={isSaving}
                      variant='default'
                      size='default'
                      className='gap-2'
                    >
                      <Icon icon='mdi:content-save' />
                      {formId === "create" ? "创建" : "保存"}
                      {isSaving && <Icon icon='mdi:loading' className='animate-spin' />}
                    </Button>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </form>
    </Form>
  )
}

export default ProcessingOrderForm
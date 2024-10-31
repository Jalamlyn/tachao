import React from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { message } from "@/components/Message"
import OrderNumberField from "@/components/common/OrderNumberField"
import { useFormValidation } from "./hooks/useFormValidation"
import { useDeliveryOrderForm } from "./hooks/useDeliveryOrderForm"
import { useProductDetails } from "./hooks/useProductDetails"
import BasicInfoForm from "./components/BasicInfoForm"
import ProductDetails from "./components/ProductDetails"
import ProcessConfirmation from "./components/ProcessConfirmation"

interface DeliveryOrderFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
}

const DeliveryOrderForm: React.FC<DeliveryOrderFormProps> = ({
  formId,
  isEditable,
  isSaving: parentIsSaving,
  onFormSaved,
}) => {
  const { form, loading, isSaving, isInitializing, onSubmit, handleConfirmStep, handleCancelConfirmation } =
    useDeliveryOrderForm(formId, onFormSaved)

  const { hasErrors, validateForm } = useFormValidation(form)
  const { handleQuantityChange, handleUnitPriceChange, handleAddProduct, handleDeleteProduct } = useProductDetails(form)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errorMessages = validateForm()

    if (errorMessages.length > 0) {
      message.error(errorMessages)
      return
    }

    form.handleSubmit(onSubmit)(e)
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
        <OrderNumberField form={form} prefix='DL' fieldName='data.basicInfo.orderNumber' disabled={!isEditable} />

        <BasicInfoForm form={form} isEditable={isEditable} />

        <ProductDetails
          form={form}
          isEditable={isEditable}
          onQuantityChange={handleQuantityChange}
          onUnitPriceChange={handleUnitPriceChange}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        <ProcessConfirmation
          form={form}
          isEditable={isEditable}
          isInitializing={isInitializing}
          onConfirm={handleConfirmStep}
          onCancelConfirmation={handleCancelConfirmation}
        />

        <div className='flex justify-between mt-6 space-x-4'>
          {isEditable && (
            <Button
              type='submit'
              disabled={isSaving || parentIsSaving}
              variant='default'
              size='default'
              className='gap-2'
            >
              <Icon icon='mdi:content-save' />
              {formId === "create" ? "创建" : "保存"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default DeliveryOrderForm

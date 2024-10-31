import React from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { message } from "@/components/Message"
import { Card, CardContent } from "@/components/ui/card"
import { Chip } from "@nextui-org/react"
import OrderNumberField from "@/components/common/OrderNumberField"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { useFormValidation } from "./hook/useFormValidation"
import { useOutsourcingOrderForm } from "./hooks/useOutsourcingOrderForm"
import { useServiceItems } from "./hooks/useServiceItems"
import { useProductDetails } from "./hooks/useProductDetails"
import BasicInfoForm from "./components/BasicInfoForm"
import ProductDetails from "./components/product-details"
import ProcessConfirmationInfo from "./components/ProcessConfirmationInfo"
import { motion, AnimatePresence } from "framer-motion"

interface OutsourcingOrderFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
}

const OutsourcingOrderForm: React.FC<OutsourcingOrderFormProps> = ({
  formId,
  isEditable,
  isSaving: parentIsSaving,
  onFormSaved,
}) => {
  const { form, loading, isSaving, isInitializing, onSubmit, handleConfirmStep, handleCancelConfirmation } =
    useOutsourcingOrderForm(formId, onFormSaved)

  const { hasErrors, validateForm } = useFormValidation(form)
  const { handleSelectServices, handleRemoveService } = useServiceItems(form)
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
        <OrderNumberField form={form} prefix='YL' fieldName='data.basicInfo.orderNumber' disabled={!isEditable} />

        <BasicInfoForm form={form} isEditable={isEditable} />

        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>服务项目</h2>
              {isEditable && (
                <ResourceSelectButton
                  resourceName='银隆服务项目资料表'
                  appId=''
                  onSelect={handleSelectServices}
                  buttonText='导入服务项目'
                  buttonProps={{
                    className: "gap-2",
                    endContent: <Icon icon='mdi:table-search' />,
                  }}
                />
              )}
            </div>
            <motion.div 
              className='flex flex-wrap gap-2'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="popLayout">
                {form.watch("data.serviceItems")?.map((service: any) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <Chip
                      variant="flat"
                      color="primary"
                      classNames={{
                        base: "transition-all duration-200 hover:scale-105",
                        content: "text-sm font-medium",
                      }}
                      onClose={isEditable ? () => handleRemoveService(service.id) : undefined}
                      radius="sm"
                    >
                      {service.name}
                    </Chip>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>

        <ProductDetails
          form={form}
          isEditable={isEditable}
          onQuantityChange={handleQuantityChange}
          onUnitPriceChange={handleUnitPriceChange}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        <ProcessConfirmationInfo
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

export default OutsourcingOrderForm
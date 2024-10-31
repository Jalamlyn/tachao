import React from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { message } from "@/components/Message"
import { Card, CardContent } from "@/components/ui/card"
import OrderNumberField from "@/components/common/OrderNumberField"
import { useSalesOrderForm } from "./hooks/useSalesOrderForm"
import BasicInfoForm from "./components/BasicInfoForm"
import ProductDetails from "./components/ProductDetails"
import { motion } from "framer-motion"

interface SalesOrderFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  formId,
  isEditable,
  isSaving: parentIsSaving,
  onFormSaved,
}) => {
  const { form, loading, isSaving, onSubmit } = useSalesOrderForm(formId, onFormSaved)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BasicInfoForm form={form} isEditable={isEditable} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent>
              <ProductDetails
                form={form}
                isEditable={isEditable}
              />
            </CardContent>
          </Card>
        </motion.div>

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

export default SalesOrderForm
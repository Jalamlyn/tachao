"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/components/ui/form"
import { message } from "@/components/Message"
import CustomerInfo from "./components/CustomerInfo"
import BasicInfo from "./components/BasicInfo"
import ProductDetails from "./components/ProductDetails"
import Attachment from "./components/Attachment"
import DeliveryPlan from "./components/DeliveryPlan"
import FinancialTerms from "./components/FinancialTerms"
import InvoiceDetails from "./components/InvoiceDetails"
import BankAccount from "./components/BankAccount"
import OrderStatusComponent from "./components/OrderStatusComponent"
import { Icon } from "@iconify/react"
import { formSchema } from "./schema"
import OrderNumberField from "@/components/common/OrderNumberField"
import { DEFAULT_FORM_VALUES } from "./constants"
import { useFormData } from "./hook/useFormData"
import { useFormValidation } from "./hook/useFormValidation"
import { useFormSubmit } from "./hook/useFormSubmit"

interface SalesOrderFormProps {
  formId: string
  isEditable: boolean
  isSaving: boolean
  onFormSaved?: () => void
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ formId, isEditable, isSaving, onFormSaved }) => {
  const [activeTab, setActiveTab] = useState("orderDetails")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  })

  const { loading, customers, contacts, products, fetchContacts } = useFormData(form, formId)
  const { hasErrors, validateForm } = useFormValidation(form)
  const { isSaving: isSubmitting, onSubmit } = useFormSubmit(form, formId, onFormSaved)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errorMessages = validateForm()

    if (errorMessages.length > 0) {
      message.error(errorMessages)
      if (hasErrors) {
        setActiveTab("financialDetails")
      }
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
        <OrderNumberField form={form} prefix='SQ' fieldName='data.basicInfo.orderNumber' disabled={!isEditable} />

        <CustomerInfo
          form={form}
          customers={customers}
          contacts={contacts}
          fetchContacts={fetchContacts}
          isEditable={isEditable}
        />

        <BasicInfo form={form} isEditable={isEditable} />

        <ProductDetails form={form} products={products} isEditable={isEditable} />

        <Attachment form={form} isEditable={isEditable} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='orderDetails'>订单明细</TabsTrigger>
            <TabsTrigger value='financialDetails'>
              财务明细
              {hasErrors && <Icon icon='mdi:alert-circle' className='ml-2 text-red-500' width={16} />}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='orderDetails'>
            <div className='space-y-6'>
              <DeliveryPlan form={form} isEditable={isEditable} />
              <FinancialTerms form={form} isEditable={isEditable} />
            </div>
          </TabsContent>
          <TabsContent value='financialDetails'>
            <div className='space-y-6'>
              <InvoiceDetails form={form} isEditable={isEditable} />
              <BankAccount form={form} isEditable={isEditable} />
            </div>
          </TabsContent>
        </Tabs>

        <OrderStatusComponent form={form} isEditable={isEditable} />

        <div className='flex justify-between mt-6 space-x-4'>
          {isEditable && (
            <Button type='submit' disabled={isSubmitting} variant='default' size='default' className='gap-2'>
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

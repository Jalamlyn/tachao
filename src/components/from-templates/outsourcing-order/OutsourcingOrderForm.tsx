import React, { useRef, useState } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { message } from "@/components/Message"
import { Card, CardContent } from "@/components/ui/card"
import OrderNumberField from "@/components/common/OrderNumberField"
import { useFormValidation } from "./hook/useFormValidation"
import { useOutsourcingOrderForm } from "./hooks/useOutsourcingOrderForm"
import { useProductDetails } from "./hooks/useProductDetails"
import BasicInfoForm from "./components/BasicInfoForm"
import ProductDetails from "./components/product-details"
import ProcessConfirmationInfo from "./components/ProcessConfirmationInfo"
import PrintableProductDetails from "./components/product-details/PrintableProductDetails"
import { motion, AnimatePresence } from "framer-motion"
import { useReactToPrint } from "react-to-print"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
  const printRef = useRef<HTMLDivElement>(null)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const { form, loading, isSaving, isInitializing, onSubmit, handleConfirmStep, handleCancelConfirmation } =
    useOutsourcingOrderForm(formId, onFormSaved)

  const { hasErrors, validateForm } = useFormValidation(form)
  const { handleQuantityChange, handleUnitPriceChange, handleAddProduct, handleDeleteProduct } = useProductDetails(form)
  const printId = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "银隆委外加工送货单",
    onBeforePrint: () => {
      return new Promise((resolve) => {
        const formData = form.getValues()
        if (!formData.data?.productDetails?.length) {
          message.error("没有可打印的内容")
          resolve(false)
          return
        }
        printId.current = message.loading("正在准备打印...")
        setTimeout(resolve, 500)
      })
    },
    onAfterPrint: () => {
      message.closeLoading(printId.current)
      setShowPrintPreview(false)
    },
    onPrintError: (error) => {
      message.closeLoading(printId.current)
      console.error("Print error:", error)
      message.error("打印失败，请重试")
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        html, body {
          height: 100vh;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
    bodyClass: "print-content",
    preserveAfterPrint: true,
    suppressErrors: false,
  })

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

  const canPrint = !isEditable && form.getValues().data?.productDetails?.length > 0

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className='space-y-6'>
          <OrderNumberField form={form} prefix='YL' fieldName='data.basicInfo.orderNumber' disabled={!isEditable} />

          <BasicInfoForm form={form} isEditable={isEditable} />

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
            {!isEditable && (
              <Button
                type='button'
                onClick={() => setShowPrintPreview(true)}
                variant='outline'
                size='default'
                className='gap-2'
                disabled={!canPrint}
              >
                <Icon icon='mdi:eye' />
                打印预览
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>打印预览</DialogTitle>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto'>
            <PrintableProductDetails ref={printRef} formData={form.getValues()} />
          </div>
          <DialogFooter className='flex justify-between items-center'>
            <Button variant='outline' onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button onClick={handlePrint} className='gap-2'>
              <Icon icon='mdi:printer' className='w-4 h-4' />
              打印送货单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OutsourcingOrderForm

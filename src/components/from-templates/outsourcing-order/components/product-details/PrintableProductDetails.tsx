import React, { forwardRef } from "react"
import { OutsourcingOrderFormValues } from "../../schema"
import DeliveryNoteTemplate from "../delivery-note/DeliveryNoteTemplate"

interface PrintableProductDetailsProps {
  formData: OutsourcingOrderFormValues
}

const PrintableProductDetails = forwardRef<HTMLDivElement, PrintableProductDetailsProps>(
  ({ formData }, ref) => {
    // 确保有基本数据
    if (!formData?.data?.basicInfo || !formData?.data?.productDetails?.length) {
      return (
        <div ref={ref} className="p-8 print:p-4">
          <p className="text-center text-gray-500">暂无可打印的数据</p>
        </div>
      )
    }

    return (
      <div ref={ref}>
        <DeliveryNoteTemplate formData={formData} />
      </div>
    )
  }
)

PrintableProductDetails.displayName = 'PrintableProductDetails'

export default PrintableProductDetails
import React, { forwardRef } from "react"
import { format } from "date-fns"
import { PRINT_COLUMNS } from "../../constants/productDetailsConstants"
import { OutsourcingOrderFormValues } from "../../schema"

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

    const { basicInfo } = formData.data
    const productDetails = formData.data.productDetails || []

    return (
      <div ref={ref} className="p-8 print:p-4 bg-white">
        {/* 送货单标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">银隆委外加工送货单</h1>
          <div className="mt-4 flex justify-between text-sm">
            <div>单号：{basicInfo.orderNumber}</div>
            <div>日期：{format(new Date(basicInfo.orderDate), "yyyy-MM-dd")}</div>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <div>加工单位：{basicInfo.manufacturer}</div>
            <div>联系人：{basicInfo.manufacturerContact}</div>
          </div>
        </div>

        {/* 产品明细表格 */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {PRINT_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-300 p-2 text-sm font-medium text-left"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productDetails.map((product, index) => (
              <tr key={product.id || index} className="border-b border-gray-200">
                <td className="border border-gray-300 p-2 text-sm">{index + 1}</td>
                <td className="border border-gray-300 p-2 text-sm">{product.productName}</td>
                <td className="border border-gray-300 p-2 text-sm">{product.model}</td>
                <td className="border border-gray-300 p-2 text-sm text-right">{product.inboundQuantity}</td>
                <td className="border border-gray-300 p-2 text-sm text-right">{product.squareMeters}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 签字栏 */}
        <div className="mt-8 flex justify-between text-sm">
          <div>
            <p>送货人签字：________________</p>
            <p className="mt-2">日期：________________</p>
          </div>
          <div>
            <p>收货人签字：________________</p>
            <p className="mt-2">日期：________________</p>
          </div>
        </div>

        {/* 备注 */}
        <div className="mt-8 text-sm">
          <p>备注：</p>
          <p>1. 本单一式两联，收货方、送货方各执一联。</p>
          <p>2. 收货方签收后，即表示货物数量、规格无误。</p>
        </div>

        {/* 打印样式 */}
        <style type="text/css" media="print">{`
          @page {
            size: A4;
            margin: 20mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
            }
            .print-header {
              position: fixed;
              top: 0;
            }
            .print-footer {
              position: fixed;
              bottom: 0;
            }
          }
        `}</style>
      </div>
    )
  }
)

PrintableProductDetails.displayName = 'PrintableProductDetails'

export default PrintableProductDetails
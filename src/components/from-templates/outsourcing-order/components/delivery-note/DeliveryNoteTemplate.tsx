import React from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { OutsourcingOrderFormValues } from "../../schema"

interface DeliveryNoteTemplateProps {
  formData: OutsourcingOrderFormValues
  className?: string
}

const DeliveryNoteTemplate: React.FC<DeliveryNoteTemplateProps> = ({ formData, className }) => {
  const { basicInfo } = formData.data
  const productDetails = formData.data.productDetails || []

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <div className={`p-8 print:p-4 bg-white ${className}`}>
      {/* 送货单标题 */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center mb-8"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-2xl font-bold mb-4"
        >
          银隆委外加工送货单
        </motion.h1>
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <div className="text-left">单号：{basicInfo.orderNumber}</div>
          <div className="text-right">日期：{format(new Date(basicInfo.orderDate), "yyyy-MM-dd")}</div>
        </motion.div>
      </motion.div>

      {/* 基本信息 */}
      <motion.div 
        variants={containerVariants}
        className="mb-6 text-sm grid grid-cols-2 gap-4"
      >
        <motion.div variants={itemVariants}>
          <span className="font-medium">加工单位：</span>
          {basicInfo.manufacturer}
        </motion.div>
        <motion.div variants={itemVariants}>
          <span className="font-medium">联系人：</span>
          {basicInfo.manufacturerContact}
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-2">
          <span className="font-medium">地址：</span>
          {basicInfo.manufacturerAddress}
        </motion.div>
      </motion.div>

      {/* 产品明细表格 */}
      <motion.table 
        variants={containerVariants}
        className="w-full border-collapse mb-8"
      >
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 p-2 text-sm font-medium text-left">序号</th>
            <th className="border border-gray-300 p-2 text-sm font-medium text-left">产品名称</th>
            <th className="border border-gray-300 p-2 text-sm font-medium text-left">料号</th>
            <th className="border border-gray-300 p-2 text-sm font-medium text-right">数量</th>
            <th className="border border-gray-300 p-2 text-sm font-medium text-right">平方数</th>
            <th className="border border-gray-300 p-2 text-sm font-medium text-left">备注</th>
          </tr>
        </thead>
        <tbody>
          {productDetails.map((product, index) => (
            <motion.tr 
              key={product.id || index}
              variants={itemVariants}
              className="border-b border-gray-200"
            >
              <td className="border border-gray-300 p-2 text-sm">{index + 1}</td>
              <td className="border border-gray-300 p-2 text-sm">{product.productName}</td>
              <td className="border border-gray-300 p-2 text-sm">{product.model}</td>
              <td className="border border-gray-300 p-2 text-sm text-right">{product.inboundQuantity}</td>
              <td className="border border-gray-300 p-2 text-sm text-right">{product.squareMeters}</td>
              <td className="border border-gray-300 p-2 text-sm">{product.remarks}</td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      {/* 签字栏 */}
      <motion.div 
        variants={containerVariants}
        className="mt-12 flex justify-between text-sm"
      >
        <motion.div variants={itemVariants}>
          <p>送货人签字：________________</p>
          <p className="mt-2">日期：________________</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p>收货人签字：________________</p>
          <p className="mt-2">日期：________________</p>
        </motion.div>
      </motion.div>

      {/* 备注说明 */}
      <motion.div 
        variants={containerVariants}
        className="mt-8 text-sm text-gray-600"
      >
        <motion.p variants={itemVariants}>备注：</motion.p>
        <motion.ol variants={itemVariants} className="list-decimal ml-4 mt-2 space-y-1">
          <li>本单一式两联，收货方、送货方各执一联。</li>
          <li>收货方签收后，即表示货物数量、规格无误。</li>
          <li>如有质量问题，请在收货后24小时内通知送货方。</li>
        </motion.ol>
      </motion.div>

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

export default DeliveryNoteTemplate
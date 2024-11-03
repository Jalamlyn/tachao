import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import { motion } from "framer-motion"

const DynamicFormTestPage: React.FC = () => {
  const [configInput, setConfigInput] = useState("")
  const [formConfig, setFormConfig] = useState<any>(null)

  // 示例配置
  const exampleConfig = {
    formFields: {
      basicInfo: [
        {
          name: "receiptNo",
          label: "入库单号",
          type: "text",
          required: true,
          disabled: true,
          placeholder: "系统自动生成"
        },
        {
          name: "receiptDate",
          label: "入库日期", 
          type: "date",
          required: true,
          defaultValue: new Date()
        },
        {
          name: "supplierName",
          label: "供应商",
          type: "resource",
          required: true,
          resourceName: "supplier",
          appId: "warehouse"
        },
        {
          name: "warehouseName",
          label: "入库仓库",
          type: "resource",
          required: true,
          resourceName: "warehouse", 
          appId: "warehouse"
        },
        {
          name: "purchaseOrderNo",
          label: "关联采购单",
          type: "resource",
          required: true,
          resourceName: "purchaseOrder",
          appId: "purchase"
        },
        {
          name: "remark",
          label: "备注",
          type: "textarea",
          placeholder: "请输入备注信息"
        }
      ]
    },
    table: {
      columns: [
        {
          key: "productCode",
          title: "商品编码",
          type: "resource",
          required: true,
          width: 120,
          resourceConfig: {
            resourceName: "product",
            appId: "warehouse"
          }
        },
        {
          key: "productName",
          title: "商品名称",
          type: "text", 
          width: 200
        },
        {
          key: "specification",
          title: "规格",
          type: "text",
          width: 120
        },
        {
          key: "unit",
          title: "单位",
          type: "text",
          width: 80
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          required: true,
          width: 100
        },
        {
          key: "unitPrice",
          title: "单价",
          type: "number",
          required: true,
          width: 100
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: 120
        }
      ],
      summary: {
        fields: {
          totalAmount: {
            label: "合计金额",
            calculate: "(records) => records.reduce((sum, record) => sum + (record.amount || 0), 0)"
          }
        }
      },
      rowCalculations: {
        amount: "(record) => (record.quantity || 0) * (record.unitPrice || 0)"
      }
    },
    processSteps: [
      {
        key: "warehouse",
        title: "仓库确认",
        description: "确认商品数量、规格是否符合要求",
        fields: [
          {
            name: "warehouseConfirmStatus",
            label: "确认结果",
            type: "radio",
            required: true,
            options: [
              { label: "通过", value: "approved" },
              { label: "退回", value: "rejected" }
            ]
          },
          {
            name: "warehouseConfirmRemark",
            label: "确认备注",
            type: "textarea",
            placeholder: "请输入确认意见"
          }
        ]
      },
      {
        key: "finance",
        title: "财务确认",
        description: "确认金额计算是否正确",
        fields: [
          {
            name: "financeConfirmStatus",
            label: "确认结果",
            type: "radio",
            required: true,
            options: [
              { label: "通过", value: "approved" },
              { label: "退回", value: "rejected" }
            ]
          },
          {
            name: "financeConfirmRemark",
            label: "确认备注",
            type: "textarea",
            placeholder: "请输入确认意见"
          }
        ]
      },
      {
        key: "purchase",
        title: "采购确认",
        description: "确认是否符合采购要求",
        fields: [
          {
            name: "purchaseConfirmStatus",
            label: "确认结果",
            type: "radio",
            required: true,
            options: [
              { label: "通过", value: "approved" },
              { label: "退回", value: "rejected" }
            ]
          },
          {
            name: "purchaseConfirmRemark",
            label: "确认备注",
            type: "textarea",
            placeholder: "请输入确认意见"
          }
        ]
      }
    ],
    dependencies: {
      amount: {
        dependsOn: ["quantity", "unitPrice"],
        calculate: "(values) => (values.quantity || 0) * (values.unitPrice || 0)"
      }
    },
    customValidators: {
      quantity: "(value) => value <= 0 ? '数量必须大于0' : undefined",
      unitPrice: "(value) => value <= 0 ? '单价必须大于0' : undefined"
    }
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigInput(e.target.value)
  }

  const handleParseConfig = () => {
    try {
      // 将字符串形式的函数转换为实际函数
      const configObj = JSON.parse(configInput)
      
      // 处理 summary.fields 中的 calculate 函数
      if (configObj.table?.summary?.fields) {
        Object.keys(configObj.table.summary.fields).forEach(key => {
          const field = configObj.table.summary.fields[key]
          if (field.calculate && typeof field.calculate === 'string') {
            field.calculate = new Function('return ' + field.calculate)()
          }
        })
      }

      // 处理 rowCalculations 中的函数
      if (configObj.table?.rowCalculations) {
        Object.keys(configObj.table.rowCalculations).forEach(key => {
          const calc = configObj.table.rowCalculations[key]
          if (typeof calc === 'string') {
            configObj.table.rowCalculations[key] = new Function('return ' + calc)()
          }
        })
      }

      // 处理 dependencies 中的 calculate 函数
      if (configObj.dependencies) {
        Object.keys(configObj.dependencies).forEach(key => {
          const dep = configObj.dependencies[key]
          if (dep.calculate && typeof dep.calculate === 'string') {
            dep.calculate = new Function('return ' + dep.calculate)()
          }
        })
      }

      // 处理 customValidators 中的函数
      if (configObj.customValidators) {
        Object.keys(configObj.customValidators).forEach(key => {
          const validator = configObj.customValidators[key]
          if (typeof validator === 'string') {
            configObj.customValidators[key] = new Function('return ' + validator)()
          }
        })
      }

      setFormConfig(configObj)
      message.success("配置解析成功")
    } catch (error) {
      console.error("配置解析错误:", error)
      message.error("请检查输入的配置格式是否正确")
    }
  }

  const handleLoadExample = () => {
    setConfigInput(JSON.stringify(exampleConfig, null, 2))
  }

  const handleSubmit = async (values: any) => {
    console.log("表单提交的值:", values)
    message.success("表单数据已打印到控制台")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>动态表单测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">表单配置</label>
                <div className="flex gap-2 mb-2">
                  <Button onClick={handleLoadExample}>加载示例配置</Button>
                  <Button onClick={handleParseConfig}>解析配置</Button>
                </div>
                <Textarea
                  value={configInput}
                  onChange={handleConfigChange}
                  placeholder="请输入表单配置对象..."
                  className="min-h-[200px] font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {formConfig && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>表单预览</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  config={formConfig}
                  onSubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DynamicFormTestPage
export const warehouseReceiptConfig = `
<mo-ai-form>
export default {
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
          calculate: (records) => records.reduce((sum, record) => sum + (record.amount || 0), 0)
        }
      }
    },
    rowCalculations: {
      amount: (record) => (record.quantity || 0) * (record.unitPrice || 0)
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
      calculate: (values) => (values.quantity || 0) * (values.unitPrice || 0)
    }
  },
  customValidators: {
    quantity: (value) => value <= 0 ? '数量必须大于0' : undefined,
    unitPrice: (value) => value <= 0 ? '单价必须大于0' : undefined
  }
}
</mo-ai-form>
`

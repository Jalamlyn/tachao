```mo
<shata-ai-form>
const components = {
  // 自定义组件定义在这里
}

const utils = {
  // 工具函数定义在这里
}

export default {
  title: "销售订单表单",
  config: {
    metadata: {
      title: "销售订单表单",
      description: "用于创建和管理销售订单",
      permissions: {
        edit: true,
        delete: true,
        print: true
      }
    },
    renderConfig: {
      basicFields: {
        groups: [
          {
            key: "basicInfo",
            title: "基本信息",
            icon: "mdi:information",
            fields: [
              {
                name: "customerName",
                label: "客户名称",
                type: "text",
                required: true,
                placeholder: "请输入客户名称"
              },
              {
                name: "orderDate",
                label: "订单日期",
                type: "date",
                required: true
              },
              {
                name: "salesPerson",
                label: "销售人员",
                type: "text",
                required: true,
                placeholder: "请输入销售人员姓名"
              }
            ]
          }
        ]
      },
      tables: [
  {
    key: "orderItems",
    title: "订单明细",
    icon: "mdi:table",
    description: "请填写订单明细",
    config: {
      columns: [
        {
          key: "product",
          title: "产品",
          type: "resource",
          required: true,
          resourceConfig: {
            resourceId: "resource_1733819280980",
            displayFields: [
              { key: "产品名称", label: "产品名称" },
              { key: "产品编码", label: "产品编码" },
              { key: "规格型号", label: "规格型号" }
            ],
            fieldMapping: {
              "unitPrice": "销售单价(含税)/元",
              "productType": "产品类型",
              "productBrand": "品牌"
            }
          }
        },
        {
          key: "productType",
          title: "产品类型",
          type: "text",
          editable: false
        },
        {
          key: "productBrand",
          title: "品牌",
          type: "text",
          editable: false
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          required: true,
          summary: {
  render: (values) => {
    const total = values.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    return `${total.toFixed(0)} 件`;
  }
}
        },
        {
          key: "unitPrice",
          title: "单价",
          type: "number",
          editable: false
        },
        {
          key: "totalPrice",
          title: "总价",
          type: "number",
          editable: false,
          render: (value, record) => {
            const totalPrice = (record.quantity || 0) * (record.unitPrice || 0);
            return `¥${totalPrice.toFixed(2)}`;
          },
          summary: {
            render: (values) => {
              const total = values.reduce((sum, item) => {
                return sum + ((item.quantity || 0) * (item.unitPrice || 0));
              }, 0);
              return `¥${total.toFixed(2)}`;
            }
          }
        }
      ],
      summary: {
        show: true,
        label: "合计",
        className: "font-bold",
        style: { backgroundColor: "#f9fafb" }
      }
    }
  }
],
      processSteps: [
        {
          key: "approval",
          title: "审批流程",
          icon: "mdi:account-check",
          fields: [
            {
              name: "approver",
              label: "审批人",
              type: "text",
              required: true
            },
            {
              name: "approvalDate",
              label: "审批日期",
              type: "date",
              required: true
            },
            {
              name: "approvalStatus",
              label: "审批状态",
              type: "radio",
              required: true,
              options: [
                { label: "通过", value: "approved" },
                { label: "拒绝", value: "rejected" }
              ]
            },
            {
              name: "approvalComments",
              label: "审批意见",
              type: "textarea"
            }
          ]
        }
      ]
    },
    orderNumberConfig: {
      prefix: "SO",
      fieldName: "orderNumber",
      label: "订单编号"
    },
    validate: async (values, context) => {
      const errors = [];

      // 检查订单明细
      const totalAmount = values.tableData?.orderItems?.reduce((sum, item) =>
        sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0;

      if (totalAmount <= 0) {
        errors.push("订单总金额必须大于0");
      }

      return {
        valid: errors.length === 0,
        errors,
        fields: {}
      };
    },
    watch: (form) => {
      const subscription = form.watch((value, { name }) => {
        // 监听订单明细变化
        if (name.startsWith("tableData.orderItems")) {
          form.trigger("tableData.orderItems");
        }
      });

      return () => subscription.unsubscribe();
    }
  }
}
</shata-ai-form>
```

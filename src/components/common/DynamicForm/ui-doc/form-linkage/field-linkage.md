# 字段联动

## 基础字段联动
```typescript
{
  basicFields: {
    groups: [
      {
        key: "basicLinkage",
        title: "基础联动",
        fields: [
          {
            name: "type",
            label: "类型",
            type: "select",
            options: [
              { label: "个人", value: "personal" },
              { label: "企业", value: "business" }
            ]
          },
          {
            name: "companyName",
            label: "公司名称",
            type: "text",
            showWhen: {
              field: "type",
              value: "business"
            }
          }
        ]
      }
    ]
  }
}
```
基础的字段显示隐藏联动。

## 值联动
```typescript
{
  basicFields: {
    groups: [
      {
        key: "valueLinkage",
        title: "值联动",
        fields: [
          {
            name: "quantity",
            label: "数量",
            type: "number"
          },
          {
            name: "price",
            label: "单价",
            type: "number"
          },
          {
            name: "amount",
            label: "金额",
            type: "number",
            disabled: true,
            compute: (data) => {
              return (data.quantity || 0) * (data.price || 0)
            }
          }
        ]
      }
    ]
  }
}
```
字段值的自动计算联动。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "字段联动示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "customerInfo",
          title: "客户信息",
          fields: [
            {
              name: "customerType",
              label: "客户类型",
              type: "select",
              required: true,
              options: [
                { label: "个人", value: "personal" },
                { label: "企业", value: "business" }
              ]
            },
            {
              name: "companyName",
              label: "公司名称",
              type: "text",
              required: true,
              showWhen: {
                field: "customerType",
                value: "business"
              }
            },
            {
              name: "taxNumber",
              label: "税号",
              type: "text",
              showWhen: {
                field: "customerType",
                value: "business"
              }
            },
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "idType",
              label: "证件类型",
              type: "select",
              options: [
                { label: "身份证", value: "id" },
                { label: "护照", value: "passport" }
              ],
              showWhen: {
                field: "customerType",
                value: "personal"
              }
            },
            {
              name: "idNumber",
              label: "证件号码",
              type: "text",
              validators: [
                (value, data) => {
                  if (data.idType === "id" && !/^\d{17}[\dX]$/.test(value)) {
                    return "请输入有效的身份证号"
                  }
                }
              ],
              showWhen: {
                field: "customerType",
                value: "personal"
              }
            }
          ]
        },
        {
          key: "orderInfo",
          title: "订单信息",
          fields: [
            {
              name: "productType",
              label: "产品类型",
              type: "select",
              required: true,
              options: [
                { label: "标准产品", value: "standard" },
                { label: "定制产品", value: "custom" }
              ]
            },
            {
              name: "customRequirement",
              label: "定制要求",
              type: "textarea",
              required: true,
              showWhen: {
                field: "productType",
                value: "custom"
              }
            },
            {
              name: "quantity",
              label: "数量",
              type: "number",
              required: true,
              min: 1
            },
            {
              name: "unitPrice",
              label: "单价",
              type: "number",
              required: true,
              compute: (data) => {
                // 定制产品基础价格上浮20%
                const basePrice = 100
                return data.productType === "custom" ? basePrice * 1.2 : basePrice
              },
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              name: "amount",
              label: "金额",
              type: "number",
              disabled: true,
              compute: (data) => {
                return (data.quantity || 0) * (data.unitPrice || 0)
              },
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              name: "discount",
              label: "折扣",
              type: "number",
              min: 0,
              max: 100,
              compute: (data) => {
                // 数量大于10享受95折
                return data.quantity >= 10 ? 95 : 100
              },
              formatConfig: {
                type: "percentage",
                precision: 0
              }
            },
            {
              name: "finalAmount",
              label: "最终金额",
              type: "number",
              disabled: true,
              compute: (data) => {
                const amount = (data.quantity || 0) * (data.unitPrice || 0)
                const discount = data.discount || 100
                return amount * (discount / 100)
              },
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            }
          ]
        }
      ]
    }
  },
  watch: (form) => {
    const subscription = form.watch((value, { name, type }) => {
      // 监听字段变化并触发联动
      if (name === "customerType") {
        // 切换客户类型时清空相关字段
        if (value === "personal") {
          form.setValue("companyName", "")
          form.setValue("taxNumber", "")
        } else {
          form.setValue("idType", "")
          form.setValue("idNumber", "")
        }
      }
      
      if (name === "idType") {
        // 切换证件类型时清空证件号码
        form.setValue("idNumber", "")
      }
      
      if (name === "productType" || name === "quantity") {
        // 重新计算单价和折扣
        form.trigger("unitPrice")
        form.trigger("discount")
      }
    })

    return () => subscription.unsubscribe()
  }
}
```
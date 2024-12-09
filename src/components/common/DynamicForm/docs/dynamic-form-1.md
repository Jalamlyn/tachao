# DynamicForm AI 配置文档

### 配置示例

#### 1. 基础表单配置

```typescript
{
  metadata: {
    title: "基础表单",
    permissions: {
      edit: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        className: "w-full",
        validators: [
          (value) => value?.length > 2 ? undefined : "姓名至少3个字符"
        ]
      },
      {
        name: "age",
        label: "年龄",
        type: "number",
        required: true,
        min: 0,
        max: 150
      },
      {
        name: "birthday",
        label: "生日",
        type: "date",
        className: "w-full"
      }
    ]
  },
  validationRules: {
    name: {
      required: true,
      minLength: 3,
      message: "姓名不能少于3个字符"
    }
  }
}
```

#### 2. 分组表单配置

```typescript
{
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          className: "space-y-4",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "gender",
              label: "性别",
              type: "select",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" }
              ]
            }
          ]
        },
        {
          key: "contact",
          title: "联系方式",
          icon: "mdi:phone",
          description: "请填写准确的联系方式",
          fields: [
            {
              name: "phone",
              label: "手机号",
              type: "tel",
              required: true,
              validators: [
                (value) => /^1[3-9]\d{9}$/.test(value) ? undefined : "请输入有效的手机号"
              ]
            },
            {
              name: "email",
              label: "邮箱",
              type: "email",
              validators: [
                (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "请输入有效的邮箱"
              ]
            }
          ]
        }
      ],
      defaultGroup: "basic"
    }
  }
}
```

#### 3. 资源字段配置

```typescript
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "供应商主数据",
    resourceId:"resource_xxxx",
    multiple: false,  // 是否支持多选
    displayMode: "card", // 显示模式：card | table
    // 自定义显示字段
    displayFields: [
      {
        key: "code",
        label: "供应商编号",
        width: "150px" // 表格模式下的列宽
      },
      {
        key: "name",
        label: "供应商名称",
        render: (value) => `${value}` // 自定义渲染函数
      },
      {
        key: "contact",
        label: "联系人"
      }
    ],
  }
}

// 2. 带字段映射的配置
{
  name: "product",
  label: "产品",
  type: "resource",
  resourceConfig: {
    resourceTitle: "产品主数据",
    resourceId:"resource_xxx",
    displayMode: "table",
    displayFields: [
      {
        key: "code",
        label: "产品编码",
        width: "120px"
      },
      {
        key: "name",
        label: "产品名称",
        width: "200px"
      },
      {
        key: "spec",
        label: "规格型号"
      }
    ],
    // 字段映射配置
    fieldMapping: {
      // 简单映射
      productCode: "code",
      productName: "name",
      // 复杂映射
      fullSpec: {
        fields: ["spec", "model", "version"],
        transform: (values) => values.filter(Boolean).join(" - ")
      },
      // 条件映射
      price: {
        field: "price",
        condition: (resource) => resource.status === "active",
        transform: (value) => Number(value).toFixed(2)
      }
    },
  }
}

// 3. 多选模式配置
{
  name: "materials",
  label: "原材料",
  type: "resource",
  resourceConfig: {
    resourceTitle: "原材料主数据",
    resourceId:"resource_xxx",
    multiple: true, // 启用多选
    displayMode: "table",
    displayFields: [
      {
        key: "code",
        label: "材料编码"
      },
      {
        key: "name",
        label: "材料名称"
      },
      {
        key: "unit",
        label: "单位",
        render: (value) => `${value}/件`
      }
    ],
  }
}
```

#### 4. 表格配置

```typescript
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "name",
          title: "产品名称",
          type: "text",
          required: true,
          width: "200px"
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          required: true,
          width: "100px",
          className: "text-right"
        },
        {
          key: "price",
          title: "单价",
          type: "number",
          required: true,
          width: "120px",
          className: "text-right"
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: "150px",
          className: "text-right font-bold",
          editable: false,
          summary: {
            render: (values) => {
              const total = values.reduce((sum: number, row: any) => sum + (row.amount || 0), 0)
              return `¥${total.toFixed(2)}`
            }
          }
        }
      ],
      summary: {
        show: true,
        label: "合计",
        className: "bg-gray-50 font-bold"
      }
    }
  }
}
```

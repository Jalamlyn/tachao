# DynamicForm RenderConfig 类型定义文档

## FormRenderConfig
表单渲染配置的主接口:

```typescript
interface FormRenderConfig {
  // 基础字段配置
  basicFields:
    | FormField[]  // 字段数组
    | {
        groups: FormFieldGroup[]  // 分组配置
        defaultGroup?: string     // 默认选中的分组
      }
  
  // 表格配置
  table?: TableConfig            // 单表格配置
  tables?: TableGroup[]         // 多表格配置
  
  // 流程步骤配置
  processSteps?: ProcessStep[]  // 流程步骤配置
}
```

## 配置示例

### 1. 基础字段配置

#### 1.1 使用字段数组
```typescript
{
  basicFields: [
    {
      name: "title",
      label: "标题",
      type: "text",
      required: true
    },
    {
      name: "description",
      label: "描述",
      type: "textarea"
    }
  ]
}
```

#### 1.2 使用分组配置
```typescript
{
  basicFields: {
    groups: [
      {
        key: "basic",
        title: "基本信息",
        icon: "mdi:information",
        fields: [
          {
            name: "title",
            label: "标题",
            type: "text"
          }
        ]
      },
      {
        key: "additional",
        title: "附加信息",
        fields: [
          {
            name: "remarks",
            label: "备注",
            type: "textarea"
          }
        ]
      }
    ],
    defaultGroup: "basic"
  }
}
```

### 2. 表格配置

#### 2.1 单表格配置
```typescript
{
  table: {
    columns: [
      {
        key: "name",
        title: "名称",
        type: "text",
        width: 200
      },
      {
        key: "amount",
        title: "金额",
        type: "number",
        width: 150
      }
    ],
    summary: {
      show: true,
      label: "合计"
    }
  }
}
```

#### 2.2 多表格配置
```typescript
{
  tables: [
    {
      key: "products",
      title: "产品清单",
      icon: "mdi:package",
      config: {
        columns: [
          {
            key: "productName",
            title: "产品名称",
            type: "text"
          },
          {
            key: "quantity",
            title: "数量",
            type: "number"
          }
        ]
      }
    },
    {
      key: "services",
      title: "服务项目",
      config: {
        columns: [
          {
            key: "serviceName",
            title: "服务名称",
            type: "text"
          },
          {
            key: "hours",
            title: "工时",
            type: "number"
          }
        ]
      }
    }
  ]
}
```

### 3. 流程步骤配置
```typescript
{
  processSteps: [
    {
      key: "create",
      title: "创建",
      icon: "mdi:pencil",
      fields: [
        {
          name: "creator",
          label: "创建人",
          type: "text"
        }
      ]
    },
    {
      key: "review",
      title: "审核",
      dependencies: [
        {
          step: "create",
          message: "请先完成创建步骤"
        }
      ],
      fields: [
        {
          name: "reviewComments",
          label: "审核意见",
          type: "textarea"
        }
      ]
    }
  ]
}
```

## 完整配置示例
```typescript
const renderConfig: FormRenderConfig = {
  // 基础字段配置
  basicFields: {
    groups: [
      {
        key: "basic",
        title: "基本信息",
        icon: "mdi:information",
        fields: [
          {
            name: "title",
            label: "标题",
            type: "text",
            required: true
          },
          {
            name: "description",
            label: "描述",
            type: "textarea"
          }
        ]
      }
    ],
    defaultGroup: "basic"
  },

  // 表格配置
  tables: [
    {
      key: "items",
      title: "明细项目",
      icon: "mdi:table",
      config: {
        columns: [
          {
            key: "name",
            title: "名称",
            type: "text",
            required: true
          },
          {
            key: "amount",
            title: "金额",
            type: "number"
          }
        ],
        summary: {
          show: true,
          label: "合计"
        }
      }
    }
  ],

  // 流程步骤
  processSteps: [
    {
      key: "create",
      title: "创建",
      icon: "mdi:pencil",
      fields: [
        {
          name: "creator",
          label: "创建人",
          type: "text"
        }
      ]
    },
    {
      key: "review",
      title: "审核",
      icon: "mdi:check",
      dependencies: [
        {
          step: "create"
        }
      ],
      fields: [
        {
          name: "reviewer",
          label: "审核人",
          type: "text"
        },
        {
          name: "reviewComments",
          label: "审核意见",
          type: "textarea"
        }
      ]
    }
  ]
}
```

## 注意事项

1. 基础字段配置(`basicFields`)必须提供,可以选择使用字段数组或分组方式
2. 表格配置可以使用单表格(`table`)或多表格(`tables`)方式,但不建议同时使用
3. 流程步骤(`processSteps`)是可选的,用于需要多步骤确认的场景
4. 所有的字段配置都支持验证规则、条件显示等高级特性
5. 图标(`icon`)建议使用`mdi`图标集
6. 样式类名(`className`)和样式对象(`style`)可用于自定义外观

## 类型定义参考

- [基础类型](./basic.md)
- [字段类型](./field.md)
- [表格类型](./table.md)
- [流程类型](./process.md)
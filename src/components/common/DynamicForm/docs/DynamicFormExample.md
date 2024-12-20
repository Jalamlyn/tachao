# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例。

## 完整示例

```jsx
export default () => {
  const formConfig = {
    metadata: {
      title: "成本分析报表 - 材料成本",
      description: "采集材料成本的明细数据",
    },
    renderConfig: {
      basicFields: {
        groups: [
          {
            key: "customerInfo",
            title: "客户信息",
            fields: [
              {
                name: "customer",
                label: "客户",
                type: "text",
                required: true,
              },
              {
                name: "drawingNumber",
                label: "图纸号",
                type: "text",
                required: true,
                defaultValue: "1_spcz90007656_A2.stp",
              },
              {
                name: "accountant",
                label: "核算员",
                type: "text",
                required: true,
                defaultValue: "HCB018",
              },
              {
                name: "purchaseVolume",
                label: "采购量",
                type: "text",
                required: true,
                defaultValue: "模具寿命-30万模",
              },
              {
                name: "date",
                label: "日期",
                type: "datetime",
                required: true,
                defaultValue: "2024-12-19 17:03:22",
              },
            ],
          },
          {
            key: "productDimensions",
            title: "产品基础尺寸",
            fields: [
              {
                name: "length",
                label: "长/直径（mm）",
                type: "number",
                required: true,
                defaultValue: 38.4,
              },
              {
                name: "width",
                label: "宽（mm）",
                type: "number",
                required: true,
                defaultValue: 27.7,
              },
              {
                name: "height",
                label: "高（mm）",
                type: "number",
                required: true,
                defaultValue: 27.0,
              },
              {
                name: "volume",
                label: "体积（mm³）",
                type: "number",
                required: true,
                defaultValue: 7474.32,
              },
              {
                name: "surfaceArea",
                label: "表面积（mm²）",
                type: "number",
                required: true,
                defaultValue: 5423.26,
              },
            ],
          },
          {
            key: "moldDimensions",
            title: "模具基础尺寸",
            fields: [
              {
                name: "moldLength",
                label: "长/直径（mm）",
                type: "number",
                required: true,
                defaultValue: 374.41,
              },
              {
                name: "moldWidth",
                label: "宽（mm）",
                type: "number",
                required: true,
                defaultValue: 326.06,
              },
              {
                name: "moldHeight",
                label: "高（mm）",
                type: "number",
                required: true,
                defaultValue: 229.18,
              },
              {
                name: "moldWeight",
                label: "模具重量（KG）",
                type: "number",
                required: true,
                defaultValue: 111.1,
              },
            ],
          },
          {
            key: "moldPerformance",
            title: "模具性能参数",
            fields: [
              {
                name: "moldLife",
                label: "模具寿命（万次）",
                type: "text",
                required: true,
                defaultValue: "模具寿命-30万模",
              },
              {
                name: "cavities",
                label: "一模几穴（穴）",
                type: "number",
                required: true,
                defaultValue: 4.0,
              },
              {
                name: "clampingTime",
                label: "合模时间（秒）",
                type: "number",
                required: true,
                defaultValue: 49.11,
              },
              {
                name: "machineTonnage",
                label: "机台吨位（T）",
                type: "number",
                required: true,
                defaultValue: 185.51,
              },
              {
                name: "capacity",
                label: "产能（Pcs/天）",
                type: "number",
                required: true,
                defaultValue: 1466.04,
              },
            ],
          },
        ],
        layout: "vertical",
      },
      tables: [
        {
          key: "materialCost",
          title: "材料成本明细表",
          description: "记录材料成本的详细信息，并自动计算成本合计",
          config: {
            columns: [
              {
                key: "serialNumber",
                title: "序号",
                type: "number",
                width: 80,
                required: true,
              },
              {
                key: "processName",
                title: "工序名称",
                type: "text",
                width: 150,
                required: true,
              },
              {
                key: "material",
                title: "材料",
                type: "text",
                width: 150,
                required: true,
              },
              {
                key: "length",
                title: "长/直径(mm)",
                type: "number",
                width: 120,
              },
              {
                key: "width",
                title: "宽(mm)",
                type: "number",
                width: 120,
              },
              {
                key: "height",
                title: "高/厚(mm)",
                type: "number",
                width: 120,
              },
              {
                key: "weight",
                title: "重量(KG)",
                type: "number",
                width: 120,
                required: true,
              },
              {
                key: "materialCost",
                title: "材料成本(RMB)",
                type: "number",
                width: 150,
                required: true,
                disabled: true, // 自动计算字段
              },
              {
                key: "unitPrice",
                title: "单价（元/kg）",
                type: "number",
                width: 150,
                required: true,
              },
            ],
            summary: {
              show: true,
              firstColumnText: "总计",
              onCompute: (data) => {
                const totalMaterialCost = data.reduce((sum, row) => {
                  const materialCost = Number(row.materialCost) || 0
                  return sum + materialCost
                }, 0)

                return {
                  materialCost: totalMaterialCost,
                }
              },
            },
          },
        },
        {
          key: "heatTreatmentCost",
          title: "热处理成本明细表",
          description: "记录热处理成本的详细信息，并自动计算成本合计",
          config: {
            columns: [
              {
                key: "serialNumber",
                title: "序号",
                type: "number",
                width: 80,
                required: true,
              },
              {
                key: "processName",
                title: "工序名称",
                type: "text",
                width: 150,
                required: true,
              },
              {
                key: "component",
                title: "部件",
                type: "text",
                width: 150,
              },
              {
                key: "weight",
                title: "重量(KG)",
                type: "number",
                width: 120,
                required: true,
              },
              {
                key: "processCost",
                title: "工序成本(RMB)",
                type: "number",
                width: 150,
                required: true,
                disabled: true, // 自动计算字段
              },
              {
                key: "unitPrice",
                title: "工序单价（元/H）",
                type: "number",
                width: 150,
                required: true,
              },
            ],
            summary: {
              show: true,
              firstColumnText: "总计",
              onCompute: (data) => {
                const totalProcessCost = data.reduce((sum, row) => {
                  const processCost = Number(row.processCost) || 0
                  return sum + processCost
                }, 0)

                return {
                  processCost: totalProcessCost,
                }
              },
            },
          },
        },
        {
          key: "hardwareStandardParts",
          title: "五金/标准件成本明细表",
          description: "记录五金/标准件的详细信息，并自动计算成本合计",
          config: {
            columns: [
              {
                key: "serialNumber",
                title: "序号",
                type: "number",
                width: 80,
                required: true,
              },
              {
                key: "projectName",
                title: "项目名称",
                type: "text",
                width: 150,
                required: true,
              },
              {
                key: "component",
                title: "部件",
                type: "text",
                width: 150,
              },
              {
                key: "quantity",
                title: "数量（套）",
                type: "number",
                width: 120,
                required: true,
              },
              {
                key: "processCost",
                title: "工序成本(RMB)",
                type: "number",
                width: 150,
                required: true,
                disabled: true, // 自动计算字段
              },
              {
                key: "unitPrice",
                title: "单价（元/个）",
                type: "number",
                width: 150,
                required: true,
              },
            ],
            summary: {
              show: true,
              firstColumnText: "总计",
              onCompute: (data) => {
                const totalProcessCost = data.reduce((sum, row) => {
                  const processCost = Number(row.processCost) || 0
                  return sum + processCost
                }, 0)

                return {
                  processCost: totalProcessCost,
                }
              },
            },
          },
        },
      ],
    },
    watch: (form) => {
      let isCalculating = false

      const subscription = form.watch((value, { name }) => {
        if (!isCalculating && (name.endsWith(".weight") || name.endsWith(".unitPrice") || name.endsWith(".quantity"))) {
          isCalculating = true
          try {
            const materialRows = form.getValues("tableData.materialCost") || []
            materialRows.forEach((row, index) => {
              const weight = Number(row.weight) || 0
              const unitPrice = Number(row.unitPrice) || 0
              const materialCost = weight * unitPrice
              form.setValue(`tableData.materialCost.${index}.materialCost`, materialCost)
            })

            const hardwareRows = form.getValues("tableData.hardwareStandardParts") || []
            hardwareRows.forEach((row, index) => {
              const quantity = Number(row.quantity) || 0
              const unitPrice = Number(row.unitPrice) || 0
              const processCost = quantity * unitPrice
              form.setValue(`tableData.hardwareStandardParts.${index}.processCost`, processCost)
            })
          } finally {
            isCalculating = false
          }
        }
      })

      return () => subscription.unsubscribe()
    },
  }

  return (
    <div className='custom-form'>
      <DynamicForm config={formConfig} />
    </div>
  )
}
```

## 使用示例

```tsx
import { DynamicForm } from "@/components/common/DynamicForm"
import formConfig from "./formConfig"

const PurchaseRequestForm = () => {
  const handleSubmit = async (validationResult, values) => {
    if (validationResult.valid) {
      //console.log("Form values:", values)
    }
  }

  return <DynamicForm config={formConfig} />
}

export default PurchaseRequestForm
```

## 表格汇总配置说明

表格支持灵活的汇总计算功能，通过 `summary` 配置实现：

```typescript
{
  columns: [
    {
      key: "quantity",
      title: "数量",
      type: "number"
    },
    {
      key: "price",
      title: "单价",
      type: "number"
    },
    {
      key: "amount",
      title: "金额",
      type: "number",
      formatConfig: {
        type: "amount",
        options: {
          precision: 2,
          currency: "CNY"
        }
      }
    }
  ],
  summary: {
    show: true,  // 是否显示汇总行
    firstColumnText: "合计",  // 第一列显示的文本
    onCompute: (data) => {
      // 计算汇总数据
      const quantity = data.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
      const amount = data.reduce((sum, row) =>
        sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0)

      // 返回与列key对应的汇总数据
      return {
        quantity,  // 数量合计
        amount    // 金额合计
      }
    }
  }
}
```

### 汇总配置说明

1. `show`: 控制是否显示汇总行
2. `firstColumnText`: 设置汇总行第一列显示的文本
3. `onCompute`: 计算汇总数据的函数
   - 参数: `data` - 表格的所有数据
   - 返回值: 与列key对应的汇总数据对象

### 格式化配置

汇总数据会自动应用对应列的 `formatConfig` 配置进行格式化显示：

```typescript
{
  key: "amount",
  title: "金额",
  type: "number",
  formatConfig: {
    type: "amount",
    options: {
      precision: 2,
      currency: "CNY"
    }
  }
}
```

### 最佳实践

1. 返回的汇总数据key要与列key保持一致
2. 注意数值计算时的类型转换和空值处理
3. 可以只返回需要显示汇总的列
4. 建议使用formatConfig统一数据显示格式

```typescript
// 推荐的汇总配置方式
summary: {
  show: true,
  firstColumnText: "合计",
  onCompute: (data) => {
    // 处理空值和类型转换
    const validData = data.filter(row =>
      row.quantity != null && row.price != null)

    // 计算汇总
    const result = validData.reduce((acc, row) => ({
      quantity: acc.quantity + Number(row.quantity),
      amount: acc.amount + (Number(row.quantity) * Number(row.price))
    }), { quantity: 0, amount: 0 })

    // 只返回需要显示汇总的列
    return {
      quantity: result.quantity,
      amount: result.amount
    }
  }
}
```

## 基础字段布局配置

动态表单支持两种基础字段布局模式：

### 1. Tabs布局（默认）

字段分组以标签页形式水平展示：

```typescript
const formConfig = {
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          fields: [...]
        },
        {
          key: "additional",
          title: "附加信息",
          fields: [...]
        }
      ],
      layout: 'tabs' // 默认值，可省略
    }
  }
}
```

### 2. 垂直布局

字段分组以卡片形式垂直排列：

```typescript
const formConfig = {
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          fields: [...]
        },
        {
          key: "additional",
          title: "附加信息",
          fields: [...]
        }
      ],
      layout: 'vertical' // 使用垂直布局
    }
  }
}
```

垂直布局特点：

- 所有分组同时可见
- 每个分组使用卡片样式展示
- 支持分组标题、图标和描述
- 包含平滑的动画效果
- 适合内容较多或需要同时查看多个分组的场景

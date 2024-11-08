## 表格配置

表格配置用于创建动态表格，通常用于录入多行数据。

```typescript
interface TableConfig {
  columns: TableColumn[];
  summary?: TableSummary;
  rowCalculations?: TableRowCalculations;
}

interface TableColumn {
  key: string;
  title: string;
  type: TableColumnType;
  width?: string | number;
  editable?: boolean;
  required?: boolean;
}
```

示例：
```javascript
const tableConfig = {
  columns: [
    { key: "item", title: "物品", type: "text", required: true },
    { key: "quantity", title: "数量", type: "number", width: 100 },
    { key: "price", title: "单价", type: "number", width: 100 },
    { 
      key: "total", 
      title: "小计", 
      type: "number", 
      width: 100,
      render: (value, record) => record.quantity * record.price
    }
  ],
  summary: {
    fields: {
      totalAmount: {
        label: "总金额",
        calculate: (records) => records.reduce((sum, record) => sum + (record.quantity * record.price), 0)
      }
    }
  }
};
```
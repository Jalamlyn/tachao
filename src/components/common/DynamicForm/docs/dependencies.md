## 依赖关系配置

依赖关系配置用于定义字段之间的动态关系。

```typescript
interface DependencyConfig {
  [key: string]: {
    dependsOn: string[];
    calculate: (values: any) => any;
  };
}
```

示例：
```javascript
const dependencies = {
  totalDays: {
    dependsOn: ["startDate", "endDate"],
    calculate: (values) => {
      if (!values.startDate || !values.endDate) return 0;
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  }
};
```
[前面的内容保持不变，在 FormMetadata 接口之后，ValidationContext 接口之前添加 FormRenderConfig 接口的说明]

### FormRenderConfig

表单渲染配置接口：

```typescript
interface FormRenderConfig {
  basicFields: FormField[];      // 基础字段配置，用于渲染基本表单字段
  table?: TableConfig;          // 表格配置，用于渲染动态表格
  processSteps?: ProcessStep[]; // 流程步骤配置，用于渲染流程确认步骤
}
```

[后面的内容保持不变]
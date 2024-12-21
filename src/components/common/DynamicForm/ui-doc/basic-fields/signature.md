# 签名字段

## 基础签名
```typescript
{
  name: "basicSignature",
  label: "签名",
  type: "signature",
  width: 300,
  height: 150
}
```
基础的签名功能。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "签名示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "signatureGroup",
          title: "签名字段示例",
          fields: [
            {
              name: "signature",
              label: "签名",
              type: "signature",
              required: true,
              width: 400,
              height: 200,
              lineWidth: 2,
              lineColor: "#000000",
              description: "请在此处签名"
            },
            {
              name: "confirmation",
              label: "确认签名",
              type: "signature",
              width: 300,
              height: 150,
              lineWidth: 3,
              lineColor: "#0066ff",
              description: "再次签名确认"
            }
          ]
        }
      ]
    }
  }
}
```
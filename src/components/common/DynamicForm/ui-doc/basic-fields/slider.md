# 滑块字段

## 基础滑块
```typescript
{
  name: "basicSlider",
  label: "滑块",
  type: "slider",
  min: 0,
  max: 100,
  step: 1
}
```
基础的滑块控件,支持设置最小值、最大值和步进值。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "滑块示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "sliderGroup",
          title: "滑块字段示例",
          fields: [
            {
              name: "volume",
              label: "音量",
              type: "slider",
              min: 0,
              max: 100,
              step: 1,
              defaultValue: 50,
              formatConfig: {
                type: "number",
                format: value => `${value}%`
              }
            },
            {
              name: "rating",
              label: "评分",
              type: "slider",
              min: 0,
              max: 5,
              step: 0.5,
              description: "拖动滑块进行评分",
              formatConfig: {
                type: "number",
                precision: 1,
                format: value => `${value}星`
              }
            }
          ]
        }
      ]
    }
  }
}
```
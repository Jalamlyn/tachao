# 自定义渲染字段

## 基础自定义渲染
```typescript
{
  name: "basicCustom",
  label: "自定义",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    return (
      <div>
        <input 
          value={field.value} 
          onChange={(e) => field.onChange(e.target.value)}
          disabled={!isEditable}
        />
      </div>
    )
  }
}
```
基础的自定义渲染功能。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "自定义渲染示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "customGroup",
          title: "自定义渲染字段示例",
          fields: [
            {
              name: "customField1",
              label: "自定义组件1",
              type: "custom",
              required: true,
              render: ({ field, form, isEditable }) => {
                return (
                  <div className="custom-component">
                    <div className="input-group">
                      <input
                        type="text"
                        value={field.value?.text || ""}
                        onChange={(e) => {
                          field.onChange({
                            ...field.value,
                            text: e.target.value
                          })
                        }}
                        disabled={!isEditable}
                        className="custom-input"
                      />
                      <button
                        onClick={() => {
                          field.onChange({
                            ...field.value,
                            timestamp: new Date().toISOString()
                          })
                        }}
                        disabled={!isEditable}
                        className="custom-button"
                      >
                        更新时间戳
                      </button>
                    </div>
                    {field.value?.timestamp && (
                      <div className="timestamp">
                        最后更新: {field.value.timestamp}
                      </div>
                    )}
                  </div>
                )
              }
            },
            {
              name: "customField2",
              label: "自定义组件2",
              type: "custom",
              render: ({ field, form, isEditable }) => {
                const tags = field.value || []
                return (
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        {isEditable && (
                          <button
                            onClick={() => {
                              const newTags = [...tags]
                              newTags.splice(index, 1)
                              field.onChange(newTags)
                            }}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditable && (
                      <button
                        onClick={() => {
                          const tag = prompt("请输入标签")
                          if (tag) {
                            field.onChange([...tags, tag])
                          }
                        }}
                        className="add-tag"
                      >
                        添加标签
                      </button>
                    )}
                  </div>
                )
              }
            }
          ]
        }
      ]
    }
  }
}
```
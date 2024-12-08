// ... 保留原有的导入 ...
import UploadField from "./UploadField"

// ... 保留其他代码直到 renderField 函数 ...

const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <div className={cn("form-field-container")}>
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <BasicInput
                type={field.type}
                field={{
                  ...formField,
                  onChange: (e: any) => {
                    formField.onChange(e)
                    onChange?.(field.name, e.target.value)
                  },
                }}
              />
            )}
          </FormFieldWrapper>
        </div>
      )
    }

    switch (field.type) {
      // ... 保留其他 case ...

      case "file":
      case "image":
      case "upload":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <UploadField
                value={formField.value}
                onChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                config={{
                  accept: field.accept,
                  uploadType: field.type === "image" ? "image" : "file",
                  ...field.uploadConfig,
                }}
                disabled={!isEditable || field.disabled}
                className={field.className}
              />
            )}
          </FormFieldWrapper>
        )

      // ... 保留其他 case ...
    }
}

// ... 保留其他代码 ...
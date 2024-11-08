## 完整配置示例

```typescript
const formConfig: DynamicFormConfig = {
  metadata: {
    title: "订单表单",
    description: "用于创建和编辑订单"
  },
  renderConfig: {
    basicFields: [
      {
        name: "type",
        label: "订单类型",
        type: "select",
        options: [
          { label: "普通订单", value: "normal" },
          { label: "特殊订单", value: "special" }
        ]
      },
      {
        name: "extraInfo",
        label: "额外信息",
        type: "textarea",
        hidden: true
      }
    ],
    table: {
      columns: [
        { key: "product", title: "产品", type: "text" },
        { key: "quantity", title: "数量", type: "number" },
        { key: "price", title: "单价", type: "number" },
        { key: "amount", title: "金额", type: "number" }
      ]
    }
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      try {
        // 处理订单类型变化
        if (name === 'type') {
          form.setValue("extraInfo.hidden", value !== "special");
        }

        // 处理表格数据变化
        if (name.startsWith('tableData')) {
          const tableData = form.getValues('tableData') || [];
          
          // 计算每行金额
          tableData.forEach((row, index) => {
            const quantity = Number(row.quantity) || 0;
            const price = Number(row.price) || 0;
            form.setValue(`tableData.${index}.amount`, quantity * price);
          });

          // 计算总金额
          const total = tableData.reduce((sum, row) => 
            sum + (Number(row.amount) || 0), 0
          );
          form.setValue("totalAmount", total);
        }

        // 处理日期验证
        if (name === 'startDate' || name === 'endDate') {
          const { startDate, endDate } = form.getValues();
          if (startDate && endDate) {
            if (new Date(endDate) < new Date(startDate)) {
              form.setError("endDate", {
                type: "custom",
                message: "结束日期不能早于开始日期"
              });
            } else {
              form.clearErrors("endDate");
            }
          }
        }

        // 处理搜索关键词
        if (name === 'searchKeyword') {
          const value = form.getValues('searchKeyword');
          if (!value) return;
          
          // 使用防抖处理搜索
          const debouncedSearch = debounce(async () => {
            try {
              const results = await searchProducts(value);
              form.setValue("searchResults", results);
            } catch (error) {
              console.error("Search failed:", error);
            }
          }, 300);

          debouncedSearch();
        }
      } catch (error) {
        console.error(`Watch error for field ${name}:`, error);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  },
  validate: async (values) => {
    const errors = [];
    // ... 验证逻辑
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
```
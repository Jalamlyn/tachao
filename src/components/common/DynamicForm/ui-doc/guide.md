### Watch 使用规范

当使用 React Hook Form 的 watch 功能进行连续计算时，请遵循以下规范：

1. 批量更新模式

```typescript
// ✅ 允许: 使用批量更新模式
watch: (form) => {
  let isCalculating = false

  const subscription = form.watch((value, { name }) => {
    if (
      !isCalculating &&
      (name?.endsWith(".weight") ||
        name?.endsWith(".unitPrice") ||
        name?.endsWith(".quantity") ||
        name?.endsWith(".processingTime"))
    ) {
      isCalculating = true
      try {
        const materialRows = form.getValues("tableData.materialCost") || []
        materialRows.forEach((row, index) => {
          const weight = Number(row.weight) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const materialCost = weight * unitPrice
          form.setValue(`tableData.materialCost.${index}.materialCost`, materialCost.toFixed(2))
        })

        const hardwareRows = form.getValues("tableData.hardwareStandardParts") || []
        hardwareRows.forEach((row, index) => {
          const quantity = Number(row.quantity) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = quantity * unitPrice
          form.setValue(`tableData.hardwareStandardParts.${index}.processCost`, processCost.toFixed(2))
        })

        const machiningRows = form.getValues("tableData.moldMachiningCost") || []
        machiningRows.forEach((row, index) => {
          const processingTime = Number(row.processingTime) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = processingTime * unitPrice
          form.setValue(`tableData.moldMachiningCost.${index}.processCost`, processCost.toFixed(2))
        })

        const moldCoreRows = form.getValues("tableData.moldCoreMachiningCost") || []
        moldCoreRows.forEach((row, index) => {
          const processingTime = Number(row.processingTime) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = processingTime * unitPrice
          form.setValue(`tableData.moldCoreMachiningCost.${index}.processCost`, processCost.toFixed(2))
        })

        const designRows = form.getValues("tableData.designCost") || []
        designRows.forEach((row, index) => {
          const processingTime = Number(row.processingTime) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = processingTime * unitPrice
          form.setValue(`tableData.designCost.${index}.processCost`, processCost.toFixed(2))
        })

        const inspectionRows = form.getValues("tableData.inspectionCost") || []
        inspectionRows.forEach((row, index) => {
          const processingTime = Number(row.processingTime) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = processingTime * unitPrice
          form.setValue(`tableData.inspectionCost.${index}.processCost`, processCost.toFixed(2))
        })

        const otherRows = form.getValues("tableData.otherCosts") || []
        otherRows.forEach((row, index) => {
          const processingTime = Number(row.processingTime) || 0
          const unitPrice = Number(row.unitPrice) || 0
          const processCost = processingTime * unitPrice
          form.setValue(`tableData.otherCosts.${index}.processCost`, processCost.toFixed(2))
        })
        const materialCostTotal = (form.getValues("tableData.materialCost") || []).reduce(
          (sum, row) => sum + (Number(row.materialCost) || 0),
          0
        )

        const processingCostTotal = [
          "heatTreatmentCost",
          "hardwareStandardParts",
          "moldMachiningCost",
          "moldCoreMachiningCost",
          "designCost",
          "inspectionCost",
          "otherCosts",
        ].reduce((sum, tableName) => {
          const tableData = form.getValues(`tableData.${tableName}`) || []
          return sum + tableData.reduce((tableSum, row) => tableSum + (Number(row.processCost) || 0), 0)
        }, 0)

        // 设置汇总数据
        form.setValue("totalMaterialCost", materialCostTotal.toFixed(2))
        form.setValue("totalProcessingCost", processingCostTotal.toFixed(2))

        const managementFee = (materialCostTotal + processingCostTotal) * 0.2
        form.setValue("managementFee", managementFee.toFixed(2))

        const totalCost = materialCostTotal + processingCostTotal + managementFee
        form.setValue("totalCost", totalCost.toFixed(2))

        const tax = totalCost * 0.13
        form.setValue("tax", tax.toFixed(2))

        const profit = totalCost * 0.4
        form.setValue("profit", profit.toFixed(2))

        const moldPriceExclTax = totalCost + profit
        form.setValue("moldPriceExclTax", moldPriceExclTax.toFixed(2))

        const moldPriceInclTax = moldPriceExclTax + tax
        form.setValue("moldPriceInclTax", moldPriceInclTax.toFixed(2))
      } finally {
        isCalculating = false
      }
    }
  })

  return () => subscription.unsubscribe()
}

// ❌ 禁止: 直接在watch中连续setValue
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (条件1) {
      form.setValue("field1", value1) // 可能触发死循环
    }
    if (条件2) {
      form.setValue("field2", value2) // 可能触发死循环
    }
  })
}
```

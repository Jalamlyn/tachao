export const getHandleExportExcel = (table, message, data, flattenObject, XLSX) => () => {
  ;(type: "all" | "selected") => {
    try {
      let exportData
      if (type === "selected") {
        const selectedRows = table.getSelectedRowModel().rows
        if (selectedRows.length === 0) {
          message.warning("请先选择要导出的数据")
          return
        }
        exportData = selectedRows.map((row) => row.original)
      } else {
        exportData = data
      }

      // 展平嵌套数据
      const flattenedData = exportData.map((item) => flattenObject(item))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(flattenedData)
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
      XLSX.writeFile(wb, "export.xlsx")
    } catch (error) {
      console.error("Export failed:", error)
      message.error("导出失败")
    }
  }
}

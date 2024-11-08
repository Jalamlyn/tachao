// ... 保留原有的 imports

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  // ... 保留其他代码

  // 修改 useEffect 中的 watch 处理
  useEffect(() => {
    // 使用新的 watch API
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith(fieldName)) {
        // 处理表格数据变化
        const tableData = form.getValues(fieldName);
        // ... 处理逻辑
      }
    });

    // 返回清理函数
    return () => subscription.unsubscribe();
  }, [fieldName, form]);

  // ... 保留其他代码
}

export default DynamicTable;
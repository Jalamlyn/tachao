// ... 保留原有的 imports

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  // ... 保留其他代码

  // 修改 useEffect 中的 watch 处理
  useEffect(() => {
    // 直接使用 watch，让 React Hook Form 处理清理
    form.watch(`${fieldName}`, (value) => {
      // ... 处理逻辑
    });

    // 返回空的清理函数
    return () => {};
  }, [fieldName, form]);

  // ... 保留其他代码
}

export default DynamicTable;
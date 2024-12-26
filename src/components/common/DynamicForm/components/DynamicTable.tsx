// ... 其他代码保持不变

  // 格式化资源显示值
  const formatResourceDisplayValue = (resource: any, resourceConfig: any): string => {
    if (!resource) return '';

    const { displayField, displayFormat, displayFields } = resourceConfig;

    try {
      // 如果有配置的显示格式，优先使用配置
      if (displayFormat) {
        return displayFormat(resource);
      }

      if (displayField) {
        return resource[displayField] || '';
      }

      if (displayFields?.length) {
        return displayFields
          .map(df => `${df.label}: ${resource[df.key]}`)
          .join(' | ');
      }

      // 动态获取前3个非空字段
      const MAX_FIELDS = 3;
        
      // 格式化字段名称
      const formatFieldName = (key: string): string => {
        return key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .trim()
          .replace(/^\w/, c => c.toUpperCase());
      };

      // 格式化字段值
      const formatFieldValue = (value: any, key: string): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? '是' : '否';
        if (typeof value === 'number') {
          if (/price|amount|money|cost/i.test(key)) {
            return `¥${value.toLocaleString()}`;
          }
          return value.toLocaleString();
        }
        if (value instanceof Date) return format(value, 'yyyy-MM-dd');
        if (Array.isArray(value)) return `${value.length}项`;
        if (typeof value === 'object') return '[对象]';
        return String(value);
      };

      // 获取有效字段
      const validFields = Object.entries(resource)
        .filter(([key, value]) => {
          return value != null && 
                 value !== '' && 
                 !key.startsWith('_') && 
                 typeof value !== 'function' &&
                 key !== 'id' && 
                 key !== 'dataid';
        })
        .slice(0, MAX_FIELDS)
        .map(([key, value]) => {
          const formattedName = formatFieldName(key);
          const formattedValue = formatFieldValue(value, key);
          return `${formattedName}: ${formattedValue}`;
        });

      if (validFields.length === 0) return '无数据';

      return validFields.join(' | ');

    } catch (error) {
      console.error('Format Error:', error);
      return '格式化错误';
    }
  }

// ... 其他代码保持不变
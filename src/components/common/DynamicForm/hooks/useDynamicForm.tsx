import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult, ValidationContext } from "../types"
import message from "@/components/Message"
import { ValidationManager } from "../validation/ValidationManager"
import { debounce } from "lodash"

// 创建带防抖的 watch
export const createDebouncedWatch = (form: UseFormReturn<any>, delay = 300) => {
  return (fields: string | string[], callback: (values: any) => void) => {
    const debouncedCallback = debounce(callback, delay);
    
    const subscription = form.watch((value, { name }) => {
      if (Array.isArray(fields)) {
        if (fields.includes(name)) {
          debouncedCallback(value);
        }
      } else if (fields === name) {
        debouncedCallback(value);
      }
    });

    return subscription;
  };
};

// 创建表格专用的 watch 工具函数
export const createTableWatch = (form: UseFormReturn<any>) => {
  return {
    // 监听整个表格数据
    onTableDataChange: (callback: (data: any[]) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name?.startsWith('tableData')) {
          callback(form.getValues('tableData'));
        }
      });
      return subscription;
    },
      
    // 监听特定行
    onRowChange: (rowIndex: number, callback: (row: any) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name?.startsWith(`tableData.${rowIndex}`)) {
          callback(form.getValues(`tableData.${rowIndex}`));
        }
      });
      return subscription;
    },
      
    // 监听特定单元格
    onCellChange: (rowIndex: number, field: string, callback: (value: any) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name === `tableData.${rowIndex}.${field}`) {
          callback(value);
        }
      });
      return subscription;
    },
      
    // 批量更新工具
    batchUpdate: (updates: Array<{path: string, value: any}>) => {
      form.batch(() => {
        updates.forEach(({path, value}) => {
          form.setValue(path, value);
        });
      });
    }
  };
};

export const useDynamicForm = (
  config: DynamicFormConfig,
  initialValues?: any,
  onValuesChange?: (changedValues: any, allValues: any) => void
) => {
  const form = useForm({
    defaultValues: initialValues || {},
  });

  // 设置 watch 函数
  useEffect(() => {
    if (!config.watch) return;

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // 使用新的 watch API
      subscription = config.watch(form);
      
      if (!subscription || typeof subscription.unsubscribe !== 'function') {
        console.warn('Watch function should return a subscription with unsubscribe method');
      }
    } catch (error) {
      console.error('Error in watch setup:', error);
    }

    // 返回清理函数
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [config.watch, form]);

  // ... 保留其他代码

  return {
    form,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateField,
    validateForm,
  }
}
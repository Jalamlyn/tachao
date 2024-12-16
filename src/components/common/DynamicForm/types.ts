import { FormatOptions } from './types/format';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

// 保留原有的类型定义
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: TooltipConfig;
  className?: string;
  style?: FieldStyle;
  layout?: 'default' | 'full-width' | 'inline';
  // ... 其他原有属性

  // 添加格式化配置
  formatConfig?: FormatOptions;
}

export interface TableColumn {
  key: string;
  title: string;
  type: string;
  width?: string | number;
  disabled?: boolean;
  editable?: boolean;
  // ... 其他原有属性

  // 添加格式化配置
  formatConfig?: FormatOptions;
}

export interface SummaryField {
  name: string;
  label: string;
  type: string;
  // ... 其他原有属性

  // 添加格式化配置
  formatConfig?: FormatOptions;
}

// 保留其他原有的类型定义
export interface TooltipConfig {
  content: ReactNode | string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface FieldStyle {
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  margin?: string | number;
  display?: string;
  textAlign?: 'left' | 'center' | 'right';
  colSpan?: number;
  custom?: React.CSSProperties;
  sm?: Partial<Record<string, string | number>>;
  md?: Partial<Record<string, string | number>>;
  lg?: Partial<Record<string, string | number>>;
}

export interface ResourceValue {
  dataid: string | string[];
  displayValue?: string;
}

export interface FileInfo {
  fileName: string;
  fileKey?: string;
  downloadUrl?: string;
  type?: string;
}

export interface ProcessStep {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  fields?: FormField[];
  required?: boolean;
  weight?: number;
  dependencies?: Array<{
    step: string;
    condition?: {
      field?: string;
      value?: any;
      custom?: (formData: any) => boolean;
    };
  }>;
}

export interface ProcessProgress {
  total: number;
  completed: number;
  current: number;
  percentage: number;
  status: Record<string, {
    isCompleted: boolean;
    isBlocked: boolean;
    blockReason?: string;
  }>;
}

export interface FormFieldGroup {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  fields: FormField[];
}

export interface TableConfig {
  columns: TableColumn[];
  toolbar?: ReactNode;
  summary?: {
    show?: boolean;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
  };
}

export interface DynamicFormConfig {
  metadata: {
    title: string;
    description?: string;
    permissions: {
      edit: boolean;
      delete: boolean;
      print: boolean;
    };
  };
  renderConfig: {
    basicFields: FormField[] | { groups: FormFieldGroup[]; defaultGroup?: string };
    table?: TableConfig;
    processSteps?: ProcessStep[];
  };
  orderNumberConfig?: {
    prefix?: string;
    suffix?: string;
    dateFormat?: string;
    serialLength?: number;
  };
}

export interface TableRenderProps {
  form: UseFormReturn<any>;
  isEditable?: boolean;
  onChange?: (fieldName: string, value: any) => void;
  fieldName: string;
}
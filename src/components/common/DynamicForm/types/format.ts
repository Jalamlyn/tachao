import { CSSProperties } from 'react';

export type FormatType = 'amount' | 'percentage' | 'number' | 'text' | 'date' | 'datetime' | 'custom';

export interface FormatOptions {
  // 基础配置
  type?: FormatType;
  precision?: number;
  
  // 货币配置
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  
  // 日期配置
  dateFormat?: string;
  timezone?: string;
  
  // 数字配置
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  
  // 自定义格式化
  format?: (value: any, options?: any) => string;
  
  // 条件格式化
  conditions?: Array<{
    condition: (value: any) => boolean;
    format: (value: any) => string;
    style?: CSSProperties;
  }>;
}

export interface FormatterResult {
  formattedValue: string;
  style?: CSSProperties;
}
import { format as dateFnsFormat } from 'date-fns';
import { FormatOptions, FormatterResult } from '../types/format';

export class FormatterService {
  static format(value: any, options?: FormatOptions): FormatterResult {
    if (value === null || value === undefined) {
      return {
        formattedValue: '-'
      };
    }

    // 处理条件格式化
    if (options?.conditions) {
      for (const condition of options.conditions) {
        if (condition.condition(value)) {
          return {
            formattedValue: condition.format(value),
            style: condition.style
          };
        }
      }
    }

    // 如果有自定义格式化函数，优先使用
    if (options?.format) {
      return {
        formattedValue: options.format(value, options)
      };
    }

    // 根据类型使用不同的格式化逻辑
    switch (options?.type) {
      case 'amount':
        return {
          formattedValue: this.formatAmount(value, options)
        };
      
      case 'percentage':
        return {
          formattedValue: this.formatPercentage(value, options)
        };
      
      case 'number':
        return {
          formattedValue: this.formatNumber(value, options)
        };
      
      case 'date':
      case 'datetime':
        return {
          formattedValue: this.formatDate(value, options)
        };
      
      case 'text':
      default:
        return {
          formattedValue: this.formatText(value)
        };
    }
  }

  private static formatAmount(value: number, options?: FormatOptions): string {
    try {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: options?.currency || 'CNY',
        minimumFractionDigits: options?.precision ?? 2,
        maximumFractionDigits: options?.precision ?? 2,
        currencyDisplay: options?.currencyDisplay || 'symbol'
      }).format(value);
    } catch {
      return String(value);
    }
  }

  private static formatPercentage(value: number, options?: FormatOptions): string {
    try {
      return new Intl.NumberFormat('zh-CN', {
        style: 'percent',
        minimumFractionDigits: options?.precision ?? 2,
        maximumFractionDigits: options?.precision ?? 2
      }).format(value);
    } catch {
      return String(value);
    }
  }

  private static formatNumber(value: number, options?: FormatOptions): string {
    try {
      return new Intl.NumberFormat('zh-CN', {
        useGrouping: options?.useGrouping ?? true,
        minimumFractionDigits: options?.minimumFractionDigits ?? options?.precision ?? 0,
        maximumFractionDigits: options?.maximumFractionDigits ?? options?.precision ?? 0
      }).format(value);
    } catch {
      return String(value);
    }
  }

  private static formatDate(value: string | Date, options?: FormatOptions): string {
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      return dateFnsFormat(date, options?.dateFormat || 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return String(value);
    }
  }

  private static formatText(value: any): string {
    return String(value);
  }

  // 缓存格式化结果
  private static cache = new Map<string, FormatterResult>();
  private static getCacheKey(value: any, options?: FormatOptions): string {
    return `${JSON.stringify(value)}_${JSON.stringify(options)}`;
  }

  static formatWithCache(value: any, options?: FormatOptions): FormatterResult {
    const cacheKey = this.getCacheKey(value, options);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    const result = this.format(value, options);
    this.cache.set(cacheKey, result);
    return result;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// 导出默认格式化配置
export const defaultFormatConfig: Record<string, FormatOptions> = {
  amount: {
    type: 'amount',
    precision: 2,
    currency: 'CNY'
  },
  percentage: {
    type: 'percentage',
    precision: 2
  },
  number: {
    type: 'number',
    precision: 0,
    useGrouping: true
  },
  date: {
    type: 'date',
    dateFormat: 'yyyy-MM-dd'
  },
  datetime: {
    type: 'datetime',
    dateFormat: 'yyyy-MM-dd HH:mm:ss'
  }
};
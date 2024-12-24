/**
 * @fileoverview 汇总字段格式化工具
 */

export const formatters = {
  amount: (value: number, precision = 2) => {
    const _value = Number(value)
    if (!_value && _value !== 0) return "-"
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(_value)
  },

  percentage: (value: number, precision = 2) => {
    const _value = Number(value)
    if (!_value && _value !== 0) return "-"
    return `${(_value * 100).toFixed(precision)}%`
  },

  number: (value: number, precision = 2) => {
    const _value = Number(value)
    if (!_value && _value !== 0) return "-"
    return _value.toFixed(precision)
  },

  text: (value: any) => {
    if (!value && value !== 0) return "-"
    return String(value)
  },
}

export const getDefaultFormatter = (type: string) => {
  switch (type) {
    case "amount":
      return formatters.amount
    case "percentage":
      return formatters.percentage
    case "number":
      return formatters.number
    default:
      return formatters.text
  }
}

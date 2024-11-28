import { DynamicFormConfig, ToolbarButton } from "./types"

// 默认工具栏按钮配置
export const defaultToolbarButtons: ToolbarButton[] = [
  {
    key: "save",
    label: "保存",
    icon: "mdi:content-save",
    color: "primary",
    variant: "flat",
    onClick: () => {
      console.log("Default save action")
    },
  },
  {
    key: "edit",
    label: "编辑",
    icon: "mdi:pencil",
    color: "primary",
    variant: "flat",
    onClick: () => {
      console.log("Default edit action")
    },
  },
  {
    key: "print",
    label: "打印",
    icon: "mdi:printer",
    color: "primary",
    variant: "flat",
    onClick: () => {
      console.log("Default print action")
    },
  },
  {
    key: "cancel",
    label: "取消",
    icon: "mdi:close",
    color: "default",
    variant: "flat",
    onClick: () => {
      console.log("Default cancel action")
    },
  },
]

// 默认表单配置
export const defaultFormConfig: DynamicFormConfig = {
  metadata: {
    permissions: {
      edit: true,
      delete: true,
      print: true,
    },
  },
  renderConfig: {
    basicFields: [],
  },
  orderNumberConfig: {
    prefix: "DG",
    fieldName: "orderNumber",
    label: "表单编号",
  },
  toolbar: {
    buttons: defaultToolbarButtons,
  },
}

// 默认页面样式
export const defaultPageStyle = `
  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    html, body {
      height: 100vh;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
    }
    .print-content {
      display: block !important;
    }
    .no-print {
      display: none !important;
    }
  }
`

// 默认动画配置
export const defaultAnimationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 15,
  },
}

// 默认验证消息
export const defaultValidationMessages = {
  required: "此字段为必填项",
  email: "请输入有效的邮箱地址",
  url: "请输入有效的URL地址",
  tel: "请输入有效的电话号码",
  number: "请输入有效的数字",
  date: "请输入有效的日期",
}

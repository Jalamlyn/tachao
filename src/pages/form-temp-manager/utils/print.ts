import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

export const customToPrint = (printWindow: HTMLIFrameElement) => {
  const printContent = printWindow.contentDocument || printWindow.contentWindow?.document
  const printedScrollContainer = printContent?.querySelector(".scroll-container")
  const originScrollContainer = document.querySelector(".scroll-container")

  if (printedScrollContainer && originScrollContainer) {
    // Set the scroll position of the printed container to match the origin container
    printedScrollContainer.scrollTop = originScrollContainer.scrollTop
  }

  printWindow.contentWindow?.print()
}

export const validateFormConfig = (formConfig: DynamicFormConfig | null, rawConfig: string | null) => {
  if (!formConfig || !rawConfig) {
    return {
      isValid: false,
      error: "请先生成表单",
    }
  }

  return {
    isValid: true,
    error: null,
  }
}
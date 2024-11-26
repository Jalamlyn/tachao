export interface ConfirmModalProps {
  type?: "delete" | "cancel" | "warning"
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}
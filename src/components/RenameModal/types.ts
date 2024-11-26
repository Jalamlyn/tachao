export interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  initialName: string
  onRename: (newName: string) => Promise<void>
  validationRules?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  }
}
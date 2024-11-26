export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  shareUrl: string
}
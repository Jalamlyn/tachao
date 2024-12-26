import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../../types"

export interface ImageValue {
  url: string
  thumbnailUrl?: string
  name?: string
  size?: number
  type?: string
}

export interface ImageUploadProps extends FormField {
  form: UseFormReturn<any>
  isEditable: boolean
  onChange?: (fieldName: string, value: any) => void
  maxCount?: number
  uploadConfig?: {
    maxSize?: number
    accept?: string
    onSuccess?: (file: any) => void
    onError?: (error: Error) => void
    onProgress?: (percent: number) => void
    customRequest?: (options: {
      file: File
      onProgress: (percent: number) => void
    }) => Promise<any>
  }
}
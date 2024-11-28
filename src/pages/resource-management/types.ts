import { ComponentType } from "react"

export interface ResourceType {
  id: string
  name: string
  icon: string
  description: string
  previewComponent: ComponentType<{ data: any }>
  cardComponent?: ComponentType<{ data: any }>
}

export interface Resource {
  id: string
  title: string
  type: string
  status: string
  updatedAt: string
  indexFields: {
    size: number
    fileName: string
    type: string
  }
}

export interface ResourceTypeConfig {
  [key: string]: ResourceType
}

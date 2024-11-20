import { MetadataDetail, MetadataIndex } from "../metadata/types"

export interface QueryMetadataOptions {
  public?: boolean
  suspense?: boolean
  staleTime?: number
  cacheTime?: number
}

export interface QueryMetadataResult<T = any> {
  data: MetadataDetail<T>[] | null
  isLoading: boolean
  isPending: boolean // 新增: 用于startTransition状态
  error: Error | null
  refetch: () => Promise<void>
}

export interface QueryMetadataDetailResult<T = any> {
  data: MetadataDetail<T> | null
  isLoading: boolean
  isPending: boolean // 新增: 用于startTransition状态
  error: Error | null
  refetch: () => Promise<void>
}

export interface QueryMetadataIndexResult {
  data: MetadataIndex[] | null
  isLoading: boolean
  isPending: boolean // 新增: 用于startTransition状态
  error: Error | null
  refetch: () => Promise<void>
}

export interface QueryMetadataHistoryResult {
  data: {
    updatedAt: string
    versionCode: number
    modifiedBy: string
    value: string
  }[] | null
  isLoading: boolean
  isPending: boolean // 新增: 用于startTransition状态
  error: Error | null
  refetch: () => Promise<void>
}

export type { MetadataDetail, MetadataIndex } from "../metadata/types"
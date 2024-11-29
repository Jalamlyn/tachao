export interface AppIndex {
  id: string
  title: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateAppInput {
  title: string
  description?: string
}
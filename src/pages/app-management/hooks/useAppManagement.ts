import { useState } from 'react'
import { useApps } from '../api/queries'
import { useCreateApp } from '../api/mutations'
import { CreateAppInput } from '../types'

export const useAppManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: apps = [], isLoading } = useApps()
  const createAppMutation = useCreateApp()

  const handleCreateApp = async (input: CreateAppInput) => {
    try {
      await createAppMutation.mutateAsync(input)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create app:', error)
      throw error
    }
  }

  return {
    apps,
    isLoading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateApp,
    isCreating: createAppMutation.isPending
  }
}
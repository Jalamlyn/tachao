import React from "react"
import { useParams } from "react-router-dom"
import AppRuntime from "@/pages/app-builder/components/AppRuntime"

export const AppEntry: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()

  if (!appId) {
    return null
  }

  return <AppRuntime appId={appId} />
}

export default AppEntry

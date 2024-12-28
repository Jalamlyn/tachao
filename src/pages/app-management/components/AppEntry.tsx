import React from "react"
import { useParams } from "react-router-dom"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import { AppRuntime } from "@/pages/app-builder/components/AppRuntime"

export const AppEntry: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()

  if (!appId) {
    return null
  }

  return (
    <PermissionCheck resourceType='app' resourceId={appId}>
      <AppRuntime appId={appId} />
    </PermissionCheck>
  )
}

export default AppEntry
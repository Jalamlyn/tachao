import { Chip } from "@nextui-org/react"
import React, { createContext, useContext, useState } from "react"

type Breadcrumb = {
  label: string
  href: string
}

type BreadcrumbContextType = {
  breadcrumbs: Breadcrumb[]
  updateBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  const updateBreadcrumbs = (newBreadcrumbs: Breadcrumb[]) => {
    setBreadcrumbs(newBreadcrumbs)
  }

  return <BreadcrumbContext.Provider value={{ breadcrumbs, updateBreadcrumbs }}>{children}</BreadcrumbContext.Provider>
}

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider")
  }
  return context
}

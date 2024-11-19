import React from "react"
import { Breadcrumbs, BreadcrumbItem, Chip } from "@nextui-org/react"
import { useBreadcrumb } from "../contexts/BreadcrumbContext"

const GlobalBreadcrumb: React.FC = () => {
  const { breadcrumbs } = useBreadcrumb()

  return (
    <Breadcrumbs variant='bordered'>
      {breadcrumbs.map((item, index) => (
        <BreadcrumbItem key={index} href={item.href}>
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}

export default GlobalBreadcrumb

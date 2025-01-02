import React, { useEffect } from "react"
import { Card, CardBody, ScrollShadow } from "@nextui-org/react"
import FileList from "./components/FileList"
import PageLayout from "@/app/admin/src/component/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const FileManager: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "企业网盘", href: "/admin/file-manager" },
    ])
  }, [])

  return (
    <PageLayout title='企业网盘' titleIcon='solar:folder-with-files-bold-duotone'>
      <Card>
        <CardBody>
          <ScrollShadow className='max-h-[calc(100vh-200px)]'>
            <FileList />
          </ScrollShadow>
        </CardBody>
      </Card>
    </PageLayout>
  )
}

export default FileManager

import React, { useEffect } from "react"
import { Card, CardBody } from "@nextui-org/react"
import FileList from "./components/FileList"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const FileManager: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "企业网盘", href: "/we-chat-app/admin/file-manager" },
    ])
  }, [])

  return (
    <PageLayout title='企业网盘' titleIcon='solar:folder-with-files-bold-duotone'>
      <Card>
        <CardBody>
          <FileList />
        </CardBody>
      </Card>
    </PageLayout>
  )
}

export default FileManager
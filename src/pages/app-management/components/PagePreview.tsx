import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Spinner } from "@nextui-org/react"
import { PageRenderer } from "@/components/PageRenderer"
import { getMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

const PagePreview: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>()
  const [pageData, setPageData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const result = await getMetadata([`${pageId}`])
        if (result.data?.[0]?.value) {
          setPageData(JSON.parse(result.data[0].value))
        }
      } catch (error) {
        console.error("Error loading page:", error)
        message.error("加载页面失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadPageData()
  }, [pageId])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-danger'>页面不存在</p>
      </div>
    )
  }

  return <PageRenderer code={pageData.code} />
}

export default PagePreview

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"
import FormList from "./components/FormList"
import SearchInput from "./components/SearchInput"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"

const FormManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { items: forms, load: loadForms } = useMetadata("form")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='container mx-auto py-8'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem>单据管理</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:file-document' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>单据管理</h2>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <SearchInput onSearch={handleSearch} />
            <FormList forms={filteredForms} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormManager
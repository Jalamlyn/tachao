import React, { useState, useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"
import CreateFormRenderer from "./CreateFormRenderer"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import { formTemplates } from "../from-templates/formTemplateConfig"
import { Spinner } from "@nextui-org/react"

const FormRenderer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { getFormById, updateForm } = useFormMetadata()
  const [currentForm, setCurrentForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id && id !== "create") {
      loadForm(id)
    } else {
      setLoading(false)
    }
  }, [id])

  const loadForm = async (formId: string) => {
    try {
      setLoading(true)
      const formDetails = await getFormById(formId)
      if (formDetails) {
        setCurrentForm(formDetails)
      } else {
        setError("Form not found")
      }
    } catch (err) {
      console.error("Error loading form:", err)
      setError("An error occurred while loading the form")
    } finally {
      setLoading(false)
    }
  }

  if (id === "create") {
    return <CreateFormRenderer />
  }

  if (loading) {
    return (
      <div className='w-screen h-screen flex justify-center items-center'>
        <Spinner label='加载中...'></Spinner>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!currentForm) {
    return <div>Form not found</div>
  }

  const template = formTemplates.find((t) => t.id === currentForm.templateId)
  if (!template) {
    console.error("[FormRenderer] Template not found for id:", currentForm.templateId)
    return null
  }

  console.log("[FormRenderer] Rendering form component for template:", template.name)
  const FormComponent = template.component

  return (
    <div className='p-4 min-h-screen'>
      <div className='rounded-lg p-4'>
        <FormComponent formId={id} />
      </div>
    </div>
  )
}

export default FormRenderer

import { useState, useCallback } from "react"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import message from "@/components/Message"

interface FormState {
  formConfig: DynamicFormConfig | null
  rawConfig: string | null
  markdownContent: string
  selectedTemplate: string
  isGenerating: boolean
  generationProgress: number
  generationHistory: Array<{
    timestamp: number
    command: string
    result: DynamicFormConfig | null
  }>
  error: string | null
  generationProcess: string
}

const initialState: FormState = {
  formConfig: null,
  rawConfig: null,
  markdownContent: "",
  selectedTemplate: "",
  isGenerating: false,
  generationProgress: 0,
  generationHistory: [],
  error: null,
  generationProcess: "",
}

export const useFormState = () => {
  const [state, setState] = useState<FormState>(initialState)

  const setFormConfig = useCallback((config: DynamicFormConfig | null) => {
    setState((prev) => ({ ...prev, formConfig: config }))
  }, [])

  const setRawConfig = useCallback((config: string | null) => {
    setState((prev) => ({ ...prev, rawConfig: config }))
  }, [])

  const setMarkdownContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, markdownContent: content }))
  }, [])

  const setSelectedTemplate = useCallback((templateId: string) => {
    setState((prev) => ({ ...prev, selectedTemplate: templateId }))
  }, [])

  const startGenerating = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      generationProgress: 0,
      error: null,
      generationProcess: "",
    }))
  }, [])

  const updateGenerationProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, generationProgress: progress }))
  }, [])

  const stopGenerating = useCallback(() => {
    setState((prev) => ({ ...prev, isGenerating: false, generationProgress: 100 }))
  }, [])

  const addToHistory = useCallback((command: string, result: DynamicFormConfig | null) => {
    setState((prev) => ({
      ...prev,
      generationHistory: [
        {
          timestamp: Date.now(),
          command,
          result,
        },
        ...prev.generationHistory,
      ].slice(0, 10),
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  const appendGenerationProcess = useCallback((chunk: string) => {
    setState((prev) => ({
      ...prev,
      generationProcess: prev.generationProcess + chunk,
      markdownContent: prev.markdownContent + chunk,
    }))
  }, [])

  const handleError = useCallback(
    (error: any) => {
      console.error(error)
      const errorMessage = error?.message || "操作失败，请重试"
      message.error(errorMessage)
      setError(errorMessage)
      stopGenerating()
    },
    [stopGenerating]
  )

  return {
    state,
    setFormConfig,
    setRawConfig,
    setMarkdownContent,
    setSelectedTemplate,
    startGenerating,
    updateGenerationProgress,
    stopGenerating,
    addToHistory,
    setError,
    resetState,
    handleError,
    appendGenerationProcess,
  }
}
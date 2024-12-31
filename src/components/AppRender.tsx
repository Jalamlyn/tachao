import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import ErrorBoundary from "@/components/ErrorBoundary"
import wpm from "@wpm-js/core"

interface AppRenderProps {
  appId: string
  basename: string
  context: any
  onError?: (error: Error) => void
}

export const AppRender: React.FC<AppRenderProps> = ({ appId, basename, context, onError }) => {
  const [App, setApp] = useState(() => <div></div>)

  useEffect(() => {
    const init = async () => {
      const AppComp = await wpm.import(appId)
      setApp(AppComp)
    }
    init()
  }, [])
  return (
    <ErrorBoundary onError={onError}>
      <BrowserRouter basename={basename}>{App}</BrowserRouter>
    </ErrorBoundary>
  )
}

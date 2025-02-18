import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import ErrorBoundary from "@/components/ErrorBoundary"
import wpm from "@wpm-js/core"

interface AppRenderProps {
  appId: string
  onError?: (error: Error) => void
  onAIFix?: (errorInfo: { message: string; stack?: string; componentStack?: string }) => void
}

const AppEntry = ({ children }) => {
  return <>{children}</>
}

export const AppRender: React.FC<AppRenderProps> = ({ appId, onError, onAIFix }) => {
  const [App, setApp] = useState(null)
  useEffect(() => {
    const init = async () => {
      const AppComp = await wpm.import(appId)
      setApp(AppComp)
    }
    init()
  }, [])

  return (
    <ErrorBoundary onError={onError} onAIFix={onAIFix}>
      <BrowserRouter>
        {App && (
          <AppEntry>
            <App></App>
          </AppEntry>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  )
}

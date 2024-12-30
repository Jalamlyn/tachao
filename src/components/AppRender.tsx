import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Spinner } from "@nextui-org/react"
import wpm from "@wpm-js/core"

interface AppRenderProps {
  appId: string
  basename: string
  context: any
  onError?: (error: Error) => void
}

export const AppRender: React.FC<AppRenderProps> = ({ appId, basename, context, onError }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-danger'>Error loading app: {error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='Loading app...' />
      </div>
    )
  }

  const App = React.lazy(() => wpm.import(appId))
  debugger
  return (
    <ErrorBoundary onError={onError}>
      <BrowserRouter basename={basename}>
        <React.Suspense
          fallback={
            <div className='flex items-center justify-center min-h-screen'>
              <Spinner label='Loading...' />
            </div>
          }
        >
          <App />
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

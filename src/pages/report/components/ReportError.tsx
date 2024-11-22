import React from 'react'
import { Button } from '@nextui-org/react'

interface ReportErrorProps {
  error: string
  onRetry?: () => void
  showRetry?: boolean
}

export const ReportError: React.FC<ReportErrorProps> = ({ error, onRetry, showRetry }) => (
  <div className='flex flex-col items-center justify-center min-h-screen text-danger'>
    <p className='text-xl font-bold mb-2'>错误</p>
    <p>{error}</p>
    {showRetry && (
      <Button color='primary' className='mt-4' onClick={onRetry}>
        重试
      </Button>
    )}
  </div>
)
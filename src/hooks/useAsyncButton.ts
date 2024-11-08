import { useState, useCallback } from 'react';
import message from "@/components/Message";

interface UseAsyncButtonOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncButton<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncButtonOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    onSuccess, 
    onError,
    successMessage,
    errorMessage = '操作失败'
  } = options;

  const handleClick = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await asyncFn();
      
      if (successMessage) {
        message.success(successMessage);
      }
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      if (errorMessage) {
        message.error(errorMessage);
      }
      
      onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, onSuccess, onError, successMessage, errorMessage]);

  return {
    isLoading,
    handleClick
  };
}
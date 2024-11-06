import { useState, useCallback } from 'react';
import { DynamicFormConfig } from '@/components/common/DynamicForm/types';
import message from '@/components/Message';

interface FormState {
  formConfig: DynamicFormConfig | null;
  markdownContent: string;
  selectedTemplate: string;
  isGenerating: boolean;
}

const initialState: FormState = {
  formConfig: null,
  markdownContent: '',
  selectedTemplate: '',
  isGenerating: false,
};

export const useFormState = () => {
  const [state, setState] = useState<FormState>(initialState);

  const setFormConfig = useCallback((config: DynamicFormConfig | null) => {
    setState(prev => ({ ...prev, formConfig: config }));
  }, []);

  const setMarkdownContent = useCallback((content: string) => {
    setState(prev => ({ ...prev, markdownContent: content }));
  }, []);

  const setSelectedTemplate = useCallback((templateId: string) => {
    setState(prev => ({ ...prev, selectedTemplate: templateId }));
  }, []);

  const startGenerating = useCallback(() => {
    setState(prev => ({ ...prev, isGenerating: true }));
  }, []);

  const stopGenerating = useCallback(() => {
    setState(prev => ({ ...prev, isGenerating: false }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error(error);
    message.error('操作失败，请重试');
    stopGenerating();
  }, [stopGenerating]);

  return {
    state,
    setFormConfig,
    setMarkdownContent,
    setSelectedTemplate,
    startGenerating,
    stopGenerating,
    resetState,
    handleError,
  };
};
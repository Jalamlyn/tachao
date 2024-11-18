import { useState } from 'react';
import { FormState, FormActions } from '../types';

export const useFormState = (): [FormState, FormActions] => {
  const [state, setState] = useState<FormState>({
    status: 'idle',
    error: null,
    formConfig: null,
    formData: null,
    templateId: null
  });

  const actions: FormActions = {
    setLoading: () => setState(prev => ({ ...prev, status: 'loading', error: null })),
    setError: (error) => setState(prev => ({ ...prev, status: 'error', error })),
    setSuccess: (data) => setState(prev => ({
      ...prev,
      status: 'success',
      ...data,
      error: null
    })),
    reset: () => setState({
      status: 'idle',
      error: null,
      formConfig: null,
      formData: null,
      templateId: null
    })
  };

  return [state, actions];
};
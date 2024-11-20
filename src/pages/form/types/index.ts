export interface FormState {
  status: 'idle' | 'loading' | 'error' | 'success';
  error: string | null;
  formConfig: any | null;
  formData: any | null;
  templateId: string | null;
}

export interface FormActions {
  setLoading: () => void;
  setError: (error: string) => void;
  setSuccess: (data: { formConfig: any; formData: any; templateId: string }) => void;
  reset: () => void;
}

export interface AuthState {
  type: 'none' | 'wechat' | 'wecom' | 'platform';
  status: 'idle' | 'authorizing' | 'authorized' | 'error';
  error: string | null;
  userInfo: UserInfo | null;
}

export interface UserInfo {
  name: string;
  avatar?: string;
  id?: string;
  token?: string;
  [key: string]: any;
}

export interface FormConfig {
  formId: string;
  templateId: string;
  [key: string]: any;
}

export interface FormData {
  [key: string]: any;
}
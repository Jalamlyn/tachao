import { useState, useCallback } from 'react';
import { useMetadata } from '@/hooks/useMetadata';
import AIFormAgent from '@/service/agents/AIFormAgent';
import { DynamicFormConfig } from '@/components/common/DynamicForm/types';
import { useVersionControl } from '@/hooks/useVersionControl';

interface UseTemplateDataReturn {
  loading: boolean;
  error: string | null;
  formConfig: DynamicFormConfig | null;
  rawConfig: string | null;
  loadTemplate: () => Promise<{
    formConfig: DynamicFormConfig;
    rawConfig: string;
  } | null>;
}

export const useTemplateData = (
  templateId: string | undefined,
  isEditMode: boolean
): UseTemplateDataReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<DynamicFormConfig | null>(null);
  const [rawConfig, setRawConfig] = useState<string | null>(null);
  
  const { getDetail } = useMetadata('template');

  const loadTemplate = useCallback(async () => {
    if (!isEditMode || !templateId) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const template = await getDetail(templateId);
      
      if (template && template.data.rawConfig) {
        const parsedConfig = await AIFormAgent.parseConfig(template.data.rawConfig);
        
        if (parsedConfig) {
          setFormConfig(parsedConfig.config);
          setRawConfig(template.data.rawConfig);
          return {
            formConfig: parsedConfig.config,
            rawConfig: template.data.rawConfig,
          };
        } else {
          throw new Error('模板解析失败');
        }
      } else {
        throw new Error('模板加载失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '模板加载失败';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [templateId, isEditMode, getDetail]);

  return {
    loading,
    error,
    formConfig,
    rawConfig,
    loadTemplate,
  };
};
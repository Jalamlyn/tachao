import { useState, useCallback, useEffect } from 'react';
import { useMetadata } from '@/components/from-templates/hook/useMetadata';
import { DynamicFormConfig } from '@/components/common/DynamicForm/types';
import message from '@/components/Message';

interface Template {
  id: string;
  title: string;
  data: {
    config: DynamicFormConfig;
    type: 'official' | 'custom';
    name: string;
  };
}

export const useTemplates = () => {
  const {
    items: templates,
    load: loadTemplates,
    create: createTemplate,
    getDetail: getTemplateDetail,
  } = useMetadata<{
    config: DynamicFormConfig;
    type: 'official' | 'custom';
    name: string;
  }>('template');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateChange = useCallback(async (templateId: string) => {
    try {
      setIsLoading(true);
      if (!templateId) {
        return null;
      }

      const template = await getTemplateDetail(templateId);
      if (template && template.data.config) {
        message.success('模板加载成功');
        return template.data.config;
      }
      return null;
    } catch (error) {
      console.error('加载模板错误:', error);
      message.error('加载模板失败');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getTemplateDetail]);

  const saveTemplate = useCallback(async (config: DynamicFormConfig) => {
    try {
      setIsLoading(true);
      const templateData = {
        title: '新建模板',
        type: 'custom',
        status: 'active',
        data: {
          config,
          type: 'custom' as const,
          name: '新建模板',
        },
      };

      await createTemplate(templateData);
      message.success('模板保存成功');
      await loadTemplates();
    } catch (error) {
      console.error('保存模板失败:', error);
      message.error('保存模板失败');
    } finally {
      setIsLoading(false);
    }
  }, [createTemplate, loadTemplates]);

  return {
    templates,
    isLoading,
    handleTemplateChange,
    saveTemplate,
  };
};
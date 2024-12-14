import { useCallback } from 'react';
import { useMetadata } from '@/hooks/useMetadata';
import { parseFormConfig } from '@/utils/codeParser';
import { aiLog } from '@/utils/AITraceLogger';

export const useFormData = () => {
  const { getDetail: getFormDetail } = useMetadata("form");
  const { getDetail: getTemplateDetail } = useMetadata("template");

  const loadFormData = useCallback(async (formId: string) => {
    const traceId = aiLog.start();
    aiLog.log("[useFormData] Start loading form data", { formId });

    try {
      const formDetail = await getFormDetail(formId);
      if (!formDetail) {
        throw new Error("未找到表单数据");
      }
      const formTemplateId = formDetail.templateId;
      if (!formTemplateId) {
        throw new Error("未找到模板ID");
      }

      const template = await getTemplateDetail(formTemplateId);
      const { config } = await parseFormConfig(template.data.rawConfig);
      if (!template || !config) {
        throw new Error("未找到模板配置");
      }

      const formConfig = {
        ...config,
        formId,
        templateId: formTemplateId,
      };

      return {
        formData: formDetail.data,
        formConfig,
        templateId: formTemplateId
      };
    } catch (error) {
      aiLog.log("[useFormData] Error loading form data", { error });
      throw error;
    }
  }, [getFormDetail, getTemplateDetail]);

  return { loadFormData };
};
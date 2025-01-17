# 应用代码导出

## All Modules

```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  appId,
  message,
  api
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;

// 导入页面组件
const HomePage = await context.wpm.import('page_home');
const FormDetailPage = await context.wpm.import('page_form_detail');

// 错误边界组件
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error) => {
      api.log.error('应用运行时错误', { error });
      message.error('应用出现异常，请刷新重试');
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon icon="solar:shield-warning-bold" className="mb-4 h-12 w-12 text-danger" />
          <h2 className="mb-2 text-lg font-semibold">应用出现异常</h2>
          <p className="mb-4 text-small text-default-500">请刷新页面重试</p>
          <Button
            color="primary"
            onPress={() => window.location.reload()}
          >
            刷新页面
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

const App = observer(() => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/form/:formId" element={<FormDetailPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
});

context.wpm.export(appId, App);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_ai_create_modal" title="AI创建表单模态框">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message,
  api
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } = NextUI;
const DynamicFormPrint = await context.wpm.import('comp_dynamic_form_print');
const formConfig = await context.wpm.import('module_form_config');

const AICreateModal = observer(({
  isOpen,
  onOpenChange,
  loading,
  previewForms,
  currentPreviewIndex,
  printRef,
  onPrint,
  onCreateForm,
  onPreviewChange
}) => {
  const [aiText, setAiText] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [localPreviewForms, setLocalPreviewForms] = React.useState([]);
  const [showPreview, setShowPreview] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setAiText("");
      setLocalPreviewForms([]);
      setShowPreview(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!aiText.trim()) {
      message.error(formConfig.aiConfig.messages.emptyInput);
      return;
    }

    try {
      setAiLoading(true);

      const messages = [
        {
          role: 'system',
          content: `你是一个差旅费报销单生成专家。请根据用户描述生成表单数据。
          请将数据放在 <mo-ai-script> 标签中返回，确保是合法的 JSON 对象。

          返回的数据必须包含以下字段：
          {
            "basic": {
              "department": "报销部门",
              "applicant": "出差人",
              "reason": "出差事由",
              "paymentMethod": "付款方式"
            },
            "detail": [
              {
                "id": "detail_001",
                "startMonth": "出发月",
                "startDay": "出发日",
                "startLocation": "出发地点",
                "endMonth": "到达月",
                "endDay": "到达日",
                "endLocation": "到达地点",
                "personCount": "人数",
                "transport": "交通工具",
                "transportFee": "交通费用",
                "days": "天数",
                "allowanceStandard": "补助标准",
                "allowanceAmount": "补助金额",
                "hotelFee": "住宿费用",
                "localTransportFee": "市内交通费",
                "otherFee": "其他费用"
              }
            ]
          }

          注意：
          1. basic 中的字段值要根据用户描述生成
          2. detail 数组包含具体的维修项目
          3. 金额必须是合理的数值
          4. 所有必填字段都不能为空
          5. department 字段只能使用以下值之一：
             - "production" (生产部)
             - "rd" (研发部)
             - "qa" (质量部)
             - "engineering" (工程部)
             - "maintenance" (维修部)
             - "warehouse" (仓储部)
             - "logistics" (物流部)
             - "purchasing" (采购部)
             - "finance" (财务部)
             - "hr" (人力资源部)
             - "admin" (行政部)
             - "it" (信息技术部)
             - "security" (安全部)
             - "other" (其他部门)
          6. urgency 字段只能使用以下值之一：
             - "high" (高)
             - "medium" (中)
             - "low" (低)
          7. type 字段只能使用以下值之一：
             - "parts" (更换零件)
             - "repair" (维修保养)
             - "check" (检查调试)`
        },
        {
          role: 'user',
          content: aiText
        }
      ];

      await context.ai.chat(messages, {
        onResult: async (result) => {
          try {
            const scriptMatch = result.match(/<mo-ai-script>([\s\S]*?)<\/mo-ai-script>/);
            if (!scriptMatch) {
              throw new Error('AI 返回格式错误：未找到脚本标签');
            }

            const formData = JSON.parse(scriptMatch[1].trim());

            // 获取当前用户信息
            const currentUser = await api.getCurrentAccountInfo();
            const now = new Date().toISOString();
            const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // 构建完整的表单数据
            const completeForm = {
              id: formId,
              config: formConfig,
              createdAt: now,
              updatedAt: now,
              creator: {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role
              },
              operator: {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
                time: now
              },
              confirmStatus: 'pending',
              status: 'active',
              basic: formData.basic || {},
              detail: formData.detail || [],
              confirms: formConfig.confirm.forms.map(() => ({
                status: 'pending',
                updatedAt: now
              }))
            };

            setLocalPreviewForms([completeForm]);
            setShowPreview(true);

            api.log.info('AI生成表单成功', { formData });

          } catch (error) {
            api.log.error('解析 AI 返回数据失败', { error, result });
            throw new Error('AI 返回的数据格式错误: ' + error.message);
          }
        },
        temperature: 0
      });

    } catch (error) {
      message.error(formConfig.aiConfig.messages.generateError + ': ' + error.message);
      api.log.error('AI 生成表单失败', { error, text: aiText });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={showPreview ? "4xl" : "2xl"}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xl font-semibold">
                  {showPreview ? "预览表单" : "AI 智能创建表单"}
                </h3>
                {showPreview && (
                  <div className="text-small text-default-500">
                    {currentPreviewIndex + 1} / {localPreviewForms.length}
                  </div>
                )}
              </div>
            </ModalHeader>
            <ModalBody>
              {showPreview ? (
                <div ref={printRef}>
                  <DynamicFormPrint
                    form={localPreviewForms[currentPreviewIndex]}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    label={formConfig.aiConfig.title}
                    placeholder={formConfig.aiConfig.placeholder}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    minRows={5}
                    maxRows={10}
                  />
                  <div className="text-small text-default-400">
                    {formConfig.aiConfig.example.title}
                    <ul className="list-disc list-inside mt-1">
                      {formConfig.aiConfig.example.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {showPreview ? (
                <div className="flex justify-between w-full">
                  <div className="flex gap-2">
                    {localPreviewForms.length > 1 && (
                      <>
                        <Button
                          isDisabled={currentPreviewIndex === 0}
                          variant="light"
                          onPress={() => onPreviewChange(currentPreviewIndex - 1)}
                        >
                          上一个
                        </Button>
                        <Button
                          isDisabled={currentPreviewIndex === localPreviewForms.length - 1}
                          variant="light"
                          onPress={() => onPreviewChange(currentPreviewIndex + 1)}
                        >
                          下一个
                        </Button>
                      </>
                    )}
                    <Button
                      variant="light"
                      onPress={() => {
                        setShowPreview(false);
                        setLocalPreviewForms([]);
                      }}
                    >
                      返回编辑
                    </Button>
                    <Button
                      color="primary"
                      isLoading={loading}
                      onPress={() => {
                        const formData = localPreviewForms[currentPreviewIndex];
                        if (!formData?.config) {
                          message.error(formConfig.aiConfig.messages.invalidConfig);
                          return;
                        }
                        onCreateForm(formData);
                        onClose();
                      }}
                    >
                      确认创建
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="light"
                    onPress={onClose}
                  >
                    {formConfig.aiConfig.buttons.cancel}
                  </Button>
                  <Button
                    color="primary"
                    isLoading={aiLoading}
                    onPress={handleGenerate}
                  >
                    {formConfig.aiConfig.buttons.generate}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_ai_create_modal', AICreateModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delete_confirm_modal" title="删除确认模态框组件">
const {
  wpm,
  React,
  observer,
  NextUI
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } = NextUI;

const DeleteConfirmModal = observer(({
  isOpen,
  onOpenChange,
  selectedForm,
  loading,
  onConfirm
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h3 className="text-xl font-semibold">确认删除</h3>
            </ModalHeader>
            <ModalBody>
              <p>
                确定要删除表单 "{selectedForm?.formName}" 吗？
              </p>
              <p className="text-small text-danger mt-1">
                此操作不可恢复！
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
              >
                取消
              </Button>
              <Button
                color="danger"
                onPress={onConfirm}
                isLoading={loading}
              >
                确认删除
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delete_confirm_modal', DeleteConfirmModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_adapter" title="动态表单适配器">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api,
  message
} = context;

const { Card, CardBody, Button, Tabs, Tab, useDisclosure } = NextUI;

const DynamicFormBasic = await context.wpm.import('comp_dynamic_form_basic');
const DynamicFormDetail = await context.wpm.import('comp_dynamic_form_detail');
const DynamicFormConfirm = await context.wpm.import('comp_dynamic_form_confirm');
const DynamicFormAttachments = await context.wpm.import('comp_dynamic_form_attachments');
const DynamicFormHistory = await context.wpm.import('comp_dynamic_form_history');
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormAdapter = observer(({
  config,
  formId,
  onSave,
  onError,
  className,
  readOnly = false
}) => {
  const [loading, setLoading] = React.useState(false);

  // 组件初始化日志
  React.useEffect(() => {
    api.log.info('DynamicFormAdapter 初始化', {
      formId,
      readOnly,
      hasConfig: !!config,
      configKeys: config ? Object.keys(config) : [],
      configTitle: config?.title,
      validationEnabled: config?.validation?.enabled
    });
  }, []);

  // 监控 config 变化
  React.useEffect(() => {
    api.log.info('DynamicFormAdapter config 更新', {
      hasConfig: !!config,
      configStructure: {
        hasTitle: !!config?.title,
        hasBasic: !!config?.basic,
        hasDetail: !!config?.detail,
        hasConfirm: !!config?.confirm
      },
      validation: config?.validation
    });

    if (!config) {
      api.log.warn('DynamicFormAdapter config 为空', {
        formId,
        stack: new Error().stack
      });
    }
  }, [config]);

  const [selectedTab, setSelectedTab] = React.useState("basic");
  const historyModal = useDisclosure();
  const saveButtonRef = React.useRef(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        api.log.info('DynamicFormAdapter 开始加载数据', {
          formId,
          hasConfig: !!config,
          configTitle: config?.title
        });

        setLoading(true);
        if (formId) {
          await dynamicFormStore.loadFormData(formId);
          api.log.info('表单数据加载成功', {
            formId,
            hasData: !!dynamicFormStore.currentForm,
            dataStructure: dynamicFormStore.currentForm ? {
              hasBasic: !!dynamicFormStore.currentForm.basic,
              hasDetail: !!dynamicFormStore.currentForm.detail,
              hasConfirms: !!dynamicFormStore.currentForm.confirms
            } : null
          });
        } else {
          if (!config) {
            throw new Error('初始化新表单时 config 不能为空');
          }
          dynamicFormStore.initNewForm(config);
          api.log.info('新表单初始化成功', {
            configTitle: config.title,
            configType: config.type
          });
        }
      } catch (error) {
        api.log.error('动态表单初始化失败', {
          error,
          formId,
          hasConfig: !!config,
          errorStack: error.stack
        });
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [formId, config]);

  // 修改: 优化保存逻辑，添加防重复提交
  const handleSave = async () => {
    if (loading || !saveButtonRef.current) return;

    try {
      api.log.info('开始保存表单', {
        formId: dynamicFormStore.formId,
        hasBasicData: !!dynamicFormStore.currentForm?.basic,
        detailCount: dynamicFormStore.detailCount,
        confirmCount: dynamicFormStore.currentForm?.confirms?.length,
        validationEnabled: config?.validation?.enabled
      });

      saveButtonRef.current.disabled = true;
      setLoading(true);

      // 如果启用了验证，执行表单验证
      if (config?.validation?.enabled !== false) {
        const validationErrors = await dynamicFormStore.validateForm();
        if (validationErrors.length > 0) {
          api.log.warn('表单验证失败', {
            errors: validationErrors
          });
          message.error('请检查表单填写是否完整');
          return;
        }
      }

      const success = await dynamicFormStore.saveFormData();
      if (success) {
        api.log.info('表单保存成功', {
          formId: dynamicFormStore.formId,
          timestamp: new Date().toISOString()
        });
        message.success('保存成功');
        onSave?.();
      }
    } catch (error) {
      api.log.error('保存表单失败', {
        error,
        formId: dynamicFormStore.formId,
        errorStack: error.stack,
        formState: {
          hasBasicData: !!dynamicFormStore.currentForm?.basic,
          detailCount: dynamicFormStore.detailCount,
          confirmCount: dynamicFormStore.currentForm?.confirms?.length
        }
      });
      onError?.(error);
    } finally {
      setLoading(false);
      if (saveButtonRef.current) {
        saveButtonRef.current.disabled = false;
      }
    }
  };

  const renderToolbar = () => (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {config.title || '动态表单'}
        </h1>
        <p className="mt-1 text-small text-default-500">
          {config.description}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          color="primary"
          variant="flat"
          startContent={<Icon icon="solar:history-bold" />}
          onPress={historyModal.onOpen}
        >
          修改记录
        </Button>
        {!readOnly && (
          <Button
            ref={saveButtonRef}
            color="primary"
            startContent={<Icon icon="solar:disk-bold" />}
            isLoading={loading}
            onPress={handleSave}
          >
            保存
          </Button>
        )}
      </div>
    </div>
  );

  if (loading && !dynamicFormStore.currentForm) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <NextUI.Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className={className}>
      {renderToolbar()}

      <Card>
        <CardBody>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
            classNames={{
              tabList: "gap-4",
              cursor: "w-full",
              tab: "max-w-fit px-2 h-8",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab
              key="basic"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:document-text-bold" />
                  <span>基本信息</span>
                </div>
              }
            >
              <DynamicFormBasic
                config={config.basic}
                readOnly={readOnly}
                validationEnabled={config?.validation?.enabled}
              />
            </Tab>
            <Tab
              key="detail"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="icon-park-solid:table" />
                  <span>明细信息</span>
                </div>
              }
            >
              <DynamicFormDetail
                config={config.detail}
                readOnly={readOnly}
                validationEnabled={config?.validation?.enabled}
              />
            </Tab>
            <Tab
              key="attachments"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:gallery-add-bold" />
                  <span>附件信息</span>
                </div>
              }
            >
              <DynamicFormAttachments
                config={config.attachments}
                readOnly={readOnly}
              />
            </Tab>
            <Tab
              key="confirm"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:user-check-bold" />
                  <span>确认信息</span>
                </div>
              }
            >
              <DynamicFormConfirm
                config={config.confirm}
                readOnly={readOnly}
                validationEnabled={config?.validation?.enabled}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      <DynamicFormHistory
        isOpen={historyModal.isOpen}
        onOpenChange={historyModal.onOpenChange}
        formId={formId}
      />
    </div>
  );
});

context.wpm.export('comp_dynamic_form_adapter', DynamicFormAdapter);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_attachments" title="动态表单附件组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api,
  message
} = context;

const { Button, Card, Input, Progress } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormAttachments = observer(({
  config,
  readOnly = false
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小
    if (file.size > config.maxSize) {
      message.error(`文件大小不能超过 ${config.maxSize / 1024 / 1024}MB`);
      return;
    }

    // 检查文件类型
    const fileType = file.type;
    const isValidType = Object.entries(config.accept).some(([mimeType, extensions]) => {
      return fileType.startsWith(mimeType.replace('/*', '')) ||
             extensions.some(ext => file.name.toLowerCase().endsWith(ext));
    });

    if (!isValidType) {
      message.error('不支持的文件类型');
      return;
    }

    // 检查数量限制
    if (dynamicFormStore.attachmentsCount >= config.maxCount) {
      message.error(`最多只能上传 ${config.maxCount} 个文件`);
      return;
    }

    try {
      setUploading(true);

      const result = await api.upload.uploadFile(file, {
        onProgress: (percent) => {
          setProgress(percent);
        },
        maxSize: config.maxSize,
        uploadType: file.type.startsWith('image/') ? 'image' : 'file',
        onSuccess: (fileInfo) => {
          message.success('上传成功');
        },
        onError: (error) => {
          throw error;
        }
      });

      // 添加到 store
      await dynamicFormStore.addAttachment({
        id: `attachment_${Date.now()}`,
        name: file.name,
        url: result.fileUrl,
        type: file.type,
        size: file.size,
        uploadTime: new Date().toISOString(),
        uploadBy: (await api.getCurrentAccountInfo()).name
      });

    } catch (error) {
      message.error('上传失败: ' + error.message);
      api.log.error('上传附件失败', { error, fileName: file.name });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachment) => {
    try {
      await dynamicFormStore.removeAttachment(attachment.id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
      api.log.error('删除附件失败', { error, attachment });
    }
  };

  const handlePreview = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      window.open(attachment.url, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="space-y-6 py-4">
      {!readOnly && (
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept={Object.entries(config.accept)
              .map(([type, exts]) => exts.join(','))
              .join(',')}
            disabled={uploading}
          />

          {config.types.map(type => (
            <Button
              key={type.key}
              color="primary"
              variant="flat"
              startContent={<Icon icon={type.icon} />}
              isDisabled={uploading}
              onPress={() => fileInputRef.current?.click()}
            >
              上传{type.label}
            </Button>
          ))}
        </div>
      )}

      {uploading && (
        <Progress
          size="sm"
          value={progress}
          color="primary"
          className="max-w-md"
          label={`上传中 ${progress}%`}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {dynamicFormStore.attachments.map((attachment) => (
          <Card
            key={attachment.id}
            className="w-full"
          >
            <div className="p-4 flex items-center gap-4">
              <Icon
                icon={attachment.type.startsWith('image/') ? 'solar:gallery-bold' : 'solar:document-bold'}
                className="w-8 h-8 text-default-400"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" title={attachment.name}>
                  {attachment.name}
                </p>
                <div className="flex items-center gap-2 text-small text-default-400">
                  <span>{(attachment.size / 1024).toFixed(1)}KB</span>
                  <span>·</span>
                  <span>{new Date(attachment.uploadTime).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => handlePreview(attachment)}
                >
                  <Icon icon="solar:eye-bold" />
                </Button>
                {!readOnly && (
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => handleDelete(attachment)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {dynamicFormStore.attachments.length === 0 && (
        <div className="text-center py-8">
          <Icon icon="solar:gallery-wide-bold" className="w-12 h-12 mx-auto mb-4 text-default-300" />
          <p className="text-default-400">
            {readOnly ? '暂无附件' : '点击上方按钮上传附件'}
          </p>
        </div>
      )}
    </div>
  );
});

context.wpm.export('comp_dynamic_form_attachments', DynamicFormAttachments);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_basic" title="动态表单基本信息">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api
} = context;

const dynamicFormStore = await context.wpm.import('store_dynamic_form');

// 导入字段渲染器
const TextField = await context.wpm.import('comp_field_text');
const TextareaField = await context.wpm.import('comp_field_textarea');
const NumberField = await context.wpm.import('comp_field_number');
const DateField = await context.wpm.import('comp_field_date');
const DateTimeField = await context.wpm.import('comp_field_datetime');
const SelectField = await context.wpm.import('comp_field_select');
const RadioField = await context.wpm.import('comp_field_radio');
const CheckboxField = await context.wpm.import('comp_field_checkbox');
const SwitchField = await context.wpm.import('comp_field_switch');
const MoneyField = await context.wpm.import('comp_field_money');

const DynamicFormBasic = observer(({
  config,
  readOnly = false
}) => {
  // 字段错误信息
  const [errors, setErrors] = React.useState({});

  // 处理字段变更
  const handleFieldChange = (field, value) => {
    // 清除错误
    if (errors[field.name]) {
      setErrors(prev => ({
        ...prev,
        [field.name]: undefined
      }));
    }

    // 执行验证
    if (field.validate) {
      const error = field.validate(value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [field.name]: error
        }));
        return;
      }
    }

    // 更新字段值
    dynamicFormStore.updateBasicField(field.name, value);
  };

  // 渲染字段
  const renderField = (field) => {
    const value = dynamicFormStore.currentForm?.basic?.[field.name];
    const error = errors[field.name];

    const commonProps = {
      field: {
        ...field,
        readOnly,
        disabled: readOnly
      },
      value,
      onChange: (val) => handleFieldChange(field, val),
      error
    };

    switch (field.type) {
      case 'text':
        return <TextField {...commonProps} />;
      case 'textarea':
        return <TextareaField {...commonProps} />;
      case 'number':
        return <NumberField {...commonProps} />;
      case 'date':
        return <DateField {...commonProps} />;
      case 'datetime':
        return <DateTimeField {...commonProps} />;
      case 'select':
        return <SelectField {...commonProps} />;
      case 'radio':
        return <RadioField {...commonProps} />;
      case 'checkbox':
        return <CheckboxField {...commonProps} />;
      case 'switch':
        return <SwitchField {...commonProps} />;
      case 'money':
        return <MoneyField {...commonProps} />;
      default:
        api.log.warn('未知的字段类型', { field });
        return null;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {config.fields?.map((field) => (
        <div key={field.name} className={cn(
          "relative",
          field.span === 'full' ? 'col-span-2' : ''
        )}>
          {renderField(field)}
          {field.help && (
            <p className="mt-1 text-xs text-default-400">
              {field.help}
            </p>
          )}
        </div>
      ))}
    </div>
  );
});

context.wpm.export('comp_dynamic_form_basic', DynamicFormBasic);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_confirm" title="动态表单确认信息">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  message,
  api
} = context;

const { Input, Textarea, Avatar, Button, Card, CardBody } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormConfirm = observer(({
  config,
  readOnly = false
}) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // 加载当前用户信息
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await api.getCurrentAccountInfo();
        setCurrentUser(userInfo);
      } catch (error) {
        api.log.error('加载用户信息失败', { error });
        message.error('加载用户信息失败');
      }
    };
    loadUser();
  }, []);

  // 处理确认
  const handleConfirm = async (formIndex) => {
    if (loading) return;

    try {
      setLoading(true);
      const confirmInfo = {
        name: currentUser.name,
        phone: currentUser.phone || currentUser.mobile,
        time: new Date().toISOString(),
        status: 'confirmed'
      };
      await dynamicFormStore.updateConfirmForm(formIndex, confirmInfo);
      message.success('确认成功');

      api.log.info('表单确认成功', {
        formIndex,
        confirmInfo
      });
    } catch (error) {
      message.error('确认失败: ' + (error.message || '未知错误'));
      api.log.error('确认失败', { error, formIndex });
    } finally {
      setLoading(false);
    }
  };

  // 处理取消确认
  const handleCancel = async (formIndex) => {
    if (loading) return;

    try {
      setLoading(true);
      await dynamicFormStore.updateConfirmForm(formIndex, {
        ...dynamicFormStore.currentForm.confirms[formIndex],
        status: 'cancelled',
        cancelTime: new Date().toISOString(),
        cancelBy: currentUser.name,
        cancelReason: ''
      });
      message.success('已取消确认');

      api.log.info('取消确认成功', {
        formIndex,
        userName: currentUser.name
      });
    } catch (error) {
      message.error('取消确认失败: ' + (error.message || '未知错误'));
      api.log.error('取消确认失败', { error, formIndex });
    } finally {
      setLoading(false);
    }
  };

  // 处理字段变更
  const handleFieldChange = (formIndex, field, value) => {
    dynamicFormStore.updateConfirmField(formIndex, field.name, value);
  };

  // 渲染确认状态标签
  const renderStatusChip = (status) => {
    switch(status) {
      case 'confirmed':
        return (
          <NextUI.Chip
            size="sm"
            color="success"
            variant="flat"
            startContent={<Icon icon="solar:check-circle-bold" className="text-success" />}
          >
            已确认
          </NextUI.Chip>
        );
      case 'cancelled':
        return (
          <NextUI.Chip
            size="sm"
            color="danger"
            variant="flat"
            startContent={<Icon icon="solar:close-circle-bold" className="text-danger" />}
          >
            已取消
          </NextUI.Chip>
        );
      default:
        return (
          <NextUI.Chip
            size="sm"
            color="warning"
            variant="flat"
            startContent={<Icon icon="solar:clock-circle-bold" className="text-warning" />}
          >
            待确认
          </NextUI.Chip>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <NextUI.Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* 当前用户信息 */}
      <div className="rounded-lg bg-default-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            size="sm"
            src={currentUser.avatar}
            fallback={
              <Icon className="text-default-500" icon="solar:user-bold" width={20} />
            }
          />
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-small text-default-500">
              {currentUser.phone || currentUser.mobile}
            </p>
          </div>
        </div>
      </div>

      {/* 确认表单列表 */}
      <div className="space-y-4">
        {config.forms.map((form, index) => {
          const confirmData = dynamicFormStore.currentForm?.confirms?.[index];
          const isConfirmed = confirmData?.status === 'confirmed';
          const isCancelled = confirmData?.status === 'cancelled';
          const isPending = !confirmData?.status || confirmData.status === 'pending';

          return (
            <Card
              key={form.id || index}
              className={cn(
                "border",
                isConfirmed ? "border-success" :
                isCancelled ? "border-danger" :
                "border-default-200"
              )}
            >
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{form.title}</h3>
                    <div className="flex items-center gap-2">
                      {renderStatusChip(confirmData?.status)}
                      {!readOnly && (
                        <>
                          {isConfirmed && (
                            <Button
                              color="danger"
                              variant="flat"
                              size="sm"
                              isLoading={loading}
                              onPress={() => handleCancel(index)}
                            >
                              取消确认
                            </Button>
                          )}
                          {(isCancelled || isPending) && (
                            <Button
                              color="success"
                              variant="flat"
                              size="sm"
                              isLoading={loading}
                              onPress={() => handleConfirm(index)}
                            >
                              {isCancelled ? '重新确认' : '确认'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {form.fields.map((field) => (
                      <div key={field.name}>
                        <Input
                          label={field.label}
                          value={confirmData?.[field.name] || ''}
                          isReadOnly={readOnly || isConfirmed}
                          isRequired={field.required}
                          onChange={(e) => handleFieldChange(index, field, e.target.value)}
                          startContent={
                            field.icon && (
                              <Icon
                                className="text-default-400 pointer-events-none flex-shrink-0"
                                icon={field.icon}
                                width={20}
                              />
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* 确认信息 */}
                  {isConfirmed && (
                    <div className="text-small text-success">
                      确认时间: {new Date(confirmData.time).toLocaleString()}
                      <br/>
                      确认人: {confirmData.name}
                    </div>
                  )}

                  {/* 取消信息 */}
                  {isCancelled && (
                    <div className="text-small text-danger">
                      取消时间: {new Date(confirmData.cancelTime).toLocaleString()}
                      <br/>
                      取消人: {confirmData.cancelBy}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

context.wpm.export('comp_dynamic_form_confirm', DynamicFormConfirm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_detail" title="动态表单明细信息">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api,
  message,
  esm
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, useDisclosure, Input } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

// 导入 Decimal.js
const Decimal = await import('https://esm.sh/decimal.js@10.4.3').then(m => m.default);

const DynamicFormDetail = observer(({
  config,
  readOnly = false,
  validationEnabled = true
}) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const editModal = useDisclosure();

  // 使用计算属性获取数据
  const detailData = dynamicFormStore.detailData;
  const totalAmount = dynamicFormStore.totalAmount;
  const detailCount = dynamicFormStore.detailCount;

  // 添加数据检查和日志
  React.useEffect(() => {
    api.log.info('明细组件初始化', {
      hasData: !!detailData,
      dataLength: detailData?.length,
      readOnly,
      validationEnabled
    });
  }, []);

  React.useEffect(() => {
    api.log.info('明细数据更新', {
      hasData: !!detailData,
      dataLength: detailData?.length,
      totalAmount,
      detailCount
    });
  }, [detailData]);

  // 数据检查
  if (!Array.isArray(detailData)) {
    api.log.warn('明细数据格式错误', {
      detailData,
      type: typeof detailData
    });
    return (
      <div className="p-4 text-center">
        <Icon icon="solar:danger-triangle-bold" className="w-8 h-8 mx-auto mb-2 text-danger" />
        <p>数据格式错误</p>
      </div>
    );
  }

  // 处理添加
  const handleAdd = (item) => {
    try {
      setLoading(true);
      api.log.info('添加明细项', { item });

      // 如果启用了验证，执行字段验证
      if (validationEnabled) {
        const errors = [];
        config.columns.forEach(column => {
          if (column.required && !item[column.key]) {
            errors.push(`${column.label}不能为空`);
          }
        });

        if (errors.length > 0) {
          message.error(errors[0]);
          return;
        }
      }

      // 计算金额
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = quantity * price;

      dynamicFormStore.addDetailItem({
        ...item,
        amount: amount
      });
      editModal.onClose();
      message.success('添加成功');
    } catch (error) {
      message.error('添加失败: ' + error.message);
      api.log.error('添加明细失败', { error, item });
    } finally {
      setLoading(false);
    }
  };

  // 处理编辑
  const handleEdit = (item) => {
    try {
      setLoading(true);
      api.log.info('编辑明细项', {
        oldItem: selectedItem,
        newItem: item
      });

      // 如果启用了验证，执行字段验证
      if (validationEnabled) {
        const errors = [];
        config.columns.forEach(column => {
          if (column.required && !item[column.key]) {
            errors.push(`${column.label}不能为空`);
          }
        });

        if (errors.length > 0) {
          message.error(errors[0]);
          return;
        }
      }

      // 计算金额
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = quantity * price;

      dynamicFormStore.updateDetailItem(selectedItem.index, {
        ...item,
        amount: amount
      });
      editModal.onClose();
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败: ' + error.message);
      api.log.error('更新明细失败', { error, item });
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = (index) => {
    try {
      setLoading(true);
      api.log.info('删除明细项', { index });

      dynamicFormStore.removeDetailItem(index);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败: ' + error.message);
      api.log.error('删除明细失败', { error, index });
    } finally {
      setLoading(false);
    }
  };

  // 获取可见列配置
  const visibleColumns = React.useMemo(() => {
    const columns = [...config.columns];
    if (!readOnly) {
      columns.push({
        key: "actions",
        label: "操作",
        align: "center"
      });
    }
    return columns;
  }, [config.columns, readOnly]);

  // 渲染单元格
  const renderCell = (item, columnKey) => {
    try {
      const column = config.columns.find(col => col.key === columnKey);
      if (!column) {
        api.log.warn('未找到列配置', { columnKey, columns: config.columns });
        return null;
      }

      if (columnKey === "actions") {
        return !readOnly && (
          <div className="flex justify-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => {
                setSelectedItem({ ...item, index: detailData.indexOf(item) });
                editModal.onOpen();
              }}
            >
              <Icon icon="solar:pen-bold" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={() => handleDelete(detailData.indexOf(item))}
            >
              <Icon icon="solar:trash-bin-trash-bold" />
            </Button>
          </div>
        );
      }

      // 处理金额显示
      if (column.type === 'money') {
        const amount = Number(item[columnKey]);
        return !isNaN(amount) ? `¥${amount.toFixed(2)}` : '¥0.00';
      }

      switch (column.type) {
        case 'money':
          if (column.format === 'currency') {
            const amount = Number(item[columnKey]);
            return !isNaN(amount) ? `¥${amount.toFixed(2)}` : '¥0.00';
          }
          return item[columnKey];
        case 'number':
          const num = Number(item[columnKey]);
          return !isNaN(num) ? num.toLocaleString() : '0';
        case 'date':
          return item[columnKey] ? new Date(item[columnKey]).toLocaleString() : '-';
        default:
          return item[columnKey] || '-';
      }
    } catch (error) {
      api.log.error('渲染单元格失败', { error, columnKey, item });
      return '-';
    }
  };

  // 自动计算金额
  const calculateAmount = (formState) => {
    try {
      const transportFee = new Decimal(formState.transportFee || 0);
      const allowanceAmount = new Decimal(formState.allowanceAmount || 0);
      const hotelFee = new Decimal(formState.hotelFee || 0);
      const localTransportFee = new Decimal(formState.localTransportFee || 0);
      const otherFee = new Decimal(formState.otherFee || 0);

      return transportFee
        .plus(allowanceAmount)
        .plus(hotelFee)
        .plus(localTransportFee)
        .plus(otherFee)
        .toNumber();
    } catch (error) {
      api.log.error('计算金额失败', { error, formState });
      return 0;
    }
  };

  return (
    <div className="space-y-4 py-4">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <div className="text-small text-default-500">
            共 {detailCount} 项，总金额：
            <span className="font-semibold text-primary">
              ¥{totalAmount.toFixed(2)}
            </span>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => {
              setSelectedItem(null);
              editModal.onOpen();
            }}
          >
            添加明细
          </Button>
        </div>
      )}

      <Table
        aria-label={config.title || "明细信息"}
        classNames={{
          wrapper: "max-h-[400px]"
        }}
        selectionMode="none"
      >
        <TableHeader>
          {visibleColumns.map((column) => (
            <TableColumn
              key={column.key}
              align={column.align || "start"}
            >
              {column.label}
              {column.required && (
                <span className="text-danger ml-1">*</span>
              )}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={detailData}
          emptyContent={
            <div className="text-center py-6 text-default-400">
              <Icon icon="solar:box-minimalistic-bold" className="w-8 h-8 mx-auto mb-2" />
              <p>暂无明细数据</p>
              {!readOnly && (
                <p className="text-xs mt-1">点击"添加明细"按钮添加数据</p>
              )}
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <NextUI.Modal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        placement="top-center"
        scrollBehavior="outside"
      >
        <NextUI.ModalContent>
          {(onClose) => {
            const [formState, setFormState] = React.useState(selectedItem || {});
            const [estimatedAmount, setEstimatedAmount] = React.useState(0);

            // 处理字段变化并计算预计金额
            const handleFieldChange = (field, value) => {
              const newState = {
                ...formState,
                [field]: value
              };
              setFormState(newState);

              // 计算预计金额
              const amount = calculateAmount(newState);
              setEstimatedAmount(amount);
            };

            // 初始化时计算预计金额
            React.useEffect(() => {
              const amount = calculateAmount(formState);
              setEstimatedAmount(amount);
            }, []);

            return (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {};
                config.columns.forEach(column => {
                  if (column.key !== 'actions') {
                    const value = formData.get(column.key);
                    data[column.key] = value;
                  }
                });

                if (selectedItem) {
                  handleEdit(data);
                } else {
                  handleAdd(data);
                }
              }}>
                <NextUI.ModalHeader>
                  <h3 className="text-xl font-semibold">
                    {selectedItem ? '编辑明细' : '添加明细'}
                  </h3>
                </NextUI.ModalHeader>
                <NextUI.ModalBody>
                  <div className="space-y-4">
                    {config.columns.map((column) => {
                      if (column.key === 'actions') return null;

                      return (
                        <Input
                          key={column.key}
                          name={column.key}
                          label={column.label}
                          type={column.type === 'number' || column.type === 'money' ? 'number' : 'text'}
                          defaultValue={selectedItem?.[column.key]}
                          isRequired={validationEnabled && column.required}
                          step={column.type === 'money' ? "0.01" : "1"}
                          onChange={(e) => handleFieldChange(column.key, e.target.value)}
                        />
                      );
                    })}
                    <div className="text-small text-default-500">
                      预计金额：¥{estimatedAmount.toFixed(2)}
                    </div>
                  </div>
                </NextUI.ModalBody>
                <NextUI.ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                  >
                    取消
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                  >
                    确定
                  </Button>
                </NextUI.ModalFooter>
              </form>
            );
          }}
        </NextUI.ModalContent>
      </NextUI.Modal>
    </div>
  );
});

context.wpm.export('comp_dynamic_form_detail', DynamicFormDetail);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_history" title="动态表单历史记录">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, useDisclosure, User } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormHistory = observer(({
  isOpen,
  onOpenChange,
  formId
}) => {
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [selectedVersions, setSelectedVersions] = React.useState(null);
  const diffModal = useDisclosure();

  // 加载历史记录
  React.useEffect(() => {
    const loadHistory = async () => {
      if (!formId || !isOpen) return;

      try {
        setLoading(true);
        const result = await api.queryMetadataHistory({
          names: [`${dynamicFormStore.formPrefix}_${formId}`],
          limit: 50
        });
        if (result.data) {
          const parsedHistory = result.data.map(item => {
            const value = JSON.parse(item.value);
            return {
              id: `history_${item.versionCode}`,
              versionCode: item.versionCode,
              updatedAt: item.updatedAt,
              updatedBy: value.operator?.name || item.updatedBy || '未知用户',
              updatedByRole: value.operator?.role || '未知角色',
              value: value
            };
          });
          setHistory(parsedHistory);
        }
      } catch (error) {
        api.log.error('加载历史记录失败', { error });
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [formId, isOpen]);

  // 比较两个版本
  const compareVersions = (current, previous) => {
    setSelectedVersions({ current, previous });
    diffModal.onOpen();
  };

  // 渲染差异内容
  const renderDiff = () => {
    if (!selectedVersions) return null;

    const { current, previous } = selectedVersions;
    const changes = [];

    // 比较基本信息
    Object.keys(current.value.basic || {}).forEach(key => {
      if (JSON.stringify(current.value.basic[key]) !== JSON.stringify(previous.value.basic[key])) {
        changes.push({
          id: `diff_basic_${key}`,
          type: 'basic',
          field: key,
          oldValue: previous.value.basic[key],
          newValue: current.value.basic[key]
        });
      }
    });

    // 比较明细信息
    const currentDetail = current.value.detail || [];
    const previousDetail = previous.value.detail || [];
    if (JSON.stringify(currentDetail) !== JSON.stringify(previousDetail)) {
      changes.push({
        id: `diff_detail_${current.versionCode}`,
        type: 'detail',
        oldValue: previousDetail,
        newValue: currentDetail
      });
    }

    // 比较确认信息
    if (JSON.stringify(current.value.confirms) !== JSON.stringify(previous.value.confirms)) {
      changes.push({
        id: `diff_confirm_${current.versionCode}`,
        type: 'confirm',
        oldValue: previous.value.confirms,
        newValue: current.value.confirms
      });
    }

    return (
      <div className="space-y-4">
        {changes.map((change) => (
          <div
            key={change.id}
            className={cn(
              "rounded-lg border p-4",
              "transition-colors duration-200",
              "border-warning/20 bg-warning/10"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                className="text-warning"
                icon="solar:pen-bold"
                width={20}
              />
              <span className="font-medium">
                {change.type === 'basic' ? `基本信息 - ${change.field}` :
                 change.type === 'detail' ? '明细信息' : '确认信息'}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-small text-default-500">修改前：</p>
                <pre className="mt-1 text-small bg-default-100 rounded-lg p-2 whitespace-pre-wrap">
                  {JSON.stringify(change.oldValue, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-small text-default-500">修改后：</p>
                <pre className="mt-1 text-small bg-default-100 rounded-lg p-2 whitespace-pre-wrap">
                  {JSON.stringify(change.newValue, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-semibold">修改记录</h3>
              </ModalHeader>
              <ModalBody>
                {loading ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <NextUI.Spinner label="加载中..." />
                  </div>
                ) : (
                  <Table
                    aria-label="修改历史记录"
                    classNames={{
                      th: "bg-default-100",
                      td: "py-3"
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="version">版本</TableColumn>
                      <TableColumn key="operator">修改人</TableColumn>
                      <TableColumn key="time">修改时间</TableColumn>
                      <TableColumn key="action" align="center">操作</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={history}
                      emptyContent={
                        <div className="text-center py-6">
                          <Icon icon="solar:notebook-minimalistic-bold" className="mx-auto mb-2 h-8 w-8 text-default-400" />
                          <p>暂无修改记录</p>
                        </div>
                      }
                    >
                      {(item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <span className="font-medium">v{item.versionCode}</span>
                          </TableCell>
                          <TableCell>
                            <User
                              name={item.updatedBy}
                              description={item.updatedByRole}
                              avatarProps={{
                                src: `https://api.dicebear.com/7.x/initials/svg?seed=${item.updatedBy}`,
                                size: "sm",
                                radius: "lg"
                              }}
                              classNames={{
                                name: "font-medium"
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                              <span className="text-tiny text-default-400">
                                {new Date(item.updatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {history.indexOf(item) < history.length - 1 && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="solar:eye-bold" />}
                                onPress={() => compareVersions(item, history[history.indexOf(item) + 1])}
                              >
                                查看修改
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={diffModal.isOpen}
        onOpenChange={diffModal.onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-semibold">修改详情</h3>
              </ModalHeader>
              <ModalBody>
                {renderDiff()}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

context.wpm.export('comp_dynamic_form_history', DynamicFormHistory);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_dynamic_form_print">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const DynamicFormPrint = observer(({ form }) => {
  if (!form) return null;

  // 计算总金额
  const calculateTotal = React.useCallback((details) => {
    if (!Array.isArray(details)) return 0;
    return details.reduce((sum, item) => {
      const transportFee = Number(item.transportFee) || 0;
      const allowanceAmount = Number(item.allowanceAmount) || 0;
      const hotelFee = Number(item.hotelFee) || 0;
      const localTransportFee = Number(item.localTransportFee) || 0;
      const otherFee = Number(item.otherFee) || 0;
      return sum + transportFee + allowanceAmount + hotelFee + localTransportFee + otherFee;
    }, 0);
  }, []);

  const totalAmount = React.useMemo(() => {
    return calculateTotal(form.detail);
  }, [form.detail]);

  return (
    <div className="print-content p-8 bg-white">
      <style type='text/css' media='print'>{`
        @page {
          size: A4 landscape;
          margin: 20mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-content {
            padding: 20mm !important;
            width: 297mm !important;
            margin: 0 auto !important;
          }
          .no-break {
            break-inside: avoid;
          }
          .total-row {
            background-color: #f4f4f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">差旅费报销单</h1>
        <div className="flex justify-between text-sm text-gray-500">
          <span>报销部门: {form.basic?.department}</span>
          <span>单据编号: {form.id}</span>
          <span>报销日期: {new Date(form.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="no-break">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-bold">出差人：</span>
              {form.basic?.applicant}
            </div>
            <div>
              <span className="font-bold">付款方式：</span>
              {form.basic?.paymentMethod === 'bank' ? '银行转账' :
               form.basic?.paymentMethod === 'cash' ? '现金支付' : '其他方式'}
            </div>
            <div className="col-span-3">
              <span className="font-bold">出差事由：</span>
              {form.basic?.reason}
            </div>
          </div>
        </div>

        {/* 明细信息 */}
        <div className="no-break">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-center" rowSpan="2">出发</th>
                <th className="border p-2 text-center" colSpan="3">到达</th>
                <th className="border p-2 text-center" rowSpan="2">人数</th>
                <th className="border p-2 text-center" colSpan="2">交通</th>
                <th className="border p-2 text-center" colSpan="3">出差补助</th>
                <th className="border p-2 text-center" colSpan="3">其他费用</th>
                <th className="border p-2 text-center" rowSpan="2">合计</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border p-2 text-center">月</th>
                <th className="border p-2 text-center">日</th>
                <th className="border p-2 text-center">地点</th>
                <th className="border p-2 text-center">工具</th>
                <th className="border p-2 text-center">金额</th>
                <th className="border p-2 text-center">天数</th>
                <th className="border p-2 text-center">标准</th>
                <th className="border p-2 text-center">金额</th>
                <th className="border p-2 text-center">住宿</th>
                <th className="border p-2 text-center">市内交通</th>
                <th className="border p-2 text-center">其他</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(form.detail) && form.detail.map((item, index) => {
                const rowTotal = (Number(item.transportFee) || 0) +
                               (Number(item.allowanceAmount) || 0) +
                               (Number(item.hotelFee) || 0) +
                               (Number(item.localTransportFee) || 0) +
                               (Number(item.otherFee) || 0);

                return (
                  <tr key={index}>
                    <td className="border p-2 text-center">{item.startMonth}/{item.startDay}</td>
                    <td className="border p-2 text-center">{item.startLocation}</td>
                    <td className="border p-2 text-center">{item.endMonth}/{item.endDay}</td>
                    <td className="border p-2 text-center">{item.endLocation}</td>
                    <td className="border p-2 text-center">{item.personCount}</td>
                    <td className="border p-2 text-center">
                      {item.transport === 'plane' ? '飞机' :
                       item.transport === 'train' ? '火车' :
                       item.transport === 'bus' ? '汽车' : '其他'}
                    </td>
                    <td className="border p-2 text-right">¥{Number(item.transportFee).toFixed(2)}</td>
                    <td className="border p-2 text-center">{item.days}</td>
                    <td className="border p-2 text-right">¥{Number(item.allowanceStandard).toFixed(2)}</td>
                    <td className="border p-2 text-right">¥{Number(item.allowanceAmount).toFixed(2)}</td>
                    <td className="border p-2 text-right">¥{Number(item.hotelFee).toFixed(2)}</td>
                    <td className="border p-2 text-right">¥{Number(item.localTransportFee).toFixed(2)}</td>
                    <td className="border p-2 text-right">¥{Number(item.otherFee).toFixed(2)}</td>
                    <td className="border p-2 text-right font-bold">¥{rowTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="total-row font-bold">
                <td className="border p-2 text-center bg-gray-50" colSpan="13">合计</td>
                <td className="border p-2 text-right bg-gray-50">¥{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 金额大写 */}
        <div className="no-break mt-4">
          <p className="text-right">
            <span className="font-bold">金额大写：</span>
            <span className="underline">{numberToChinese(totalAmount)}</span>
          </p>
        </div>

        {/* 确认信息 */}
        <div className="no-break mt-8">
          <div className="grid grid-cols-5 gap-4">
            {Array.isArray(form.confirms) && form.confirms.map((confirm, index) => (
              <div key={index} className="border p-4 rounded">
                <h4 className="font-bold mb-2">
                  {form.config.confirm.forms[index].title}
                </h4>
                <div className="space-y-1 text-sm">
                  <p>确认人：{confirm.name || '-'}</p>
                  {confirm.date && (
                    <p>日期：{new Date(confirm.date).toLocaleDateString()}</p>
                  )}
                  {confirm.note && <p>备注：{confirm.note}</p>}
                  <p>状态：
                    {confirm.status === 'confirmed' ? '已确认' :
                     confirm.status === 'cancelled' ? '已取消' : '待确认'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 附件信息 */}
        {Array.isArray(form.attachments) && form.attachments.length > 0 && (
          <div className="no-break mt-8">
            <h3 className="text-lg font-bold mb-4">附件信息</h3>
            <div className="grid grid-cols-2 gap-4">
              {form.attachments.map((attachment, index) => (
                <div key={attachment.id} className="border p-4 rounded">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={attachment.type.startsWith('image/') ? 'solar:gallery-bold' : 'solar:document-bold'}
                      className="w-5 h-5 text-default-400"
                    />
                    <span className="font-medium">{attachment.name}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <span>上传时间：{new Date(attachment.uploadTime).toLocaleString()}</span>
                    <span className="mx-2">·</span>
                    <span>上传人：{attachment.uploadBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部说明 */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500">注：请妥善保管单据，如有遗失概不负责</p>
          <p className="mt-1 text-gray-400">打印时间：{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
});

// 数字转中文大写
function numberToChinese(num) {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
  const decimal = ['角', '分'];

  let result = '';
  const numStr = num.toFixed(2);
  const integerPart = Math.floor(num).toString();
  const decimalPart = numStr.split('.')[1];

  // 处理整数部分
  for (let i = 0; i < integerPart.length; i++) {
    const digit = parseInt(integerPart[i]);
    const unit = units[integerPart.length - 1 - i];
    if (digit === 0) {
      if (i === integerPart.length - 1 || result.endsWith('零')) continue;
      result += digits[digit];
    } else {
      result += digits[digit] + unit;
    }
  }

  result += '元';

  // 处理小数部分
  if (parseInt(decimalPart) === 0) {
    result += '整';
  } else {
    for (let i = 0; i < 2; i++) {
      const digit = parseInt(decimalPart[i]);
      if (digit !== 0) {
        result += digits[digit] + decimal[i];
      }
    }
  }

  return result;
}

context.wpm.export('comp_dynamic_form_print', DynamicFormPrint);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_checkbox" title="复选框组字段渲染器">
const {
  React,
  NextUI
} = context;

const { CheckboxGroup, Checkbox } = NextUI;

const CheckboxField = ({ field, value, onChange, error }) => {
  return (
    <CheckboxGroup
      label={field.label}
      value={value || []}
      onValueChange={onChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      orientation={field.direction || "horizontal"}
      className={field.className}
    >
      {field.options.map((option) => (
        <Checkbox
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
        >
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

context.wpm.export('comp_field_checkbox', CheckboxField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_date" title="日期字段渲染器">
const {
  React,
  NextUI
} = context;

const { Input } = NextUI;

const DateField = ({ field, value, onChange, error }) => {
  // 格式化日期值
  const formatValue = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  // 处理日期变更
  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onChange(undefined);
      return;
    }
    onChange(new Date(val));
  };

  return (
    <Input
      type="date"
      label={field.label}
      placeholder={field.placeholder || `请选择${field.label}`}
      value={formatValue(value)}
      onChange={handleChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      min={field.minDate ? formatValue(field.minDate) : undefined}
      max={field.maxDate ? formatValue(field.maxDate) : undefined}
      className={field.className}
    />
  );
};

context.wpm.export('comp_field_date', DateField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_datetime" title="日期时间字段渲染器">
const {
  React,
  NextUI
} = context;

const { Input } = NextUI;

const DateTimeField = ({ field, value, onChange, error }) => {
  // 格式化日期时间值
  const formatValue = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.replace('Z', '');
    }
    return date.toISOString().replace('Z', '');
  };

  // 处理日期时间变更
  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onChange(undefined);
      return;
    }
    onChange(new Date(val));
  };

  return (
    <Input
      type="datetime-local"
      label={field.label}
      placeholder={field.placeholder || `请选择${field.label}`}
      value={formatValue(value)}
      onChange={handleChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      min={field.minDate ? formatValue(field.minDate) : undefined}
      max={field.maxDate ? formatValue(field.maxDate) : undefined}
      className={field.className}
    />
  );
};

context.wpm.export('comp_field_datetime', DateTimeField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_money" title="金额字段渲染器">
const {
  React,
  NextUI
} = context;

const { Input } = NextUI;

// 导入 decimal.js 用于精确计算
const Decimal = await import('https://esm.sh/decimal.js@10.4.3').then(m => m.default);

const MoneyField = ({ field, value, onChange, error }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
      return;
    }

    try {
      const amount = new Decimal(val);
      if (field.min !== undefined && amount.lessThan(field.min)) {
        return;
      }
      if (field.max !== undefined && amount.greaterThan(field.max)) {
        return;
      }

      const precision = field.precision ?? 2;
      onChange(amount.toDecimalPlaces(precision).toNumber());
    } catch (error) {
      // 忽略无效输入
    }
  };

  const formatValue = (val) => {
    if (val === undefined || val === null) return '';
    try {
      const amount = new Decimal(val);
      const precision = field.precision ?? 2;
      return amount.toFixed(precision);
    } catch {
      return '';
    }
  };

  return (
    <Input
      type="number"
      label={field.label}
      placeholder={field.placeholder || `请输入${field.label}`}
      value={formatValue(value)}
      onChange={handleChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      step={Math.pow(0.1, field.precision ?? 2)}
      min={field.min}
      max={field.max}
      className={field.className}
      startContent={
        <div className="pointer-events-none flex items-center">
          <span className="text-default-400 text-small">
            {field.currency || '¥'}
          </span>
        </div>
      }
    />
  );
};

context.wpm.export('comp_field_money', MoneyField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_number" title="数字字段渲染器">
const {
  React,
  NextUI
} = context;

const { Input } = NextUI;

const NumberField = ({ field, value, onChange, error }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
      return;
    }

    const num = Number(val);
    if (!isNaN(num)) {
      if (field.precision !== undefined) {
        onChange(Number(num.toFixed(field.precision)));
      } else {
        onChange(num);
      }
    }
  };

  return (
    <Input
      type="number"
      label={field.label}
      placeholder={field.placeholder || `请输入${field.label}`}
      value={value ?? ''}
      onChange={handleChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      min={field.min}
      max={field.max}
      step={field.step || 1}
      className={field.className}
    />
  );
};

context.wpm.export('comp_field_number', NumberField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_radio" title="单选框组字段渲染器">
const {
  React,
  NextUI
} = context;

const { RadioGroup, Radio } = NextUI;

const RadioField = ({ field, value, onChange, error }) => {
  return (
    <RadioGroup
      label={field.label}
      value={value}
      onValueChange={onChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      orientation={field.direction || "horizontal"}
      className={field.className}
    >
      {field.options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
};

context.wpm.export('comp_field_radio', RadioField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_select" title="下拉选择字段渲染器">
const {
  React,
  NextUI
} = context;

const { Select, SelectItem } = NextUI;

const SelectField = ({ field, value, onChange, error }) => {
  const selectedKeys = React.useMemo(() => {
    if (!value) return new Set();
    if (field.multiple) {
      return new Set(Array.isArray(value) ? value : [value]);
    }
    return new Set([value]);
  }, [value, field.multiple]);

  const handleSelectionChange = (keys) => {
    const selectedValues = Array.from(keys);
    if (field.multiple) {
      onChange(selectedValues);
    } else {
      onChange(selectedValues[0]);
    }
  };

  return (
    <Select
      label={field.label}
      placeholder={field.placeholder || `请选择${field.label}`}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      className={field.className}
      selectionMode={field.multiple ? "multiple" : "single"}
    >
      {field.options.map((option) => (
        <SelectItem
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
        >
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

context.wpm.export('comp_field_select', SelectField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_switch" title="开关字段渲染器">
const {
  React,
  NextUI
} = context;

const { Switch } = NextUI;

const SwitchField = ({ field, value, onChange, error }) => {
  return (
    <Switch
      isSelected={!!value}
      onValueChange={onChange}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      className={field.className}
    >
      {field.label}
      {(field.checkedLabel || field.uncheckedLabel) && (
        <span className="text-small text-default-500">
          {value ? field.checkedLabel : field.uncheckedLabel}
        </span>
      )}
    </Switch>
  );
};

context.wpm.export('comp_field_switch', SwitchField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_text" title="文本字段渲染器">
const {
  React,
  NextUI,
  Icon
} = context;

const { Input } = NextUI;

const TextField = ({ field, value, onChange, error }) => {
  return (
    <Input
      type="text"
      label={field.label}
      placeholder={field.placeholder || `请输入${field.label}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      maxLength={field.maxLength}
      minLength={field.minLength}
      pattern={field.pattern}
      className={field.className}
      startContent={
        field.icon && (
          <Icon
            icon={field.icon}
            className="text-default-400 pointer-events-none flex-shrink-0"
            width={20}
          />
        )
      }
    />
  );
};

context.wpm.export('comp_field_text', TextField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_field_textarea" title="多行文本字段渲染器">
const {
  React,
  NextUI
} = context;

const { Textarea } = NextUI;

const TextareaField = ({ field, value, onChange, error }) => {
  return (
    <Textarea
      label={field.label}
      placeholder={field.placeholder || `请输入${field.label}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      isRequired={field.required}
      isDisabled={field.disabled}
      isReadOnly={field.readOnly}
      isInvalid={!!error}
      errorMessage={error}
      description={field.description}
      maxLength={field.maxLength}
      minLength={field.minLength}
      minRows={field.minRows || 3}
      maxRows={field.maxRows || 5}
      className={field.className}
    />
  );
};

context.wpm.export('comp_field_textarea', TextareaField);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_form_list" title="表单列表组件">
const {
    wpm,
    React,
    observer,
    NextUI,
    Icon,
    message,
    api,
    cn
} = context;

const { Button, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Tooltip, Chip, Card, CardBody } = NextUI;

// 导入表单配置
const formConfig = await context.wpm.import('module_form_config');

const FormList = observer(({
    loading,
    formItems,
    onView,
    onEdit,
    onShare,
    onDelete,
    onCreate,
    onAICreate
}) => {
    const [copyTooltip, setCopyTooltip] = React.useState("点击复制链接");
    const [filterStatus, setFilterStatus] = React.useState(null);
    const [filterConfirmType, setFilterConfirmType] = React.useState(null);

    // 计算统计数据
    const stats = React.useMemo(() => {
        if (!Array.isArray(formItems)) return { pending: 0, completed: 0 };

        return formItems.reduce((acc, item) => {
            if (item.confirmStatus === 'completed') {
                acc.completed += 1;
            } else {
                acc.pending += 1;
            }
            return acc;
        }, { pending: 0, completed: 0 });
    }, [formItems]);

    // 计算确认状态统计
    const confirmStats = React.useMemo(() => {
        if (!Array.isArray(formItems) || !formConfig?.confirm?.forms) {
            return [];
        }

        // 初始化统计对象
        const stats = formConfig.confirm.forms.map(form => ({
            id: form.id,
            title: form.title,
            confirmed: 0,
            cancelled: 0,
            pending: 0
        }));

        // 统计每个表单的确认状态
        formItems.forEach(form => {
            if (Array.isArray(form.confirms)) {
                form.confirms.forEach((confirm, index) => {
                    if (index < stats.length) {
                        if (confirm.status === 'confirmed') {
                            stats[index].confirmed++;
                        } else if (confirm.status === 'cancelled') {
                            stats[index].cancelled++;
                        } else {
                            stats[index].pending++;
                        }
                    }
                });
            }
        });

        api.log.info('确认状态统计数据', { stats });
        return stats;
    }, [formItems]);

    // 处理筛选点击
    const handleFilterClick = (status) => {
        api.log.info('切换表单筛选状态', {
            previousStatus: filterStatus,
            newStatus: status === filterStatus ? null : status
        });

        setFilterStatus(status === filterStatus ? null : status);
        setFilterConfirmType(null); // 清除确认类型筛选
    };

    // 处理确认类型筛选点击
    const handleConfirmTypeClick = (confirmId, status) => {
        api.log.info('切换确认类型筛选', {
            confirmId,
            status,
            previousFilter: filterConfirmType
        });

        const newFilter = filterConfirmType?.confirmId === confirmId &&
                         filterConfirmType?.status === status ? null : { confirmId, status };

        setFilterConfirmType(newFilter);
        setFilterStatus(null); // 清除状态筛选
    };

    // 过滤表单数据
    const filteredForms = React.useMemo(() => {
        if (!Array.isArray(formItems)) return formItems;

        let filtered = formItems;

        // 按整体状态筛选
        if (filterStatus) {
            filtered = filtered.filter(item => item.confirmStatus === filterStatus);
        }

        // 按确认类型筛选
        if (filterConfirmType) {
            const { confirmId, status } = filterConfirmType;
            const formIndex = formConfig.confirm.forms.findIndex(f => f.id === confirmId);

            filtered = filtered.filter(item =>
                item.confirms?.[formIndex]?.status === status
            );
        }

        return filtered;
    }, [formItems, filterStatus, filterConfirmType]);

    // 渲染确认状态
    const renderConfirmStatus = (item) => {
        if (!item) return null;

        switch (item.confirmStatus) {
            case 'completed':
                return (
                    <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Icon icon="solar:check-circle-bold" className="text-success" />}
                    >
                        已完成
                    </Chip>
                );
            case 'pending':
                return (
                    <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<Icon icon="solar:clock-circle-bold" className="text-warning" />}
                    >
                        待确认
                    </Chip>
                );
            default:
                return (
                    <Chip
                        size="sm"
                        color="default"
                        variant="flat"
                        startContent={<Icon icon="solar:question-circle-bold" />}
                    >
                        未知状态
                    </Chip>
                );
        }
    };

    // 渲染统计卡片
    const renderStatsCards = () => (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <Card
                className={cn(
                    "bg-warning-50 cursor-pointer transition-transform hover:scale-[1.02]",
                    filterStatus === 'pending' && "ring-2 ring-warning"
                )}
                isPressable
                onPress={() => handleFilterClick('pending')}
            >
                <CardBody className="flex flex-row items-center justify-between p-4">
                    <div>
                        <p className="text-warning-600 text-small font-medium">待确认</p>
                        <p className="text-warning-600 text-2xl font-bold mt-1">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                        <Icon icon="solar:clock-circle-bold" className="text-warning w-6 h-6" />
                    </div>
                </CardBody>
            </Card>

            <Card
                className={cn(
                    "bg-success-50 cursor-pointer transition-transform hover:scale-[1.02]",
                    filterStatus === 'completed' && "ring-2 ring-success"
                )}
                isPressable
                onPress={() => handleFilterClick('completed')}
            >
                <CardBody className="flex flex-row items-center justify-between p-4">
                    <div>
                        <p className="text-success-600 text-small font-medium">已完成</p>
                        <p className="text-success-600 text-2xl font-bold mt-1">{stats.completed}</p>
                    </div>
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        <Icon icon="solar:check-circle-bold" className="text-success w-6 h-6" />
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    // 渲染确认状态统计卡片
    const renderConfirmStatsCards = () => (
        <div className="grid grid-cols-5 gap-4 mb-6">
            {confirmStats.map((stat) => (
                <Card key={stat.id} className="bg-default-50">
                    <CardBody className="p-4">
                        <h4 className="text-small font-medium mb-2">{stat.title}</h4>
                        <div className="flex flex-wrap gap-2">
                            <Chip
                                size="sm"
                                variant={filterConfirmType?.confirmId === stat.id && filterConfirmType?.status === 'confirmed' ? 'solid' : 'flat'}
                                color="success"
                                className="cursor-pointer"
                                onClick={() => handleConfirmTypeClick(stat.id, 'confirmed')}
                            >
                                已确认 ({stat.confirmed})
                            </Chip>
                            <Chip
                                size="sm"
                                variant={filterConfirmType?.confirmId === stat.id && filterConfirmType?.status === 'cancelled' ? 'solid' : 'flat'}
                                color="danger"
                                className="cursor-pointer"
                                onClick={() => handleConfirmTypeClick(stat.id, 'cancelled')}
                            >
                                已取消 ({stat.cancelled})
                            </Chip>
                            <Chip
                                size="sm"
                                variant={filterConfirmType?.confirmId === stat.id && filterConfirmType?.status === 'pending' ? 'solid' : 'flat'}
                                color="warning"
                                className="cursor-pointer"
                                onClick={() => handleConfirmTypeClick(stat.id, 'pending')}
                            >
                                待确认 ({stat.pending})
                            </Chip>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {formConfig.appConfig?.title || "我的表单"}
                    </h1>
                    <p className="mt-1 text-small text-foreground-500">
                        {formConfig.appConfig?.description || "管理您创建的所有表单"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="primary"
                        variant="shadow"
                        startContent={<Icon icon="solar:magic-stick-bold" />}
                        onPress={onAICreate}
                    >
                        AI 开单
                    </Button>
                    <Button
                        color="primary"
                        variant="shadow"
                        startContent={<Icon icon="solar:add-circle-bold" />}
                        isLoading={loading}
                        onPress={onCreate}
                    >
                        创建新表单
                    </Button>
                </div>
            </div>

            {/* 统计卡片 */}
            {renderStatsCards()}

            {/* 确认状态统计卡片 */}
            {renderConfirmStatsCards()}

            <Table
                aria-label="表单列表"
                isHeaderSticky
                classNames={{
                    wrapper: "bg-background/60",
                    th: "bg-background/70 text-default-500",
                    td: "py-3"
                }}
                selectionMode="none"
            >
                <TableHeader>
                    <TableColumn key="formName">表单名称</TableColumn>
                    <TableColumn key="description">描述</TableColumn>
                    <TableColumn key="confirmStatus">确认状态</TableColumn>
                    <TableColumn key="createdAt">创建时间</TableColumn>
                    <TableColumn key="updatedAt">更新时间</TableColumn>
                    <TableColumn key="actions" align="center">操作</TableColumn>
                </TableHeader>
                <TableBody
                    items={filteredForms}
                    emptyContent={
                        <div className="text-center py-6">
                            <Icon
                                icon="solar:clipboard-bold"
                                className="mx-auto mb-2 h-8 w-8 text-default-400"
                            />
                            <p>暂无表单数据</p>
                            <p className="text-small text-default-400 mt-1">
                                {filterStatus || filterConfirmType ? "没有符合筛选条件的表单" : "点击`创建新表单`按钮创建您的第一个表单"}
                            </p>
                        </div>
                    }
                    isLoading={loading}
                >
                    {(item) => (
                        <TableRow key={item.formId}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Icon
                                        icon="solar:clipboard-bold"
                                        className="text-primary"
                                        width={20}
                                    />
                                    <span className="font-medium">{item.formName}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-default-500">
                                    {item.description || '-'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {renderConfirmStatus(item)}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <span className="text-tiny text-default-400">
                                        {new Date(item.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                                    <span className="text-tiny text-default-400">
                                        {new Date(item.updatedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => onView(item)}
                                    >
                                        <Icon icon="solar:eye-bold" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => onEdit(item.formId)}
                                    >
                                        <Icon icon="solar:pen-bold" />
                                    </Button>
                                    <Tooltip
                                        content={copyTooltip}
                                        placement="top"
                                        closeDelay={2000}
                                    >
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => onShare(item.formId)}
                                        >
                                            <Icon icon="solar:share-bold" />
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        variant="light"
                                        onPress={() => onDelete(item)}
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

context.wpm.export('comp_form_list', FormList);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_print_preview_modal" title="打印预览模态框组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } = NextUI;
const DynamicFormPrint = await context.wpm.import('comp_dynamic_form_print');

const PrintPreviewModal = observer(({
  isOpen,
  onOpenChange,
  selectedForm,
  printRef,
  onPrint
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h3 className="text-xl font-semibold">打印预览</h3>
            </ModalHeader>
            <ModalBody>
              <div className="border rounded-lg">
                <div ref={printRef}>
                  <DynamicFormPrint form={selectedForm} />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                startContent={<Icon icon="solar:printer-bold" />}
                onPress={onPrint}
              >
                打印
              </Button>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
              >
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_print_preview_modal', PrintPreviewModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_view_form_modal" title="查看表单模态框组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } = NextUI;
const DynamicFormAdapter = await context.wpm.import('comp_dynamic_form_adapter');

const ViewFormModal = observer(({
  isOpen,
  onOpenChange,
  selectedForm,
  formConfig,
  onPrint
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">查看表单</h3>
            </ModalHeader>
            <ModalBody>
              {formConfig && (
                <DynamicFormAdapter
                  config={formConfig}
                  formId={selectedForm?.id}
                  readOnly={true}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="light"
                startContent={<Icon icon="solar:printer-bold" />}
                onPress={() => {
                  onClose();
                  onPrint();
                }}
              >
                打印预览
              </Button>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
              >
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_view_form_modal', ViewFormModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_ai_config" title="AI配置">
const aiConfig = {
  title: "AI 智能创建表单",
  description: "通过 AI 智能分析您的需求，快速创建表单",
  placeholder: "请详细描述您需要的表单，包括表单类型、字段、用途等...",
  example: {
    title: "示例：销售部张三前往深圳参加客户会议的差旅费报销。",
    details: [
      "出差时间为本月15-17日，往返深圳总计3天",
      "包含往返机票(约2000元)、住宿费(800元/晚)和日常补助",
      "期间产生市内交通费约300元，餐饮费用已包含在补助中"
    ]
  },
  buttons: {
    cancel: "取消",
    generate: "生成表单",
    back: "返回编辑",
    create: "确认创建",
    preview: {
      prev: "上一个",
      next: "下一个"
    }
  },
  messages: {
    emptyInput: "请输入表单描述",
    generateSuccess: "生成表单成功",
    generateError: "生成表单失败",
    createSuccess: "创建表单成功",
    createError: "创建失败",
    invalidConfig: "表单配置数据不完整，请重新生成"
  }
};

context.wpm.export('module_ai_config', aiConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_app_config" title="应用配置">
const appConfig = {
  title: "我的差旅费报销单",
  description: "管理您创建的所有差旅费报销单",
  version: "1.0.0"
};

context.wpm.export('module_app_config', appConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_form_attachments_config" title="附件配置">
const attachmentsConfig = {
  title: "附件信息",
  description: "上传相关的发票、图片、小票收据等",
  maxSize: 10 * 1024 * 1024, // 10MB
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf']
  },
  maxCount: 10,
  types: [
    {
      key: 'invoice',
      label: '发票',
      icon: 'solar:bill-list-bold',
      accept: ['image/*', 'application/pdf']
    },
    {
      key: 'receipt',
      label: '收据',
      icon: 'solar:bill-list-bold',
      accept: ['image/*', 'application/pdf']
    },
    {
      key: 'other',
      label: '其他附件',
      icon: 'solar:document-bold',
      accept: ['image/*', 'application/pdf']
    }
  ]
};

context.wpm.export('module_form_attachments_config', attachmentsConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_form_basic_config" title="基本信息配置">
const basicConfig = {
  fields: [
    {
      name: "department",
      label: "报销部门",
      type: "select",
      required: true,
      placeholder: "请选择报销部门",
      icon: "solar:building-bold",
      help: "选择申请报销的部门",
      options: [
        { value: "sales", label: "销售部" },
        { value: "rd", label: "研发部" },
        { value: "marketing", label: "市场部" },
        { value: "finance", label: "财务部" },
        { value: "hr", label: "人力资源部" },
        { value: "admin", label: "行政部" }
      ],
      validate: (value) => {
        if (!value) return "请选择报销部门";
      }
    },
    {
      name: "applicant",
      label: "出差人",
      type: "text",
      required: true,
      placeholder: "请输入出差人姓名",
      icon: "solar:user-bold",
      help: "填写实际出差人员姓名",
      validate: (value) => {
        if (!value) return "请输入出差人姓名";
        if (value.length > 20) return "姓名不能超过20个字符";
      }
    },
    {
      name: "reason",
      label: "出差事由",
      type: "textarea",
      required: true,
      placeholder: "请输入出差事由",
      span: "full",
      minRows: 2,
      maxRows: 4,
      icon: "solar:notebook-bold",
      help: "详细说明出差的目的和原因",
      validate: (value) => {
        if (!value) return "请输入出差事由";
        if (value.length > 500) return "出差事由不能超过500个字符";
      }
    },
    {
      name: "budget",
      label: "预算金额",
      type: "money",
      required: true,
      placeholder: "请输入预算金额",
      icon: "solar:wallet-money-bold",
      help: "预计此次出差的总费用",
      validate: (value) => {
        if (!value) return "请输入预算金额";
        if (value < 0) return "预算金额不能为负数";
        if (value > 100000) return "预算金额不能超过100000元";
      }
    },
    {
      name: "startDate",
      label: "开始日期",
      type: "date",
      required: true,
      placeholder: "请选择开始日期",
      icon: "solar:calendar-bold",
      help: "出差开始的日期",
      validate: (value) => {
        if (!value) return "请选择开始日期";
      }
    },
    {
      name: "endDate",
      label: "结束日期",
      type: "date",
      required: true,
      placeholder: "请选择结束日期",
      icon: "solar:calendar-bold",
      help: "出差结束的日期",
      validate: (value, formData) => {
        if (!value) return "请选择结束日期";
        if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          return "结束日期不能早于开始日期";
        }
      }
    },
    {
      name: "paymentMethod",
      label: "付款方式",
      type: "radio",
      required: true,
      icon: "solar:card-bold",
      help: "选择报销款项的支付方式",
      options: [
        { value: "bank", label: "银行转账" },
        { value: "cash", label: "现金支付" },
        { value: "other", label: "其他方式" }
      ],
      validate: (value) => {
        if (!value) return "请选择付款方式";
      }
    },
    {
      name: "urgent",
      label: "加急处理",
      type: "switch",
      icon: "solar:alarm-bold",
      help: "是否需要加急处理报销",
      checkedLabel: "是",
      uncheckedLabel: "否"
    }
  ]
};

context.wpm.export('module_form_basic_config', basicConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_form_config" title="表单配置">
const {
  wpm,
  api
} = context;

// 导入所有子配置
const appConfig = await wpm.import('module_app_config');
const aiConfig = await wpm.import('module_ai_config');
const basicConfig = await wpm.import('module_form_basic_config');
const detailConfig = await wpm.import('module_form_detail_config');
const attachmentsConfig = await wpm.import('module_form_attachments_config');
const confirmConfig = await wpm.import('module_form_confirm_config');

// 整合所有配置
const formConfig = {
  // 应用级配置
  appConfig,

  // AI 配置
  aiConfig,

  // 表单标题和描述
  title: "差旅费报销单",
  description: "用于报销差旅费用",
  type: "travel_expense",
  version: "1.0.0",

  // 新增：验证配置
  validation: {
    enabled: false,  // 默认启用验证
    mode: 'strict'  // 默认使用严格模式
  },

  // 各模块配置
  basic: basicConfig,
  detail: detailConfig,
  attachments: attachmentsConfig,
  confirm: confirmConfig
};

// 记录配置加载日志
api.log.info('表单配置加载完成', {
  configVersion: formConfig.version,
  validation: formConfig.validation,
  modules: {
    hasBasic: !!formConfig.basic,
    hasDetail: !!formConfig.detail,
    hasAttachments: !!formConfig.attachments,
    hasConfirm: !!formConfig.confirm
  }
});

context.wpm.export('module_form_config', formConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_form_confirm_config" title="确认信息配置">
const confirmConfig = {
  title: "审批确认",
  forms: [
    {
      id: "applicant_confirm",
      title: "报销人确认",
      required: true,
      fields: [
        {
          name: "name",
          label: "报销人",
          type: "text",
          required: true,
          icon: "solar:user-bold",
          validate: (value) => {
            if (!value) return "请输入报销人姓名";
          }
        },
        {
          name: "date",
          label: "报销日期",
          type: "date",
          required: true,
          icon: "solar:calendar-bold",
          validate: (value) => {
            if (!value) return "请选择报销日期";
          }
        },
        {
          name: "note",
          label: "备注说明",
          type: "textarea",
          icon: "solar:notebook-bold"
        }
      ]
    },
    {
      id: "manager_confirm",
      title: "部门主管确认",
      required: true,
      fields: [
        {
          name: "name",
          label: "主管姓名",
          type: "text",
          required: true,
          icon: "solar:user-bold",
          validate: (value) => {
            if (!value) return "请输入主管姓名";
          }
        },
        {
          name: "date",
          label: "审批日期",
          type: "date",
          required: true,
          icon: "solar:calendar-bold",
          validate: (value) => {
            if (!value) return "请选择审批日期";
          }
        },
        {
          name: "note",
          label: "审批意见",
          type: "textarea",
          icon: "solar:notebook-bold"
        }
      ]
    },
    {
      id: "finance_confirm",
      title: "财务确认",
      required: true,
      fields: [
        {
          name: "name",
          label: "财务姓名",
          type: "text",
          required: true,
          icon: "solar:user-bold",
          validate: (value) => {
            if (!value) return "请输入财务姓名";
          }
        },
        {
          name: "date",
          label: "审核日期",
          type: "date",
          required: true,
          icon: "solar:calendar-bold",
          validate: (value) => {
            if (!value) return "请选择审核日期";
          }
        },
        {
          name: "note",
          label: "审核意见",
          type: "textarea",
          icon: "solar:notebook-bold"
        }
      ]
    },
    {
      id: "accountant_confirm",
      title: "会计确认",
      required: true,
      fields: [
        {
          name: "name",
          label: "会计姓名",
          type: "text",
          required: true,
          icon: "solar:user-bold",
          validate: (value) => {
            if (!value) return "请输入会计姓名";
          }
        },
        {
          name: "date",
          label: "审核日期",
          type: "date",
          required: true,
          icon: "solar:calendar-bold",
          validate: (value) => {
            if (!value) return "请选择审核日期";
          }
        },
        {
          name: "note",
          label: "审核意见",
          type: "textarea",
          icon: "solar:notebook-bold"
        }
      ]
    },
    {
      id: "cashier_confirm",
      title: "出纳确认",
      required: true,
      fields: [
        {
          name: "name",
          label: "出纳姓名",
          type: "text",
          required: true,
          icon: "solar:user-bold",
          validate: (value) => {
            if (!value) return "请输入出纳姓名";
          }
        },
        {
          name: "date",
          label: "付款日期",
          type: "date",
          icon: "solar:calendar-bold",
          validate: (value) => {
            if (!value) return "请选择付款日期";
          }
        },
        {
          name: "note",
          label: "付款备注",
          type: "textarea",
          icon: "solar:notebook-bold"
        }
      ]
    }
  ]
};

context.wpm.export('module_form_confirm_config', confirmConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_form_detail_config" title="明细信息配置">
const detailConfig = {
  title: "行程明细",
  columns: [
    {
      key: "startMonth",
      label: "出发月",
      type: "number",
      required: true,
      min: 1,
      max: 12
    },
    {
      key: "startDay",
      label: "出发日",
      type: "number",
      required: true,
      min: 1,
      max: 31
    },
    {
      key: "startLocation",
      label: "出发地点",
      type: "text",
      required: true
    },
    {
      key: "endMonth",
      label: "到达月",
      type: "number",
      required: true,
      min: 1,
      max: 12
    },
    {
      key: "endDay",
      label: "到达日",
      type: "number",
      required: true,
      min: 1,
      max: 31
    },
    {
      key: "endLocation",
      label: "到达地点",
      type: "text",
      required: true
    },
    {
      key: "personCount",
      label: "人数",
      type: "number",
      required: true,
      min: 1
    },
    {
      key: "transport",
      label: "交通工具",
      type: "select",
      required: true,
      options: [
        { value: "plane", label: "飞机" },
        { value: "train", label: "火车" },
        { value: "bus", label: "汽车" },
        { value: "other", label: "其他" }
      ]
    },
    {
      key: "transportFee",
      label: "交通费用",
      type: "money",
      required: true,
      format: "currency"
    },
    {
      key: "days",
      label: "天数",
      type: "number",
      required: true,
      min: 1
    },
    {
      key: "allowanceStandard",
      label: "补助标准",
      type: "money",
      required: true,
      format: "currency"
    },
    {
      key: "allowanceAmount",
      label: "补助金额",
      type: "money",
      required: true,
      format: "currency"
    },
    {
      key: "hotelFee",
      label: "住宿费用",
      type: "money",
      required: true,
      format: "currency"
    },
    {
      key: "localTransportFee",
      label: "市内交通费",
      type: "money",
      required: true,
      format: "currency"
    },
    {
      key: "otherFee",
      label: "其他费用",
      type: "money",
      format: "currency"
    }
  ]
};

context.wpm.export('module_form_detail_config', detailConfig);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_form_detail" title="表单详情页">
const {
  wpm,
  React,
  observer,
  NextUI,
  ReactRouterDom,
  Icon,
  message,
  api
} = context;

const { useParams, useNavigate, useLocation } = ReactRouterDom;
const { Button, Spinner } = NextUI;

const DynamicFormAdapter = await context.wpm.import('comp_dynamic_form_adapter');
const dynamicFormStore = await context.wpm.import('store_dynamic_form');
const formConfig = await context.wpm.import('module_form_config');

const FormDetailPage = observer(() => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const readOnly = location.state?.readOnly ?? false;

  // 设置只读状态
  React.useEffect(() => {
    dynamicFormStore.setReadOnly(readOnly);

    api.log.info('初始化表单只读状态', {
      formId,
      readOnly,
      fromLocation: !!location.state?.readOnly
    });
  }, [location.state]);

  React.useEffect(() => {
    loadFormData();
  }, [formId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const success = await dynamicFormStore.loadFormData(formId);
      if (!success) {
        message.error('表单不存在或已被删除');
        navigate('/home');
      }
    } catch (error) {
      message.error('加载表单失败: ' + error.message);
      api.log.error('加载表单失败', { error, formId });
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = () => {
    api.log.info('表单保存成功', { formId });
  };

  const handleFormError = (error) => {
    message.error("表单操作失败");
    api.log.error('表单操作失败', { error, formId });
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="light"
            startContent={<Icon icon="solar:arrow-left-bold" />}
            onPress={handleBack}
          >
            返回首页
          </Button>
          <h1 className="text-xl font-bold">
            {readOnly ? '查看' : '编辑'}{formConfig.title}
          </h1>
          <div className="w-[88px]" />
        </div>

        <DynamicFormAdapter
          formId={formId}
          config={formConfig}
          onSave={handleFormSave}
          onError={handleFormError}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
});

context.wpm.export('page_form_detail', FormDetailPage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_home" title="首页">
const {
  wpm,
  React,
  observer,
  NextUI,
  ReactRouterDom,
  Icon,
  message,
  api,
  esm
} = context;

const { useDisclosure } = NextUI;

const { useNavigate } = ReactRouterDom;
const { Card } = NextUI;

// 导入组件
const FormList = await context.wpm.import('comp_form_list');
const DeleteConfirmModal = await context.wpm.import('comp_delete_confirm_modal');
const ViewFormModal = await context.wpm.import('comp_view_form_modal');
const PrintPreviewModal = await context.wpm.import('comp_print_preview_modal');
const AICreateModal = await context.wpm.import('comp_ai_create_modal');

const dynamicFormStore = await context.wpm.import('store_dynamic_form');
const formConfig = await context.wpm.import('module_form_config');

// 导入 ReactToPrint
const { useReactToPrint } = await context.ReactToPrint;

const HomePage = observer(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [selectedForm, setSelectedForm] = React.useState(null);
  const [previewForms, setPreviewForms] = React.useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = React.useState(0);
  const deleteModal = useDisclosure();
  const viewModal = useDisclosure();
  const printModal = useDisclosure();
  const aiCreateModal = useDisclosure();
  const printRef = React.useRef(null);

  // 确保表单列表数据始终是数组
  const formItems = React.useMemo(() => {
    return Array.isArray(dynamicFormStore.userForms) ? dynamicFormStore.userForms : [];
  }, [dynamicFormStore.userForms]);

  React.useEffect(() => {
    loadUserForms();
  }, []);

  const loadUserForms = async () => {
    try {
      setLoading(true);
      await dynamicFormStore.loadUserForms();
    } catch (error) {
      message.error('加载表单列表失败: ' + error.message);
      api.log.error('加载表单列表失败', { error });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!formConfig) {
      api.log.error('formConfig 未正确加载');
      message.error('系统配置加载失败，请刷新重试');
      return;
    }

    try {
      setLoading(true);
      const formId = await dynamicFormStore.createNewForm(formConfig);
      message.success('创建表单成功');
      navigate(`/form/${formId}`);
    } catch (error) {
      message.error('创建表单失败: ' + error.message);
      api.log.error('创建表单失败', { error });
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = async (form) => {
    try {
      setLoading(true);
      const success = await dynamicFormStore.loadFormData(form.formId);
      if (success) {
        setSelectedForm(dynamicFormStore.currentForm);
        viewModal.onOpen();
      } else {
        message.error('表单不存在或已被删除');
      }
    } catch (error) {
      message.error('加载表单失败: ' + error.message);
      api.log.error('加载表单失败', { error, formId: form.formId });
    } finally {
      setLoading(false);
    }
  };

  const handleEditForm = (formId) => {
    navigate(`/form/${formId}`);
  };

  const handleShareForm = async (formId) => {
    try {
      const formUrl = `${window.location.origin}/app-run/${context.appId}/form/${formId}`;
      await navigator.clipboard.writeText(formUrl);
      message.success('表单链接已复制到剪贴板');
      api.log.info('分享表单', { formId, url: formUrl });
    } catch (error) {
      message.error('复制链接失败，请重试');
      api.log.error('复制表单链接失败', { error, formId });
    }
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;

    try {
      setLoading(true);
      await dynamicFormStore.deleteForm(selectedForm.formId);
      message.success('删除表单成功');
      deleteModal.onClose();
      await loadUserForms();
    } catch (error) {
      message.error('删除表单失败: ' + error.message);
      api.log.error('删除表单失败', { error, formId: selectedForm.formId });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${selectedForm?.config?.title || '表单'}_${selectedForm?.id || ''}`,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      message.error('打印失败，请重试');
    }
  });

  const handleAICreateForm = async (formData) => {
    try {
      setLoading(true);

      // 使用 AI 生成的数据创建表单
      const formId = await dynamicFormStore.createNewForm(formData.config);

      // 初始化表单数据
      await dynamicFormStore.loadFormData(formId);

      // 更新基础数据
      dynamicFormStore.updateBasicData(formData.basic);

      // 添加明细数据
      formData.detail.forEach(item => {
        dynamicFormStore.addDetailItem(item);
      });

      // 保存表单
      await dynamicFormStore.saveFormData();

      message.success('创建表单成功');
      navigate(`/form/${formId}`);

      // 关闭模态框并重置状态
      aiCreateModal.onClose();
      setPreviewForms([]);
      setCurrentPreviewIndex(0);

    } catch (error) {
      message.error('创建表单失败: ' + error.message);
      api.log.error('创建 AI 生成表单失败', { error });
    } finally {
      setLoading(false);
    }
  };

  // 检查 formConfig 是否正确加载
  if (!formConfig) {
    api.log.error('formConfig 未加载');
    return (
      <div className="min-h-screen bg-gradient-to-tr from-pink-300 to-blue-300 p-6">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-background/60 backdrop-blur-md p-6">
            <div className="text-center">
              <Icon icon="solar:shield-warning-bold" className="w-12 h-12 mx-auto mb-4 text-danger" />
              <h2 className="text-xl font-bold mb-2">配置加载失败</h2>
              <p className="text-default-500 mb-4">系统配置未能正确加载，请刷新页面重试</p>
              <Button
                color="primary"
                onPress={() => window.location.reload()}
              >
                刷新页面
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-300 to-blue-300 p-6">
      <div className="mx-auto max-w-6xl">
        <Card className="bg-background/60 backdrop-blur-md">
          <FormList
            loading={loading}
            formItems={formItems}
            onView={handleViewForm}
            onEdit={handleEditForm}
            onShare={handleShareForm}
            onDelete={(form) => {
              setSelectedForm(form);
              deleteModal.onOpen();
            }}
            onCreate={handleCreateForm}
            onAICreate={aiCreateModal.onOpen}
          />
        </Card>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        selectedForm={selectedForm}
        loading={loading}
        onConfirm={handleDeleteForm}
      />

      <ViewFormModal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        selectedForm={selectedForm}
        formConfig={formConfig}
        onPrint={() => {
          viewModal.onClose();
          printModal.onOpen();
        }}
      />

      <PrintPreviewModal
        isOpen={printModal.isOpen}
        onOpenChange={printModal.onOpenChange}
        selectedForm={selectedForm}
        printRef={printRef}
        onPrint={handlePrint}
      />

      <AICreateModal
        isOpen={aiCreateModal.isOpen}
        onOpenChange={aiCreateModal.onOpenChange}
        loading={loading}
        previewForms={previewForms}
        currentPreviewIndex={currentPreviewIndex}
        printRef={printRef}
        onPrint={handlePrint}
        onCreateForm={handleAICreateForm}
        onPreviewChange={setCurrentPreviewIndex}
      />
    </div>
  );
});

context.wpm.export('page_home', HomePage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_dynamic_form" title="动态表单数据管理">
const {
  wpm,
  mobx,
  api,
  appId
} = context;

const { makeAutoObservable, runInAction } = mobx;

// 导入拆分后的子 store
const formListStore = await context.wpm.import('store_form_list');
const formIndexStore = await context.wpm.import('store_form_index');
const formBasicStore = await context.wpm.import('store_form_basic');
const formDetailStore = await context.wpm.import('store_form_detail');
const formConfirmStore = await context.wpm.import('store_form_confirm');

class DynamicFormStore {
  // 私有状态
  _formData = null;
  _isLoading = false;
  _error = null;
  _attachments = [];
  _readOnly = false;

  // 不可变配置
  formPrefix = `${appId}_form`;

  constructor() {
    makeAutoObservable(this, {
      formPrefix: false
    });
  }

  // 计算属性
  get readOnly() {
    return this._readOnly;
  }

  // Action: 设置只读状态
  setReadOnly(value) {
    api.log.info('设置表单只读状态', {
      formId: this.formId,
      readOnly: value
    });
    this._readOnly = value;
  }

  // 计算属性
  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get hasData() {
    return !!this._formData;
  }

  get formId() {
    return this._formData?.id;
  }

  get currentForm() {
    return this._formData ? {
      ...this._formData,
      basic: formBasicStore.basicData,
      detail: formDetailStore.detailData,
      confirms: formConfirmStore.confirmData,
      attachments: this._attachments
    } : null;
  }

  get attachments() {
    return this._attachments;
  }

  get attachmentsCount() {
    return this._attachments.length;
  }

  // 代理计算属性
  get detailData() {
    return formDetailStore.detailData;
  }

  get totalAmount() {
    return formDetailStore.totalAmount;
  }

  get detailCount() {
    return formDetailStore.detailCount;
  }

  get userForms() {
    return formListStore.userForms;
  }

  get userFormsLoading() {
    return formListStore.userFormsLoading;
  }

  // 计算确认状态
  getConfirmStatus() {
    const confirms = formConfirmStore.confirmData;

    // 如果没有确认信息，返回 pending
    if (!confirms || confirms.length === 0) {
      api.log.info('表单确认状态计算 - 无确认信息', {
        formId: this.formId,
        status: 'pending'
      });
      return 'pending';
    }

    // 检查是否所有确认都已完成
    const allConfirmed = confirms.every(form => form?.status === 'confirmed');
    const status = allConfirmed ? 'completed' : 'pending';

    api.log.info('表单确认状态计算', {
      formId: this.formId,
      status,
      confirmsCount: confirms.length,
      confirmedCount: formConfirmStore.confirmedCount,
      cancelledCount: formConfirmStore.cancelledCount,
      pendingCount: formConfirmStore.pendingCount
    });

    return status;
  }

  // 加载用户表单列表
  async loadUserForms() {
    try {
      api.log.info('开始加载用户表单列表');
      await formListStore.loadUserForms();
      api.log.info('加载用户表单列表成功');
    } catch (error) {
      api.log.error('加载用户表单列表失败', { error });
      throw error;
    }
  }

  // 初始化新表单
  initNewForm(config) {
    if (!config) {
      throw new Error('初始化新表单时 config 不能为空');
    }

    // 根据配置初始化确认信息
    const confirms = config.confirm.forms.map(form => ({
      title: form.title,
      status: 'pending',
      updatedAt: new Date().toISOString()
    }));

    api.log.info('初始化新表单', {
      confirmFormsCount: confirms.length,
      confirmTitles: confirms.map(c => c.title)
    });

    runInAction(() => {
      this._formData = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        confirmStatus: 'pending'
      };
      this._attachments = [];
    });

    formBasicStore.initBasicData({});
    formDetailStore.initDetailData([]);
    formConfirmStore.initConfirmData(confirms);
  }

  // 添加附件
  async addAttachment(attachment) {
    this._attachments.push(attachment);
  }

  // 删除附件
  async removeAttachment(attachmentId) {
    const index = this._attachments.findIndex(a => a.id === attachmentId);
    if (index > -1) {
      this._attachments.splice(index, 1);
    }
  }

  // 创建新表单
  async createNewForm(config) {
    if (!config) {
      throw new Error('创建新表单时 config 不能为空');
    }

    const currentUser = await api.getCurrentAccountInfo();
    if (!currentUser) {
      throw new Error('获取用户信息失败');
    }

    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // 根据配置初始化确认信息
    const confirms = config.confirm.forms.map(form => ({
      title: form.title,
      status: 'pending',
      updatedAt: now
    }));

    const formData = {
      id: formId,
      status: 'active',
      confirmStatus: 'pending',
      confirms, // 添加初始化的确认信息
      createdAt: now,
      updatedAt: now,
      creator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      }
    };

    api.log.info('创建新表单', {
      formId,
      creator: currentUser.name,
      confirmFormsCount: confirms.length,
      confirmTitles: confirms.map(c => c.title)
    });

    try {
      // 保存表单数据
      await api.setMetadata(
        `${this.formPrefix}_${formId}`,
        formData
      );

      // 创建表单索引
      await formIndexStore.createFormIndex({
        ...formData,
        totalAmount: 0,
        confirms: []
      });

      runInAction(() => {
        this._formData = formData;
      });

      // 初始化各个 store
      formBasicStore.initBasicData({});
      formDetailStore.initDetailData([]);
      formConfirmStore.initConfirmData([]);

      api.log.info('创建表单成功', {
        formId,
        creator: currentUser.name,
        confirmStatus: 'pending'
      });

      return formId;
    } catch (error) {
      api.log.error('创建表单失败', { error });
      throw error;
    }
  }

  // 加载表单数据
  async loadFormData(formId) {
    if (!formId) {
      api.log.error('加载表单数据失败：缺少formId');
      return false;
    }

    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await api.getMetadata([`${this.formPrefix}_${formId}`]);

      if (!result?.data?.[0]?.value) {
        throw new Error('未找到表单数据');
      }

      const formData = JSON.parse(result.data[0].value);

      runInAction(() => {
        this._formData = formData;
      });

      // 初始化各个 store
      formBasicStore.initBasicData(formData.basic || {});
      formDetailStore.initDetailData(Array.isArray(formData.detail) ? formData.detail : []);
      formConfirmStore.initConfirmData(Array.isArray(formData.confirms) ? formData.confirms : []);

      api.log.info('加载表单数据成功', {
        formId,
        confirmStatus: formData.confirmStatus
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this._error = error.message || '加载失败';
      });
      api.log.error('加载表单数据失败', { error, formId });
      return false;
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // 保存表单数据
  async saveFormData() {
    if (!this._formData) {
      throw new Error('没有可保存的表单数据');
    }

    const currentUser = await api.getCurrentAccountInfo();
    if (!currentUser) {
      throw new Error('获取用户信息失败');
    }

    const formId = this._formData.id;
    const now = new Date().toISOString();

    // 计算最新的确认状态
    const confirmStatus = this.getConfirmStatus();
    // 获取最新的总金额
    const totalAmount = formDetailStore.totalAmount;

    const formData = {
      ...this._formData,
      basic: formBasicStore.basicData,
      detail: formDetailStore.detailData,
      confirms: formConfirmStore.confirmData,
      attachments: this._attachments,
      confirmStatus,
      totalAmount,
      updatedAt: now,
      operator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        time: now
      }
    };

    try {
      api.log.info('开始保存表单', {
        formId,
        confirmStatus,
        totalAmount,
        detailCount: formDetailStore.detailCount,
        confirmCount: formConfirmStore.confirmData.length
      });

      // 保存表单数据
      await api.setMetadata(
        `${this.formPrefix}_${formId}`,
        formData
      );

      // 更新表单索引
      await formIndexStore.updateFormIndex({
        ...formData,
        totalAmount,
        confirms: formConfirmStore.confirmData
      });

      runInAction(() => {
        this._formData = formData;
      });

      api.log.info('保存表单数据成功', {
        formId,
        confirmStatus,
        totalAmount
      });

      return true;
    } catch (error) {
      api.log.error('保存表单数据失败', { error, formId });
      throw error;
    }
  }

  // 删除表单
  async deleteForm(formId) {
    if (!formId) {
      throw new Error('表单ID不能为空');
    }

    try {
      // 只删除表单索引
      await formIndexStore.deleteFormIndex(formId);

      // 重新加载用户表单列表
      await formListStore.loadUserForms();

      api.log.info('删除表单成功', { formId });
      return true;
    } catch (error) {
      api.log.error('删除表单失败', { error, formId });
      throw error;
    }
  }

  // 清除表单数据
  clearCurrentForm() {
    runInAction(() => {
      this._formData = null;
      this._error = null;
      this._isLoading = false;
      this._attachments = [];
    });

    formBasicStore.clearBasicData();
    formDetailStore.clearDetailData();
    formConfirmStore.clearConfirmData();
  }

  // 代理方法 - 基本信息
  updateBasicField(field, value) {
    formBasicStore.updateBasicField(field, value);
  }

  // 批量更新基本信息
  updateBasicData(data) {
    formBasicStore.updateBasicData(data);
  }

  // 代理方法 - 明细信息
  addDetailItem(item) {
    formDetailStore.addDetailItem(item);
  }

  updateDetailItem(index, item) {
    formDetailStore.updateDetailItem(index, item);
  }

  removeDetailItem(index) {
    formDetailStore.removeDetailItem(index);
  }

  // 代理方法 - 确认信息
  updateConfirmForm(formIndex, confirmInfo) {
    return formConfirmStore.updateConfirmForm(formIndex, confirmInfo);
  }

  updateConfirmField(formIndex, field, value) {
    formConfirmStore.updateConfirmField(formIndex, field, value);
  }
}

const store = new DynamicFormStore();
context.wpm.export('store_dynamic_form', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_form_basic" title="基本信息管理">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class FormBasicStore {
  // 状态
  _basicData = {};

  constructor() {
    makeAutoObservable(this);
  }

  // 计算属性
  get basicData() {
    return this._basicData;
  }

  // 初始化基本信息
  initBasicData(data = {}) {
    this._basicData = { ...data };
  }

  // 更新基本信息字段
  updateBasicField(field, value) {
    this._basicData = {
      ...this._basicData,
      [field]: value
    };
  }

  // 批量更新基本信息
  updateBasicData(data) {
    this._basicData = {
      ...this._basicData,
      ...data
    };
  }

  // 清除基本信息
  clearBasicData() {
    this._basicData = {};
  }
}

const store = new FormBasicStore();
context.wpm.export('store_form_basic', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_form_confirm" title="确认信息管理">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class FormConfirmStore {
  // 状态
  _confirmData = [];

  constructor() {
    makeAutoObservable(this);
  }

  // 计算属性
  get confirmData() {
    return this._confirmData;
  }

  // 获取已确认的表单数量
  get confirmedCount() {
    return this._confirmData.filter(form => form?.status === 'confirmed').length;
  }

  // 获取已取消的表单数量
  get cancelledCount() {
    return this._confirmData.filter(form => form?.status === 'cancelled').length;
  }

  // 获取待确认的表单数量
  get pendingCount() {
    return this._confirmData.filter(form => !form?.status || form.status === 'pending').length;
  }

  // 检查指定索引的表单是否已确认
  isFormConfirmed(index) {
    return this._confirmData[index]?.status === 'confirmed';
  }

  // 检查指定索引的表单是否已取消
  isFormCancelled(index) {
    return this._confirmData[index]?.status === 'cancelled';
  }

  // 初始化确认数据
  initConfirmData(data = []) {
    this._confirmData = [...data];
  }

  // 更新确认表单
  async updateConfirmForm(formIndex, confirmInfo) {
    while (this._confirmData.length <= formIndex) {
      this._confirmData.push({});
    }

    this._confirmData[formIndex] = {
      ...this._confirmData[formIndex],
      ...confirmInfo,
      updatedAt: new Date().toISOString()
    };
  }

  // 更新确认字段
  updateConfirmField(formIndex, field, value) {
    while (this._confirmData.length <= formIndex) {
      this._confirmData.push({});
    }

    this._confirmData[formIndex] = {
      ...this._confirmData[formIndex],
      [field]: value
    };
  }

  // 清除确认数据
  clearConfirmData() {
    this._confirmData = [];
  }
}

const store = new FormConfirmStore();
context.wpm.export('store_form_confirm', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_form_detail" title="明细信息管理">
const {
  wpm,
  mobx,
  api,
  esm
} = context;

const { makeAutoObservable, computed } = mobx;

// 导入 Decimal.js
const Decimal = await import('https://esm.sh/decimal.js@10.4.3').then(m => m.default);

class FormDetailStore {
  // 状态
  _detailData = [];

  constructor() {
    makeAutoObservable(this);
  }

  // 计算属性
  get detailData() {
    return this._detailData;
  }

  get detailCount() {
    return this._detailData.length;
  }

  get totalAmount() {
    return computed(() => {
      try {
        return this._detailData.reduce((sum, item) => {
          // 使用 Decimal 处理所有金额字段
          const transportFee = new Decimal(item.transportFee || 0);
          const allowanceAmount = new Decimal(item.allowanceAmount || 0);
          const hotelFee = new Decimal(item.hotelFee || 0);
          const localTransportFee = new Decimal(item.localTransportFee || 0);
          const otherFee = new Decimal(item.otherFee || 0);

          // 计算该明细项的总金额
          const itemTotal = transportFee
            .plus(allowanceAmount)
            .plus(hotelFee)
            .plus(localTransportFee)
            .plus(otherFee);

          // 累加到总金额
          return sum.plus(itemTotal);
        }, new Decimal(0)).toNumber();
      } catch (error) {
        api.log.error('计算总金额失败', { error });
        return 0;
      }
    }).get();
  }

  // 初始化明细数据
  initDetailData(data = []) {
    api.log.info('初始化明细数据', {
      dataLength: data?.length,
      isArray: Array.isArray(data)
    });

    // 确保数据是数组
    this._detailData = Array.isArray(data) ? [...data] : [];
  }

  // 添加明细项
  addDetailItem(item) {
    api.log.info('添加明细项', { item });

    if (!item) {
      api.log.warn('添加明细项失败：item 为空');
      return;
    }

    this._detailData.push({
      ...item,
      id: `detail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  // 更新明细项
  updateDetailItem(index, item) {
    api.log.info('更新明细项', { index, item });

    if (!this._detailData[index]) {
      api.log.warn('更新明细项失败：索引不存在', { index });
      return;
    }

    this._detailData[index] = {
      ...item,
      id: this._detailData[index].id
    };
  }

  // 删除明细项
  removeDetailItem(index) {
    api.log.info('删除明细项', { index });

    if (!this._detailData[index]) {
      api.log.warn('删除明细项失败：索引不存在', { index });
      return;
    }

    this._detailData.splice(index, 1);
  }

  // 清除明细数据
  clearDetailData() {
    api.log.info('清除明细数据');
    this._detailData = [];
  }
}

const store = new FormDetailStore();
context.wpm.export('store_form_detail', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_form_index" title="表单索引管理">
const {
  wpm,
  mobx,
  api,
  appId
} = context;

const { makeAutoObservable } = mobx;
const formConfig = await context.wpm.import('module_form_config');

class FormIndexStore {
  constructor() {
    makeAutoObservable(this);
  }

  // 创建表单结构索引
  async createFormIndex(formData) {
    if (!formConfig) {
      const error = new Error('表单配置未加载');
      api.log.error('创建表单索引失败: 配置未加载', { error });
      throw error;
    }

    api.log.info('开始创建表单索引', {
      formId: formData.id,
      hasConfig: !!formConfig,
      hasConfirmForms: !!formConfig.confirm?.forms,
      confirmFormsCount: formConfig.confirm?.forms?.length
    });

    try {
      // 初始化确认信息
      const confirms = [];

      // 从配置中生成初始确认信息
      if (formConfig.confirm?.forms) {
        formConfig.confirm.forms.forEach(form => {
          confirms.push({
            title: form.title,
            status: 'pending',
            updatedAt: formData.createdAt
          });
        });
      }

      api.log.info('生成确认信息', {
        formId: formData.id,
        confirmsCount: confirms.length,
        confirmTitles: confirms.map(c => c.title)
      });

      // 使用传入的总金额
      const totalAmount = formData.totalAmount || 0;

      const indexData = {
        formId: formData.id,
        formType: formConfig.type || 'default',
        formName: formConfig.title || '未命名表单',
        description: formConfig.description || '',
        version: formConfig.version || '1.0.0',
        confirmStatus: 'pending',
        confirms, // 使用初始化的确认信息
        totalAmount,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
        creator: formData.creator,
        structure: {
          basicFields: formConfig.basic?.fields?.length || 0,
          detailColumns: formConfig.detail?.columns?.length || 0,
          confirmForms: formConfig.confirm?.forms?.length || 0
        }
      };

      api.log.info('准备保存表单索引', {
        formId: formData.id,
        indexData: {
          ...indexData,
          confirms: confirms.map(c => ({
            title: c.title,
            status: c.status
          }))
        }
      });

      try {
        // 获取现有索引
        const existingResult = await api.getMetadata([`${appId}_form_index`]);
        let existingIndex = [];

        if (existingResult?.data?.[0]?.value) {
          existingIndex = JSON.parse(existingResult.data[0].value);

          // 验证现有索引是否为数组
          if (!Array.isArray(existingIndex)) {
            api.log.warn('现有索引格式错误，重置为空数组', {
              existingIndex
            });
            existingIndex = [];
          }
        }

        // 添加新表单索引
        const updatedIndex = [...existingIndex, indexData];

        await api.setMetadata(
          `${appId}_form_index`,
          updatedIndex
        );

        api.log.info('创建表单索引成功', {
          formId: formData.id,
          formType: indexData.formType,
          confirmStatus: indexData.confirmStatus,
          confirmsCount: confirms.length,
          totalAmount
        });

        return true;
      } catch (error) {
        api.log.error('保存表单索引失败', {
          error,
          formId: formData.id,
          stack: error.stack
        });
        throw error;
      }
    } catch (error) {
      api.log.error('创建表单索引失败', {
        error,
        formId: formData.id,
        stack: error.stack
      });
      throw error;
    }
  }

  // 更新表单结构索引
  async updateFormIndex(formData) {
    if (!formConfig) {
      const error = new Error('表单配置未加载');
      api.log.error('更新表单索引失败: 配置未加载', { error });
      throw error;
    }

    // 处理确认信息
    const confirms = formData.confirms?.map(confirm => ({
      title: confirm.title || '',
      status: confirm.status || 'pending',
      confirmedBy: confirm.confirmedBy,
      confirmedAt: confirm.confirmedAt,
      cancelledBy: confirm.cancelledBy,
      cancelledAt: confirm.cancelledAt
    })) || [];

    // 使用传入的总金额
    const totalAmount = formData.totalAmount || 0;

    const indexData = {
      formId: formData.id,
      formType: formConfig.type || 'default',
      formName: formConfig.title || '未命名表单',
      description: formConfig.description || '',
      version: formConfig.version || '1.0.0',
      confirmStatus: formData.confirmStatus,
      confirms,
      totalAmount,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      creator: formData.creator,
      structure: {
        basicFields: formConfig.basic?.fields?.length || 0,
        detailColumns: formConfig.detail?.columns?.length || 0,
        confirmForms: formConfig.confirm?.forms?.length || 0
      }
    };

    try {
      api.log.info('开始更新表单索引', {
        formId: formData.id,
        formType: indexData.formType,
        confirms: confirms.length,
        totalAmount
      });

      // 获取现有索引
      const existingResult = await api.getMetadata([`${appId}_form_index`]);
      let existingIndex = [];

      if (existingResult?.data?.[0]?.value) {
        existingIndex = JSON.parse(existingResult.data[0].value);

        // 验证现有索引是否为数组
        if (!Array.isArray(existingIndex)) {
          api.log.warn('现有索引格式错误，重置为空数组', {
            existingIndex
          });
          existingIndex = [];
        }
      }

      // 更新表单索引
      const updatedIndex = existingIndex.map(item =>
        item.formId === formData.id ? indexData : item
      );

      // 如果找不到对应的索引，则添加新索引
      if (!updatedIndex.some(item => item.formId === formData.id)) {
        updatedIndex.push(indexData);
      }

      await api.setMetadata(
        `${appId}_form_index`,
        updatedIndex
      );

      api.log.info('更新表单索引成功', {
        formId: formData.id,
        formType: indexData.formType,
        confirmStatus: indexData.confirmStatus,
        confirms: confirms.length,
        totalAmount
      });

      return true;
    } catch (error) {
      api.log.error('更新表单索引失败', {
        error,
        formId: formData.id,
        stack: error.stack
      });
      throw error;
    }
  }

  // 删除表单索引
  async deleteFormIndex(formId) {
    if (!formId) {
      const error = new Error('表单ID不能为空');
      api.log.error('删除表单索引失败: ID为空', { error });
      throw error;
    }

    try {
      api.log.info('开始删除表单索引', { formId });

      // 获取现有索引
      const existingResult = await api.getMetadata([`${appId}_form_index`]);
      let existingIndex = [];

      if (existingResult?.data?.[0]?.value) {
        existingIndex = JSON.parse(existingResult.data[0].value);

        // 验证现有索引是否为数组
        if (!Array.isArray(existingIndex)) {
          api.log.warn('现有索引格式错误，重置为空数组', {
            existingIndex
          });
          existingIndex = [];
        }
      }

      // 删除表单索引
      const updatedIndex = existingIndex.filter(item => item.formId !== formId);

      await api.setMetadata(
        `${appId}_form_index`,
        updatedIndex
      );

      api.log.info('删除表单索引成功', { formId });
      return true;
    } catch (error) {
      api.log.error('删除表单索引失败', {
        error,
        formId,
        stack: error.stack
      });
      throw error;
    }
  }
}

const store = new FormIndexStore();
context.wpm.export('store_form_index', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_form_list" title="用户表单列表管理">
const {
  wpm,
  mobx,
  api,
  appId
} = context;

const { makeAutoObservable, runInAction } = mobx;

class FormListStore {
  // 状态
  _userForms = [];
  _userFormsLoading = false;
  _error = null;

  constructor() {
    makeAutoObservable(this);
  }

  // 计算属性
  get userForms() {
    return this._userForms;
  }

  get userFormsLoading() {
    return this._userFormsLoading;
  }

  get error() {
    return this._error;
  }

  // 加载用户创建的表单列表
  async loadUserForms() {
    const currentUser = await api.getCurrentAccountInfo();
    if (!currentUser) {
      throw new Error('获取用户信息失败');
    }

    runInAction(() => {
      this._userFormsLoading = true;
      this._error = null;
    });

    try {
      // 获取表单索引
      const result = await api.getMetadata([`${appId}_form_index`]);

      if (!result?.data?.[0]?.value) {
        runInAction(() => {
          this._userForms = [];
        });
        return;
      }

      const indexData = JSON.parse(result.data[0].value);

      // 过滤出当前用户创建的表单
      const userForms = Array.isArray(indexData) ?
        indexData.filter(form => form.creator?.id === currentUser.id) : [];

      runInAction(() => {
        this._userForms = userForms.map(form => ({
          ...form,
          createdAtFormatted: new Date(form.createdAt).toLocaleString(),
          updatedAtFormatted: new Date(form.updatedAt).toLocaleString()
        }));
      });

      api.log.info('加载用户表单列表成功', {
        userId: currentUser.id,
        formCount: userForms.length
      });

    } catch (error) {
      runInAction(() => {
        this._error = error.message || '加载失败';
      });
      api.log.error('加载用户表单列表失败', { error });
      throw error;
    } finally {
      runInAction(() => {
        this._userFormsLoading = false;
      });
    }
  }

  // 清除列表数据
  clearUserForms() {
    runInAction(() => {
      this._userForms = [];
      this._error = null;
      this._userFormsLoading = false;
    });
  }
}

const store = new FormListStore();
context.wpm.export('store_form_list', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_form" title="表单类型定义">
// 用户信息类型
type UserInfo = {
  id: string;
  name: string;
  role?: string;
};

// 表单字段类型
type FormField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
};

// 表单列类型
type FormColumn = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  width?: number;
  align?: 'left' | 'center' | 'right';
  required?: boolean;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
};

// 确认表单配置
type ConfirmForm = {
  title: string;
  description?: string;
  fields: FormField[];
};

// 表单配置类型
type FormConfig = {
  type: string;
  title: string;
  description?: string;
  version?: string;
  basic?: {
    fields: FormField[];
  };
  detail?: {
    columns: FormColumn[];
  };
  confirm?: {
    forms: ConfirmForm[];
  };
};

// 确认状态类型
type ConfirmStatus = 'pending' | 'confirmed' | 'cancelled';

// 确认信息类型
type ConfirmInfo = {
  title: string;
  status: ConfirmStatus;
  confirmedBy?: UserInfo;
  confirmedAt?: string;
  cancelledBy?: UserInfo;
  cancelledAt?: string;
};

// 表单索引结构类型
type FormStructure = {
  basicFields: number;
  detailColumns: number;
  confirmForms: number;
};

// 表单索引类型
type FormIndex = {
  formId: string;
  formType: string;
  formName: string;
  description?: string;
  version: string;
  confirmStatus: 'pending' | 'completed';
  confirms: ConfirmInfo[];  // 新增字段:确认信息数组
  totalAmount?: number;     // 新增字段:总金额
  createdAt: string;
  updatedAt: string;
  creator: UserInfo;
  structure: FormStructure;
};

// 表单基础数据类型
type FormBasicData = {
  [key: string]: string | number | boolean | null;
};

// 表单明细数据类型
type FormDetailItem = {
  id: string;
  [key: string]: string | number | boolean | null;
};

// 表单确认数据类型
type FormConfirmData = {
  status: ConfirmStatus;
  comment?: string;
  confirmedBy?: UserInfo;
  confirmedAt?: string;
  updatedAt: string;
  [key: string]: any;
};

// 表单附件类型
type FormAttachment = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: UserInfo;
};

// 操作记录类型
type OperationRecord = {
  id: string;
  time: string;
  operator: UserInfo;
};

// 完整的表单数据类型
type FormData = {
  id: string;
  config: FormConfig;
  basic: FormBasicData;
  detail: FormDetailItem[];
  confirms: FormConfirmData[];
  attachments: FormAttachment[];
  confirmStatus: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  creator: UserInfo;
  operator?: OperationRecord;
};

// 表单查询参数类型
type FormQueryParams = {
  formType?: string;
  confirmStatus?: 'pending' | 'completed';
  creatorId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

// 表单查询结果类型
type FormQueryResult = {
  items: FormIndex[];
  total: number;
  page: number;
  pageSize: number;
};

// 表单服务接口类型
type FormService = {
  // 查询表单列表
  queryForms: (params: FormQueryParams) => Promise<FormQueryResult>;
  // 获取表单详情
  getFormById: (formId: string) => Promise<FormData | null>;
  // 创建表单
  createForm: (data: Omit<FormData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  // 更新表单
  updateForm: (formId: string, data: Partial<FormData>) => Promise<boolean>;
  // 删除表单
  deleteForm: (formId: string) => Promise<boolean>;
};
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_form_config" title="表单配置类型定义">
// 应用配置类型
type AppConfig = {
  title: string;
  description: string;
  version: string;
};

// AI 配置类型
type AIConfig = {
  title: string;
  description: string;
  placeholder: string;
  example: {
    title: string;
    details: string[];
  };
  buttons: {
    cancel: string;
    generate: string;
    back: string;
    create: string;
    preview: {
      prev: string;
      next: string;
    };
  };
  messages: {
    emptyInput: string;
    generateSuccess: string;
    generateError: string;
    createSuccess: string;
    createError: string;
    invalidConfig: string;
  };
};

// 字段选项类型
type FieldOption = {
  value: string;
  label: string;
};

// 基础字段类型
type BaseField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  icon?: string;
  help?: string;
  validate?: (value: any) => string | undefined;
};

// 基本信息字段类型
type BasicField = BaseField & {
  span?: 'full';
  options?: FieldOption[];
  maxLength?: number;
  minLength?: number;
  minRows?: number;
  maxRows?: number;
  min?: number;
  max?: number;
  checkedLabel?: string;
  uncheckedLabel?: string;
};

// 明细列类型
type DetailColumn = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  align?: string;
  format?: string;
  options?: FieldOption[];
};

// 附件类型配置
type AttachmentType = {
  key: string;
  label: string;
  icon: string;
  accept: string[];
};

// 确认表单类型
type ConfirmForm = {
  id: string;
  title: string;
  required: boolean;
  fields: BasicField[];
};

// 验证配置类型
type ValidationConfig = {
  enabled: boolean;  // 是否启用验证
  mode?: 'strict' | 'loose';  // 验证模式：严格/宽松
};

// 基本信息配置类型
type BasicConfig = {
  fields: BasicField[];
};

// 明细信息配置类型
type DetailConfig = {
  title: string;
  columns: DetailColumn[];
};

// 附件配置类型
type AttachmentsConfig = {
  title: string;
  description: string;
  maxSize: number;
  accept: {
    [key: string]: string[];
  };
  maxCount: number;
  types: AttachmentType[];
};

// 确认信息配置类型
type ConfirmConfig = {
  title: string;
  forms: ConfirmForm[];
};

// 完整表单配置类型
type FormConfig = {
  appConfig: AppConfig;
  aiConfig: AIConfig;
  title: string;
  description: string;
  type: string;
  version: string;
  validation?: ValidationConfig;  // 新增：验证配置
  basic: BasicConfig;
  detail: DetailConfig;
  attachments: AttachmentsConfig;
  confirm: ConfirmConfig;
};
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_form_field" title="表单字段类型定义">
// 字段基础属性
interface FieldBase {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  description?: string;
  help?: string;
  icon?: string;
  className?: string;
  validate?: (value: any) => string | undefined;
}

// 文本字段
interface TextField extends FieldBase {
  type: 'text';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

// 多行文本字段
interface TextareaField extends FieldBase {
  type: 'textarea';
  maxLength?: number;
  minLength?: number;
  minRows?: number;
  maxRows?: number;
}

// 数字字段
interface NumberField extends FieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

// 日期字段
interface DateField extends FieldBase {
  type: 'date';
  format?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
}

// 日期时间字段
interface DateTimeField extends FieldBase {
  type: 'datetime';
  format?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
}

// 选项类型
interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 下拉选择字段
interface SelectField extends FieldBase {
  type: 'select';
  options: Option[];
  multiple?: boolean;
}

// 单选框组字段
interface RadioField extends FieldBase {
  type: 'radio';
  options: Option[];
  direction?: 'horizontal' | 'vertical';
}

// 复选框组字段
interface CheckboxField extends FieldBase {
  type: 'checkbox';
  options: Option[];
  direction?: 'horizontal' | 'vertical';
}

// 开关字段
interface SwitchField extends FieldBase {
  type: 'switch';
  checkedLabel?: string;
  uncheckedLabel?: string;
}

// 金额字段
interface MoneyField extends FieldBase {
  type: 'money';
  min?: number;
  max?: number;
  precision?: number;
  currency?: string;
}

// 所有字段类型联合
type FormField =
  | TextField
  | TextareaField
  | NumberField
  | DateField
  | DateTimeField
  | SelectField
  | RadioField
  | CheckboxField
  | SwitchField
  | MoneyField;

// 字段渲染器属性
interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_form_index" title="表单索引类型定义">
// 确认信息类型
type ConfirmInfo = {
  title: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedBy?: string;
  confirmedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
};

// 表单结构类型
type FormStructure = {
  basicFields: number;
  detailColumns: number;
  confirmForms: number;
};

// 表单索引类型
type FormIndex = {
  formId: string;
  formType: string;
  formName: string;
  description?: string;
  version: string;
  confirmStatus: 'pending' | 'completed';
  confirms: ConfirmInfo[];  // 确认信息数组
  totalAmount: number;      // 总金额
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    role?: string;
  };
  structure: FormStructure;
};
</mo-ai-code>
```

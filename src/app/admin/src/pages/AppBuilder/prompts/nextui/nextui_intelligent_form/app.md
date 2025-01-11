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
<mo-ai-code type="component" name="comp_dynamic_form_adapter" title="动态表单适配器">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  api
} = context;

const { Card, CardBody, Button, Tabs, Tab, useDisclosure } = NextUI;

// 导入子组件
const DynamicFormBasic = await context.wpm.import('comp_dynamic_form_basic');
const DynamicFormDetail = await context.wpm.import('comp_dynamic_form_detail');
const DynamicFormConfirm = await context.wpm.import('comp_dynamic_form_confirm');
const DynamicFormHistory = await context.wpm.import('comp_dynamic_form_history');

// 导入数据管理
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormAdapter = observer(({
  // 表单配置
  config,
  // 表单数据
  formId,
  // 回调函数
  onSave,
  onError,
  // 只读模式
  readOnly = false,
  // 样式
  className
}) => {
  const [loading, setLoading] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("basic");
  const [errors, setErrors] = React.useState({});
  const historyModal = useDisclosure();
  const saveButtonRef = React.useRef(null);

  // 初始化加载数据
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (formId) {
          await dynamicFormStore.loadFormData(formId);
        } else {
          dynamicFormStore.initNewForm(config);
        }
        api.log.info('动态表单初始化成功', { formId });
      } catch (error) {
        api.log.error('动态表单初始化失败', { error });
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [formId, config]);

  // 表单校验
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 校验基本信息
    if (!dynamicFormStore.validateBasicFields()) {
      newErrors.basic = '请完善基本信息';
      isValid = false;
    }

    // 校验明细信息
    if (!dynamicFormStore.validateDetailData()) {
      newErrors.detail = '请至少添加一条明细记录';
      isValid = false;
    }

    // 校验确认信息
    if (!dynamicFormStore.validateConfirmData()) {
      newErrors.confirm = '请完成必要的确认信息';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 处理保存
  const handleSave = async () => {
    if (loading || !saveButtonRef.current) return;

    try {
      // 防重复点击
      saveButtonRef.current.disabled = true;
      setLoading(true);

      // 表单校验
      if (!validateForm()) {
        // 显示错误提示
        Object.entries(errors).forEach(([key, message]) => {
          message && NextUI.message.error(message);
        });
        return;
      }

      const success = await dynamicFormStore.saveFormData();
      if (success) {
        NextUI.message.success('保存成功');
        onSave?.(dynamicFormStore.currentForm);
      }
    } catch (error) {
      api.log.error('保存表单失败', { error });
      onError?.(error);
    } finally {
      setLoading(false);
      if (saveButtonRef.current) {
        saveButtonRef.current.disabled = false;
      }
    }
  };

  // 渲染工具栏
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
                  {errors.basic && (
                    <Icon
                      icon="solar:danger-circle-bold"
                      className="text-danger"
                    />
                  )}
                </div>
              }
            >
              <DynamicFormBasic
                config={config.basic}
                readOnly={readOnly}
              />
            </Tab>
            <Tab
              key="detail"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:table-2-bold" />
                  <span>明细信息</span>
                  {errors.detail && (
                    <Icon
                      icon="solar:danger-circle-bold"
                      className="text-danger"
                    />
                  )}
                </div>
              }
            >
              <DynamicFormDetail
                config={config.detail}
                readOnly={readOnly}
              />
            </Tab>
            <Tab
              key="confirm"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:user-check-bold" />
                  <span>确认信息</span>
                  {errors.confirm && (
                    <Icon
                      icon="solar:danger-circle-bold"
                      className="text-danger"
                    />
                  )}
                </div>
              }
            >
              <DynamicFormConfirm
                config={config.confirm}
                readOnly={readOnly}
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

const { Input, Textarea, Select, SelectItem } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormBasic = observer(({
  config,
  readOnly = false
}) => {
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  // 处理字段变更
  const handleFieldChange = (field, value) => {
    dynamicFormStore.updateBasicField(field.name, value);
    validateField(field, value);
  };

  // 处理字段失焦
  const handleFieldBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field.name]: true
    }));
    validateField(field, dynamicFormStore.currentForm?.basic?.[field.name]);
  };

  // 验证单个字段
  const validateField = (field, value) => {
    let error = null;

    // 必填校验
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = `请输入${field.label}`;
    }

    // 自定义校验规则
    if (field.validate) {
      const customError = field.validate(value);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({
      ...prev,
      [field.name]: error
    }));

    return !error;
  };

  // 渲染字段
  const renderField = (field) => {
    const value = dynamicFormStore.currentForm?.basic?.[field.name] || '';
    const isInvalid = touched[field.name] && errors[field.name];

    const commonProps = {
      key: field.name,
      label: field.label,
      name: field.name,
      value: value,
      isRequired: field.required,
      isReadOnly: readOnly,
      isInvalid: !!isInvalid,
      errorMessage: isInvalid,
      onBlur: () => handleFieldBlur(field),
      classNames: {
        label: "text-default-600",
        input: "text-default-800",
        errorMessage: "text-danger text-xs mt-1"
      }
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder || `请输入${field.label}`}
            minRows={field.minRows || 3}
            maxRows={field.maxRows || 5}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            description={field.description}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            placeholder={field.placeholder || `请选择${field.label}`}
            selectedKeys={value ? [value] : []}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            description={field.description}
          >
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type || 'text'}
            placeholder={field.placeholder || `请输入${field.label}`}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            description={field.description}
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
        );
    }
  };

  return (
    <div className="space-y-6 py-4">
      {config.fields?.map((field) => (
        <div key={field.name} className={cn(
          "relative",
          field.span === 'full' ? 'col-span-2' : '',
          errors[field.name] && touched[field.name] ? 'animate-shake' : ''
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
  api,
  message
} = context;

const { Input, Textarea, Avatar, Button, Card, CardBody } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormConfirm = observer(({
  config,
  readOnly = false
}) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

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

  // 验证表单字段
  const validateField = (formIndex, field, value) => {
    let error = null;

    if (field.required && (!value || value.toString().trim() === '')) {
      error = `请输入${field.label}`;
    }

    setErrors(prev => ({
      ...prev,
      [`${formIndex}_${field.name}`]: error
    }));

    return !error;
  };

  // 验证整个确认表单
  const validateConfirmForm = (formIndex) => {
    const form = config.forms[formIndex];
    const confirmData = dynamicFormStore.currentForm?.confirms?.[formIndex] || {};
    let isValid = true;

    form.fields.forEach(field => {
      if (!validateField(formIndex, field, confirmData[field.name])) {
        isValid = false;
      }
    });

    return isValid;
  };

  // 处理确认
  const handleConfirm = async (formIndex) => {
    if (loading) return;

    try {
      // 验证表单
      if (!validateConfirmForm(formIndex)) {
        message.error('请完善必填信息');
        return;
      }

      setLoading(true);
      const confirmInfo = {
        name: currentUser.name,
        phone: currentUser.phone || currentUser.mobile,
        time: new Date().toISOString(),
        status: 'confirmed'
      };
      await dynamicFormStore.updateConfirmForm(formIndex, confirmInfo);
      message.success('确认成功');
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
    validateField(formIndex, field, value);
  };

  // 处理字段失焦
  const handleFieldBlur = (formIndex, field) => {
    setTouched(prev => ({
      ...prev,
      [`${formIndex}_${field.name}`]: true
    }));
    const value = dynamicFormStore.currentForm?.confirms?.[formIndex]?.[field.name];
    validateField(formIndex, field, value);
  };

  // 渲染确认状态标签
  const renderStatusChip = (status) => {
    switch(status) {
      case 'confirmed':
        return (
          <NextUI.Chip color="success" variant="flat">
            已确认
          </NextUI.Chip>
        );
      case 'cancelled':
        return (
          <NextUI.Chip color="danger" variant="flat">
            已取消
          </NextUI.Chip>
        );
      default:
        return (
          <NextUI.Chip color="default" variant="flat">
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
        {config.forms.map((form, index) => (
          <Card
            key={form.id || index}
            className={cn(
              "border",
              dynamicFormStore.currentForm?.confirms?.[index]?.status === 'confirmed'
                ? "border-success"
                : dynamicFormStore.currentForm?.confirms?.[index]?.status === 'cancelled'
                ? "border-danger"
                : "border-default-200"
            )}
          >
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{form.title}</h3>
                  <div className="flex items-center gap-2">
                    {renderStatusChip(dynamicFormStore.currentForm?.confirms?.[index]?.status)}
                    {!readOnly && (
                      <>
                        {dynamicFormStore.currentForm?.confirms?.[index]?.status === 'confirmed' && (
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
                        {(dynamicFormStore.currentForm?.confirms?.[index]?.status === 'cancelled' ||
                         !dynamicFormStore.currentForm?.confirms?.[index]?.status) && (
                          <Button
                            color="success"
                            variant="flat"
                            size="sm"
                            isLoading={loading}
                            onPress={() => handleConfirm(index)}
                          >
                            {dynamicFormStore.currentForm?.confirms?.[index]?.status === 'cancelled' ? '重新确认' : '确认'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {form.fields.map((field) => {
                    const fieldKey = `${index}_${field.name}`;
                    const isInvalid = touched[fieldKey] && errors[fieldKey];

                    return (
                      <div key={field.name}>
                        <Input
                          label={field.label}
                          value={dynamicFormStore.currentForm?.confirms?.[index]?.[field.name] || ''}
                          isReadOnly={readOnly || dynamicFormStore.currentForm?.confirms?.[index]?.status === 'confirmed'}
                          isRequired={field.required}
                          isInvalid={!!isInvalid}
                          errorMessage={isInvalid}
                          onChange={(e) => handleFieldChange(index, field, e.target.value)}
                          onBlur={() => handleFieldBlur(index, field)}
                          startContent={
                            field.icon && (
                              <Icon
                                className="text-default-400 pointer-events-none flex-shrink-0"
                                icon={field.icon}
                                width={20}
                              />
                            )
                          }
                          classNames={{
                            errorMessage: "text-danger text-xs mt-1"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 确认信息 */}
                {dynamicFormStore.currentForm?.confirms?.[index]?.status === 'confirmed' && (
                  <div className="text-small text-success">
                    确认时间: {new Date(dynamicFormStore.currentForm.confirms[index].time).toLocaleString()}
                    <br/>
                    确认人: {dynamicFormStore.currentForm.confirms[index].name}
                  </div>
                )}

                {/* 取消信息 */}
                {dynamicFormStore.currentForm?.confirms?.[index]?.status === 'cancelled' && (
                  <div className="text-small text-danger">
                    取消时间: {new Date(dynamicFormStore.currentForm.confirms[index].cancelTime).toLocaleString()}
                    <br/>
                    取消人: {dynamicFormStore.currentForm.confirms[index].cancelBy}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
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
  message
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, useDisclosure, Input } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormDetail = observer(({
  config,
  readOnly = false
}) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const editModal = useDisclosure();

  // 使用计算属性获取数据
  const detailData = dynamicFormStore.detailData;
  const totalAmount = dynamicFormStore.totalAmount;
  const detailCount = dynamicFormStore.detailCount;

  // 验证明细项
  const validateDetailItem = (item) => {
    const newErrors = {};
    let isValid = true;

    config.columns.forEach(column => {
      if (column.required && (!item[column.key] || item[column.key].toString().trim() === '')) {
        newErrors[column.key] = `${column.label}不能为空`;
        isValid = false;
      }

      if (column.type === 'number' || column.type === 'money') {
        const value = Number(item[column.key]);
        if (isNaN(value) || value < 0) {
          newErrors[column.key] = `${column.label}必须是有效的数字`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // 处理添加
  const handleAdd = (item) => {
    try {
      if (!validateDetailItem(item)) {
        return;
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
    }
  };

  // 处理编辑
  const handleEdit = (item) => {
    try {
      if (!validateDetailItem(item)) {
        return;
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
    }
  };

  // 处理删除
  const handleDelete = (index) => {
    try {
      dynamicFormStore.removeDetailItem(index);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败: ' + error.message);
      api.log.error('删除明细失败', { error, index });
    }
  };

  // 渲染单元格
  const renderCell = (item, columnKey) => {
    const column = config.columns.find(col => col.key === columnKey);
    if (!column) return null;

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

    if (column.render) {
      return column.render(item[columnKey], item);
    }

    switch (column.type) {
      case 'number':
        const num = Number(item[columnKey]);
        return !isNaN(num) ? num.toLocaleString() : '0';
      case 'date':
        return item[columnKey] ? new Date(item[columnKey]).toLocaleString() : '-';
      default:
        return item[columnKey] || '-';
    }
  };

  // 自动计算金额
  const calculateAmount = (quantity, price) => {
    const numQuantity = Number(quantity) || 0;
    const numPrice = Number(price) || 0;
    return numQuantity * numPrice;
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
              setErrors({});
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
          {config.columns.map((column) => (
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
          {!readOnly && (
            <TableColumn key="actions" align="center">
              操作
            </TableColumn>
          )}
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
        scrollBehavior="inside"
      >
        <NextUI.ModalContent>
          {(onClose) => {
            const [formState, setFormState] = React.useState({
              quantity: selectedItem?.quantity || '',
              price: selectedItem?.price || ''
            });

            const handleFieldChange = (field, value) => {
              setFormState(prev => {
                const newState = { ...prev, [field]: value };
                // 自动计算金额
                if (field === 'quantity' || field === 'price') {
                  const amount = calculateAmount(
                    field === 'quantity' ? value : newState.quantity,
                    field === 'price' ? value : newState.price
                  );
                  return { ...newState, amount };
                }
                return newState;
              });
            };

            return (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {};
                config.columns.forEach(column => {
                  if (column.key !== 'actions' && column.key !== 'amount') {
                    const value = formData.get(column.key);
                    data[column.key] = value;
                  }
                });

                // 计算金额
                data.amount = calculateAmount(data.quantity, data.price);

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
                      if (column.key === 'actions' || column.key === 'amount') return null;

                      return (
                        <Input
                          key={column.key}
                          name={column.key}
                          label={column.label}
                          type={column.type === 'number' || column.type === 'money' ? 'number' : 'text'}
                          defaultValue={selectedItem?.[column.key]}
                          isRequired={column.required}
                          step={column.type === 'money' ? "0.01" : "1"}
                          isInvalid={!!errors[column.key]}
                          errorMessage={errors[column.key]}
                          onChange={(e) => handleFieldChange(column.key, e.target.value)}
                          classNames={{
                            errorMessage: "text-danger text-xs mt-1"
                          }}
                        />
                      );
                    })}
                    <div className="text-small text-default-500">
                      预计金额：¥{calculateAmount(formState.quantity, formState.price).toFixed(2)}
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

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, useDisclosure } = NextUI;
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
          const parsedHistory = result.data.map(item => ({
            id: `history_${item.versionCode}`,
            versionCode: item.versionCode,
            updatedAt: item.updatedAt,
            updatedBy: item.updatedBy,
            value: JSON.parse(item.value)
          }));
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
    if (JSON.stringify(current.value.confirm) !== JSON.stringify(previous.value.confirm)) {
      changes.push({
        id: `diff_confirm_${current.versionCode}`,
        type: 'confirm',
        oldValue: previous.value.confirm,
        newValue: current.value.confirm
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
                  >
                    <TableHeader>
                      <TableColumn key="version">版本</TableColumn>
                      <TableColumn key="time">修改时间</TableColumn>
                      <TableColumn key="user">修改人</TableColumn>
                      <TableColumn key="action">操作</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={history}
                      emptyContent="暂无修改记录"
                    >
                      {(item) => (
                        <TableRow key={item.id}>
                          <TableCell>v{item.versionCode}</TableCell>
                          <TableCell>
                            {new Date(item.updatedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{item.updatedBy}</TableCell>
                          <TableCell>
                            {history.indexOf(item) < history.length - 1 && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
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
<mo-ai-code type="module" name="module_form_config" title="动态表单配置">
const {
  wpm,
  api
} = context;

// 动态表单配置
const formConfig = {
  // 表单标题和描述
  title: "设备维修申请单",
  description: "用于申请设备维修和记录维修过程",

  // 基本信息配置
  basic: {
    fields: [
      {
        name: "title",
        label: "维修事由",
        type: "text",
        required: true,
        placeholder: "请简要描述维修原因",
        icon: "solar:document-text-bold"
      },
      {
        name: "deviceNo",
        label: "设备编号",
        type: "text",
        required: true,
        placeholder: "请输入设备编号",
        icon: "solar:hashtag-bold"
      },
      {
        name: "deviceName",
        label: "设备名称",
        type: "text",
        required: true,
        placeholder: "请输入设备名称",
        icon: "solar:widget-bold"
      },
      {
        name: "department",
        label: "所属部门",
        type: "select",
        required: true,
        placeholder: "请选择所属部门",
        options: [
          { value: "production", label: "生产部" },
          { value: "rd", label: "研发部" },
          { value: "qa", label: "质量部" }
        ]
      },
      {
        name: "urgency",
        label: "紧急程度",
        type: "select",
        required: true,
        placeholder: "请选择紧急程度",
        options: [
          { value: "high", label: "高" },
          { value: "medium", label: "中" },
          { value: "low", label: "低" }
        ]
      },
      {
        name: "description",
        label: "详细说明",
        type: "textarea",
        required: true,
        placeholder: "请详细描述设备故障情况",
        span: "full",
        minRows: 3,
        maxRows: 5,
        icon: "solar:notebook-bold"
      }
    ]
  },

  // 明细信息配置
  detail: {
    title: "维修项目",
    columns: [
      {
        key: "name",
        label: "维修项目",
        type: "text",
        required: true
      },
      {
        key: "type",
        label: "维修类型",
        type: "select",
        required: true,
        options: [
          { value: "parts", label: "更换零件" },
          { value: "repair", label: "维修保养" },
          { value: "check", label: "检查调试" }
        ]
      },
      {
        key: "quantity",
        label: "数量",
        type: "number",
        required: true
      },
      {
        key: "price",
        label: "单价",
        type: "number",
        required: true
      },
      {
        key: "amount",
        label: "金额",
        type: "money",
        render: (value) => `¥${value?.toFixed(2)}`
      }
    ]
  },

  // 确认信息配置
  confirm: {
    title: "确认信息",
    forms: [
      {
        id: "apply_confirm",
        title: "申请确认",
        fields: [
          {
            name: "name",
            label: "申请人",
            type: "text",
            required: true,
            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",
            required: true,
            icon: "solar:phone-bold"
          },
          {
            name: "note",
            label: "申请说明",
            type: "textarea",
            required: false,
            icon: "solar:notes-bold"
          }
        ]
      },
      {
        id: "manager_confirm",
        title: "主管确认",
        fields: [
          {
            name: "name",
            label: "主管姓名",
            type: "text",
            required: true,
            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",
            required: true,
            icon: "solar:phone-bold"
          },
          {
            name: "note",
            label: "审批意见",
            type: "textarea",
            required: false,
            icon: "solar:notes-bold"
          }
        ]
      },
      {
        id: "maintenance_confirm",
        title: "维修确认",
        fields: [
          {
            name: "name",
            label: "维修人员",
            type: "text",
            required: true,
            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",
            required: true,
            icon: "solar:phone-bold"
          },
          {
            name: "note",
            label: "维修说明",
            type: "textarea",
            required: false,
            icon: "solar:notes-bold"
          }
        ]
      }
    ]
  }
};

// 导出配置
context.wpm.export('module_form_config', formConfig);
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

const { useParams, useNavigate } = ReactRouterDom;
const { Button, Spinner } = NextUI;

const DynamicFormAdapter = await context.wpm.import('comp_dynamic_form_adapter');
const dynamicFormStore = await context.wpm.import('store_dynamic_form');
const formConfig = await context.wpm.import('module_form_config');

const FormDetailPage = observer(() => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

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

  const handleSave = async (formData) => {
    try {
      await dynamicFormStore.saveFormData();
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败: ' + error.message);
      api.log.error('保存表单失败', { error, formId });
    }
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
          <h1 className="text-xl font-bold">维修申请单</h1>
          <div className="w-[88px]" /> {/* 占位，保持标题居中 */}
        </div>

        <DynamicFormAdapter
          formId={formId}
          config={formConfig}
          onSave={handleSave}
          onError={(error) => {
            message.error("表单操作失败")
            api.log.error('表单操作失败', { error, formId });
          }}
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
  api
} = context;

const { useNavigate } = ReactRouterDom;
const { Button, Card } = NextUI;

const dynamicFormStore = await context.wpm.import('store_dynamic_form');
const formConfig = await context.wpm.import('module_form_config');

const HomePage = observer(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleCreateForm = async () => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-pink-300 to-blue-300 p-6">
      <Card className="w-full max-w-md bg-background/60 p-6 backdrop-blur-md">
        <div className="text-center">
          <div className="mb-6">
            <Icon
              icon="solar:clipboard-add-bold"
              className="h-16 w-16 text-primary mx-auto"
            />
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              设备维修申请
            </h1>
            <p className="mt-2 text-small text-foreground-500">
              点击下方按钮创建新的维修申请单
            </p>
          </div>

          <Button
            size="lg"
            color="primary"
            variant="shadow"
            className="w-full"
            startContent={<Icon icon="solar:add-circle-bold" />}
            isLoading={loading}
            onPress={handleCreateForm}
          >
            创建维修申请单
          </Button>
        </div>
      </Card>
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
  message,
  api,
  appId
} = context;

const { makeAutoObservable, runInAction, computed } = mobx;

class DynamicFormStore {
  // 私有状态
  _formData = null;
  _isLoading = false;
  _error = null;

  // 不可变配置
  formPrefix = `${appId}_dynamic_form`;
  indexPrefix = `${appId}_form_index`;

  constructor() {
    makeAutoObservable(this, {
      formPrefix: false,
      indexPrefix: false
    });
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
    return this._formData;
  }

  get detailData() {
    return this._formData?.detail || [];
  }

  get totalAmount() {
    return computed(() => {
      if (!Array.isArray(this._formData?.detail)) {
        return 0;
      }
      return this._formData.detail.reduce((sum, item) => {
        const amount = Number(item.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    }).get();
  }

  get detailCount() {
    return this._formData?.detail?.length || 0;
  }

  // 校验基本信息
  validateBasicFields() {
    if (!this._formData?.config?.basic?.fields) return true;

    const requiredFields = this._formData.config.basic.fields
      .filter(field => field.required)
      .map(field => field.name);

    return requiredFields.every(field => {
      const value = this._formData.basic?.[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  // 校验明细数据
  validateDetailData() {
    if (!this._formData?.config?.detail?.columns) return true;

    // 检查是否有明细数据
    if (!Array.isArray(this._formData.detail) || this._formData.detail.length === 0) {
      return false;
    }

    // 检查每条明细的必填字段
    const requiredColumns = this._formData.config.detail.columns
      .filter(col => col.required)
      .map(col => col.key);

    return this._formData.detail.every(item =>
      requiredColumns.every(key => {
        const value = item[key];
        return value !== undefined && value !== null && value !== '';
      })
    );
  }

  // 校验确认信息
  validateConfirmData() {
    if (!this._formData?.config?.confirm?.forms) return true;

    // 检查必填的确认表单
    return this._formData.config.confirm.forms.every((form, index) => {
      if (!form.required) return true;

      const confirmData = this._formData.confirms?.[index];
      if (!confirmData) return false;

      // 检查必填字段
      const requiredFields = form.fields
        .filter(field => field.required)
        .map(field => field.name);

      return requiredFields.every(field => {
        const value = confirmData[field];
        return value !== undefined && value !== null && value !== '';
      });
    });
  }

  // 创建表单结构索引
  async createFormIndex(formData) {
    const indexData = {
      formId: formData.id,
      formType: formData.config?.type || 'default',
      formName: formData.config?.title || '未命名表单',
      description: formData.config?.description,
      version: formData.config?.version || '1.0.0',
      status: formData.status || 'draft',
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      creator: formData.creator,
      // 表单结构信息
      structure: {
        basicFields: formData.config?.basic?.fields?.length || 0,
        detailColumns: formData.config?.detail?.columns?.length || 0,
        confirmForms: formData.config?.confirm?.forms?.length || 0
      }
    };

    try {
      await api.setMetadata(
        `${this.indexPrefix}_${formData.id}`,
        indexData
      );

      api.log.info('创建表单索引成功', {
        formId: formData.id,
        formType: indexData.formType
      });

      return true;
    } catch (error) {
      api.log.error('创建表单索引失败', { error, formId: formData.id });
      throw error;
    }
  }

  // 更新表单结构索引
  async updateFormIndex(formData) {
    const indexData = {
      formId: formData.id,
      formType: formData.config?.type || 'default',
      formName: formData.config?.title || '未命名表单',
      description: formData.config?.description,
      version: formData.config?.version || '1.0.0',
      status: formData.status || 'draft',
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      creator: formData.creator,
      // 表单结构信息
      structure: {
        basicFields: formData.config?.basic?.fields?.length || 0,
        detailColumns: formData.config?.detail?.columns?.length || 0,
        confirmForms: formData.config?.confirm?.forms?.length || 0
      }
    };

    try {
      // 检查索引是否存在
      const existingIndex = await api.getMetadata([`${this.indexPrefix}_${formData.id}`]);

      if (existingIndex?.data?.[0]?.value) {
        // 更新现有索引
        await api.setMetadata(
          `${this.indexPrefix}_${formData.id}`,
          {
            ...JSON.parse(existingIndex.data[0].value),
            ...indexData,
            updatedAt: new Date().toISOString()
          }
        );
      } else {
        // 创建新索引
        await this.createFormIndex(formData);
      }

      api.log.info('更新表单索引成功', {
        formId: formData.id,
        formType: indexData.formType
      });

      return true;
    } catch (error) {
      api.log.error('更新表单索引失败', { error, formId: formData.id });
      throw error;
    }
  }

  // 初始化新表单
  initNewForm(config) {
    runInAction(() => {
      this._formData = {
        basic: {},
        detail: [],
        confirms: [],
        config: config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  // 创建新表单
  async createNewForm(config) {
    const currentUser = await api.getCurrentAccountInfo();
    if (!currentUser) {
      throw new Error('获取用户信息失败');
    }

    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const formData = {
      id: formId,
      basic: {},
      detail: [],
      confirms: [],
      config: config,
      createdAt: now,
      updatedAt: now,
      creator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      status: 'draft'
    };

    try {
      // 保存表单数据
      await api.setMetadata(
        `${this.formPrefix}_${formId}`,
        formData
      );

      // 创建表单索引
      await this.createFormIndex(formData);

      runInAction(() => {
        this._formData = formData;
      });

      api.log.info('创建表单成功', {
        formId,
        creator: currentUser.name
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
        this._formData = {
          ...formData,
          detail: Array.isArray(formData.detail) ? formData.detail : [],
          confirms: Array.isArray(formData.confirms) ? formData.confirms : []
        };
      });

      api.log.info('加载表单数据成功', {
        formId,
        formType: formData.config?.type
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

    // 表单校验
    if (!this.validateBasicFields()) {
      throw new Error('请完善基本信息');
    }

    if (!this.validateDetailData()) {
      throw new Error('请至少添加一条明细记录');
    }

    if (!this.validateConfirmData()) {
      throw new Error('请完成必要的确认信息');
    }

    const currentUser = await api.getCurrentAccountInfo();
    if (!currentUser) {
      throw new Error('获取用户信息失败');
    }

    const formId = this._formData.id;
    const now = new Date().toISOString();

    const formData = {
      ...this._formData,
      updatedAt: now,
      operator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        time: now
      }
    };

    try {
      // 保存表单数据
      await api.setMetadata(
        `${this.formPrefix}_${formId}`,
        formData
      );

      // 更新表单索引
      await this.updateFormIndex(formData);

      runInAction(() => {
        this._formData = formData;
      });

      api.log.info('保存表单数据成功', {
        formId,
        formType: formData.config?.type
      });

      return true;
    } catch (error) {
      api.log.error('保存表单数据失败', { error, formId });
      throw error;
    }
  }

  // 清除表单数据
  clearCurrentForm() {
    runInAction(() => {
      this._formData = null;
      this._error = null;
      this._isLoading = false;
    });
  }

  // 更新基本信息字段
  updateBasicField(field, value) {
    if (!this._formData) return;

    runInAction(() => {
      this._formData.basic = {
        ...this._formData.basic,
        [field]: value
      };
    });
  }

  // 添加明细项
  addDetailItem(item) {
    if (!this._formData) return;

    runInAction(() => {
      if (!Array.isArray(this._formData.detail)) {
        this._formData.detail = [];
      }
      this._formData.detail.push({
        ...item,
        id: `detail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });
  }

  // 更新明细项
  updateDetailItem(index, item) {
    if (!this._formData?.detail?.[index]) return;

    runInAction(() => {
      this._formData.detail[index] = {
        ...item,
        id: this._formData.detail[index].id
      };
    });
  }

  // 删除明细项
  removeDetailItem(index) {
    if (!this._formData?.detail?.[index]) return;

    runInAction(() => {
      this._formData.detail.splice(index, 1);
    });
  }

  // 更新确认表单
  async updateConfirmForm(formIndex, confirmInfo) {
    if (!this._formData) return;

    runInAction(() => {
      if (!Array.isArray(this._formData.confirms)) {
        this._formData.confirms = [];
      }

      while (this._formData.confirms.length <= formIndex) {
        this._formData.confirms.push({});
      }

      this._formData.confirms[formIndex] = {
        ...this._formData.confirms[formIndex],
        ...confirmInfo,
        updatedAt: new Date().toISOString()
      };
    });
  }

  // 更新确认字段
  updateConfirmField(formIndex, field, value) {
    if (!this._formData) return;

    runInAction(() => {
      if (!Array.isArray(this._formData.confirms)) {
        this._formData.confirms = [];
      }

      while (this._formData.confirms.length <= formIndex) {
        this._formData.confirms.push({});
      }

      this._formData.confirms[formIndex] = {
        ...this._formData.confirms[formIndex],
        [field]: value
      };
    });
  }
}

const store = new DynamicFormStore();
context.wpm.export('store_dynamic_form', store);
</mo-ai-code>
```

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
  api,
  message
} = context;

const { Card, CardBody, Button, Tabs, Tab, useDisclosure } = NextUI;

const DynamicFormBasic = await context.wpm.import('comp_dynamic_form_basic');
const DynamicFormDetail = await context.wpm.import('comp_dynamic_form_detail');
const DynamicFormConfirm = await context.wpm.import('comp_dynamic_form_confirm');
const DynamicFormHistory = await context.wpm.import('comp_dynamic_form_history');
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormAdapter = observer(({
  config,
  formId,
  onSave,
  onError,
  readOnly = false,
  className
}) => {
  const [loading, setLoading] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("basic");
  const historyModal = useDisclosure();
  const saveButtonRef = React.useRef(null);

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

  // 修改: 优化保存逻辑，添加防重复提交
  const handleSave = async () => {
    if (loading || !saveButtonRef.current) return;

    try {
      saveButtonRef.current.disabled = true;
      setLoading(true);

      const success = await dynamicFormStore.saveFormData();
      if (success) {
        message.success('保存成功');
        onSave?.();
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
              />
            </Tab>
            <Tab
              key="detail"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:table-2-bold" />
                  <span>明细信息</span>
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
  cn
} = context;

const { Input, Textarea, Select, SelectItem } = NextUI;
const dynamicFormStore = await context.wpm.import('store_dynamic_form');

const DynamicFormBasic = observer(({
  config,
  readOnly = false
}) => {
  // 处理字段变更
  const handleFieldChange = (field, value) => {
    dynamicFormStore.updateBasicField(field.name, value);
  };

  // 渲染字段
  const renderField = (field) => {
    const value = dynamicFormStore.currentForm?.basic?.[field.name] || '';

    const commonProps = {
      key: field.name,
      label: field.label,
      name: field.name,
      value: value,
      isRequired: field.required,
      isReadOnly: readOnly,
      classNames: {
        label: "text-default-600",
        input: "text-default-800"
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
                  {form.fields.map((field) => (
                    <div key={field.name}>
                      <Input
                        label={field.label}
                        value={dynamicFormStore.currentForm?.confirms?.[index]?.[field.name] || ''}
                        isReadOnly={readOnly || dynamicFormStore.currentForm?.confirms?.[index]?.status === 'confirmed'}
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
      readOnly
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
    } catch (error) {
      api.log.error('渲染单元格失败', { error, columnKey, item });
      return '-';
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
                          onChange={(e) => handleFieldChange(column.key, e.target.value)}
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
<mo-ai-code type="component" name="comp_dynamic_form_print" title="动态表单打印组件">
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

  const totalAmount = form.detail?.reduce((sum, item) => {
    const amount = Number(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0) || 0;

  return (
    <div className="print-content p-8 bg-white">
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
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
            width: 210mm !important;
            margin: 0 auto !important;
          }
          .no-break {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{form.config.title}</h1>
        <div className="flex justify-between text-sm text-gray-500">
          <span>表单编号: {form.id}</span>
          <span>创建时间: {new Date(form.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="no-break">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {form.config.basic.fields.map((field) => (
              <div key={field.name} className={cn(
                "space-y-2",
                field.span === 'full' ? 'col-span-2' : ''
              )}>
                <p className="text-sm font-bold">{field.label}</p>
                <p className="font-medium border-b border-dotted pb-1">
                  {form.basic?.[field.name] || '-'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 明细信息 */}
        <div className="no-break">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
            {form.config.detail.title || '明细信息'}
          </h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-2">序号</th>
                {form.config.detail.columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "pb-2",
                      column.align === 'right' ? 'text-right' : 'text-left'
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.detail?.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="py-2">{index + 1}</td>
                  {form.config.detail.columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "py-2",
                        column.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      {column.type === 'money'
                        ? `¥${Number(item[column.key]).toFixed(2)}`
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="font-bold border-t">
                <td colSpan={2} className="pt-2">合计</td>
                <td
                  colSpan={form.config.detail.columns.length - 1}
                  className="pt-2 text-right"
                >
                  ¥{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <p className="text-lg">
              大写金额：
              <span className="font-bold underline">
                {numberToChinese(totalAmount)}
              </span>
            </p>
          </div>
        </div>

        {/* 确认信息 */}
        {form.confirms?.length > 0 && (
          <div className="no-break">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
              确认信息
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {form.confirms.map((confirm, index) => (
                <div key={index} className="border-2 rounded p-4">
                  <h3 className="font-bold mb-2">
                    {form.config.confirm.forms[index].title}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>确认人：{confirm.name || '-'}</p>
                    <p>联系电话：{confirm.phone || '-'}</p>
                    {confirm.note && <p>备注：{confirm.note}</p>}
                    {confirm.time && (
                      <p>确认时间：{new Date(confirm.time).toLocaleString()}</p>
                    )}
                    <p>状态：{
                      confirm.status === 'confirmed' ? '已确认' :
                      confirm.status === 'cancelled' ? '已取消' : '待确认'
                    }</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 签字区域 */}
        <div className="print-signature mt-8 pt-8 border-t-2 border-black no-break">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-bold mb-2">申请人签字：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2">审批人签字：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2">公司盖章：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        <p className="font-bold">本单据一式三联：白联存根、红联审批、蓝联申请</p>
        <p className="mt-1 text-gray-500">打印时间：{new Date().toLocaleString()}</p>
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

````jsx
<mo-ai-code type="markdown" name="doc_form_index_structure" title="表单索引结构说明文档">
# 表单索引结构说明文档

## 1. 索引数据结构

表单索引使用以下数据结构:

```typescript
interface FormIndex {
  // 表单基本信息
  formId: string;           // 表单唯一标识
  formType: string;         // 表单类型
  formName: string;         // 表单名称
  description?: string;     // 表单描述
  version: string;          // 表单版本号

  // 表单状态
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';  // 表单状态

  // 时间信息
  createdAt: string;        // 创建时间
  updatedAt: string;        // 更新时间

  // 创建者信息
  creator: {
    id: string;            // 创建者ID
    name: string;          // 创建者姓名
    role?: string;         // 创建者角色
  };

  // 表单结构信息
  structure: {
    basicFields: number;    // 基本信息字段数量
    detailColumns: number;  // 明细表格列数量
    confirmForms: number;   // 确认表单数量
  };
}
````

## 2. 索引存储说明

- 索引数据统一存储在元数据中
- 元数据名称格式: `${appId}_form_index`
- 元数据值为 FormIndex[] 类型的 JSON 字符串
- 每个表单创建时会添加一条索引记录
- 表单更新时会同步更新索引记录
- 表单删除时会删除对应的索引记录

## 3. 状态说明

表单状态包括:

| 状态      | 说明   | 触发条件             |
| --------- | ------ | -------------------- |
| draft     | 草稿   | 表单创建后的初始状态 |
| submitted | 已提交 | 用户提交表单后       |
| approved  | 已审批 | 审批人同意后         |
| rejected  | 已拒绝 | 审批人拒绝后         |
| pending   | 待确认 | 等待相关人员确认     |

## 4. 索引操作说明

### 4.1 创建索引

```typescript
// 创建新表单时自动创建索引
await formIndexStore.createFormIndex({
  id: "form_123",
  config: formConfig,
  creator: currentUser,
  status: "draft",
})
```

### 4.2 更新索引

```typescript
// 更新表单时同步更新索引
await formIndexStore.updateFormIndex({
  id: "form_123",
  status: "submitted",
  ...formData,
})
```

### 4.3 删除索引

```typescript
// 删除表单时删除对应索引
await formIndexStore.deleteFormIndex("form_123")
```

## 5. 索引查询说明

### 5.1 获取用户表单列表

```typescript
// 获取当前用户创建的所有表单
const userForms = await formListStore.loadUserForms()
```

### 5.2 索引字段过滤

可按以下字段进行过滤:

- formId: 表单ID
- formType: 表单类型
- status: 表单状态
- creator.id: 创建者ID

## 6. 注意事项

1. 索引更新

   - 表单任何状态变更都需要同步更新索引
   - 批量操作时需要保证索引数据一致性
   - 避免重复创建索引

2. 性能优化

   - 索引数据量较大时建议分页加载
   - 可以使用缓存优化查询性能
   - 定期清理无效索引数据

3. 错误处理
   - 索引操作失败时需要回滚表单操作
   - 定期检查索引完整性
   - 提供索引修复机制

## 7. 最佳实践

1. 创建表单时:

```typescript
// 1. 创建表单数据
const formId = await dynamicFormStore.createNewForm(config)

// 2. 索引会自动创建
// 3. 跳转到表单编辑页
navigate(`/form/${formId}`)
```

2. 更新表单时:

```typescript
// 1. 更新表单数据
await dynamicFormStore.saveFormData()

// 2. 索引会自动更新
// 3. 显示成功提示
message.success("保存成功")
```

3. 删除表单时:

```typescript
// 1. 删除表单索引
await dynamicFormStore.deleteForm(formId)

// 2. 更新列表
await formListStore.loadUserForms()
```

## 8. 开发建议

1. 数据一致性

   - 使用事务确保表单数据和索引同步
   - 定期校验数据一致性
   - 提供数据修复工具

2. 扩展性

   - 预留索引字段便于后续扩展
   - 使用统一的状态管理
   - 支持自定义索引规则

3. 安全性
   - 严格校验数据权限
   - 记录索引操作日志
   - 定期备份索引数据
     </mo-ai-code>

````

```jsx
<mo-ai-code type="module" name="module_form_config" title="动态表单配置">
const {
  wpm,
  api,
  appId
} = context;

// 动态表单配置
const formConfig = {
  // 表单标题和描述
  title: "设备维修申请单",
  description: "用于申请设备维修和记录维修过程",
  type: "maintenance",
  version: "1.0.0",

  // 基本信息配置
  basic: {
    fields: [
      {
        name: "title",
        label: "维修事由",
        type: "text",

        placeholder: "请简要描述维修原因",
        icon: "solar:document-text-bold"
      },
      {
        name: "deviceNo",
        label: "设备编号",
        type: "text",

        placeholder: "请输入设备编号",
        icon: "solar:hashtag-bold"
      },
      {
        name: "deviceName",
        label: "设备名称",
        type: "text",

        placeholder: "请输入设备名称",
        icon: "solar:widget-bold"
      },
      {
        name: "department",
        label: "所属部门",
        type: "select",

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

            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",

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

            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",

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

            icon: "solar:user-bold"
          },
          {
            name: "phone",
            label: "联系电话",
            type: "tel",

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
````

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

  // 从 location.state 中获取只读模式标志
  const readOnly = location.state?.readOnly ?? false;

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

const { useNavigate } = ReactRouterDom;
const { Button, Card, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } = NextUI;

const dynamicFormStore = await context.wpm.import('store_dynamic_form');
const formConfig = await context.wpm.import('module_form_config');
const DynamicFormAdapter = await context.wpm.import('comp_dynamic_form_adapter');
const DynamicFormPrint = await context.wpm.import('comp_dynamic_form_print');

// 导入 ReactToPrint
const { useReactToPrint } = await context.ReactToPrint;

const HomePage = observer(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [selectedForm, setSelectedForm] = React.useState(null);
  const deleteModal = useDisclosure();
  const viewModal = useDisclosure();
  const printModal = useDisclosure();
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

  const handleViewForm = async (formId) => {
    try {
      setLoading(true);
      const success = await dynamicFormStore.loadFormData(formId);
      if (success) {
        setSelectedForm(dynamicFormStore.currentForm);
        viewModal.onOpen();
      } else {
        message.error('表单不存在或已被删除');
      }
    } catch (error) {
      message.error('加载表单失败: ' + error.message);
      api.log.error('加载表单失败', { error, formId });
    } finally {
      setLoading(false);
    }
  };

  const handleEditForm = (formId) => {
    navigate(`/form/${formId}`);
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;

    try {
      setLoading(true);
      await dynamicFormStore.deleteForm(selectedForm.formId);
      message.success('删除表单成功');
      deleteModal.onClose();
      await loadUserForms(); // 重新加载列表
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

  const renderStatus = (status, confirmStatus) => {
    if (confirmStatus === 'completed') {
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
    }

    if (confirmStatus === 'pending') {
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
    }

    const statusMap = {
      draft: { label: '草稿', color: 'default', icon: 'solar:file-bold' },
      submitted: { label: '已提交', color: 'primary', icon: 'solar:check-square-bold' },
      approved: { label: '已审批', color: 'success', icon: 'solar:check-circle-bold' },
      rejected: { label: '已拒绝', color: 'danger', icon: 'solar:close-circle-bold' }
    };

    const statusInfo = statusMap[status] || { label: '未知', color: 'default', icon: 'solar:question-circle-bold' };

    return (
      <Chip
        size="sm"
        color={statusInfo.color}
        variant="flat"
        startContent={<Icon icon={statusInfo.icon} className={`text-${statusInfo.color}`} />}
      >
        {statusInfo.label}
      </Chip>
    );
  };

  // 定义表格列配置
  const columns = [
    {
      key: "formName",
      label: "表单名称",
    },
    {
      key: "description",
      label: "描述",
    },
    {
      key: "status",
      label: "状态",
    },
    {
      key: "createdAt",
      label: "创建时间",
    },
    {
      key: "updatedAt",
      label: "更新时间",
    },
    {
      key: "actions",
      label: "操作",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-300 to-blue-300 p-6">
      <div className="mx-auto max-w-6xl">
        <Card className="bg-background/60 backdrop-blur-md">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  我的表单
                </h1>
                <p className="mt-1 text-small text-foreground-500">
                  管理您创建的所有表单
                </p>
              </div>
              <Button
                color="primary"
                variant="shadow"
                startContent={<Icon icon="solar:add-circle-bold" />}
                isLoading={loading}
                onPress={handleCreateForm}
              >
                创建新表单
              </Button>
            </div>

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
                {columns.map((column) => (
                  <TableColumn
                    key={column.key}
                    align={column.key === "actions" ? "center" : "start"}
                  >
                    {column.label}
                  </TableColumn>
                ))}
              </TableHeader>
              <TableBody
                items={formItems}
                emptyContent={
                  <div className="text-center py-6">
                    <Icon
                      icon="solar:clipboard-bold"
                      className="mx-auto mb-2 h-8 w-8 text-default-400"
                    />
                    <p>暂无表单数据</p>
                    <p className="text-small text-default-400 mt-1">
                      点击"创建新表单"按钮创建您的第一个表单
                    </p>
                  </div>
                }
                isLoading={loading}
              >
                {(item) => (
                  <TableRow key={item.formId}>
                    {(columnKey) => (
                      <TableCell>
                        {columnKey === "formName" ? (
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:clipboard-bold"
                              className="text-primary"
                              width={20}
                            />
                            <span className="font-medium">{item.formName}</span>
                          </div>
                        ) : columnKey === "description" ? (
                          <span className="text-default-500">
                            {item.description || '-'}
                          </span>
                        ) : columnKey === "status" ? (
                          renderStatus(item.status, item.confirmStatus)
                        ) : columnKey === "createdAt" ? (
                          <div className="flex flex-col">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="text-tiny text-default-400">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : columnKey === "updatedAt" ? (
                          <div className="flex flex-col">
                            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                            <span className="text-tiny text-default-400">
                              {new Date(item.updatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : columnKey === "actions" ? (
                          <div className="flex justify-center gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleViewForm(item.formId)}
                            >
                              <Icon icon="solar:eye-bold" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditForm(item.formId)}
                            >
                              <Icon icon="solar:pen-bold" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => {
                                setSelectedForm(item);
                                deleteModal.onOpen();
                              }}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* 查看表单模态框 */}
      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
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
                <DynamicFormAdapter
                  config={formConfig}
                  formId={selectedForm?.id}
                  readOnly={true}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  startContent={<Icon icon="solar:printer-bold" />}
                  onPress={() => {
                    onClose();
                    printModal.onOpen();
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

      {/* 打印预览模态框 */}
      <Modal
        isOpen={printModal.isOpen}
        onOpenChange={printModal.onOpenChange}
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
                  onPress={handlePrint}
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

      {/* 删除确认模态框 */}
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
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
                  onPress={handleDeleteForm}
                  isLoading={loading}
                >
                  确认删除
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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

  // 不可变配置
  formPrefix = `${appId}_form`;

  constructor() {
    makeAutoObservable(this, {
      formPrefix: false
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
    return this._formData ? {
      ...this._formData,
      basic: formBasicStore.basicData,
      detail: formDetailStore.detailData,
      confirms: formConfirmStore.confirmData
    } : null;
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

  // 修复确认状态计算逻辑
  getConfirmStatus() {
    const confirms = formConfirmStore.confirmData;
    const config = this._formData?.config;

    // 如果没有确认数据或配置，返回待确认
    if (!confirms || !config?.confirm?.forms) {
      return 'pending';
    }

    // 获取需要确认的表单数量
    const requiredConfirmCount = config.confirm.forms.length;

    // 如果确认数据长度小于需要确认的数量，返回待确认
    if (confirms.length < requiredConfirmCount) {
      return 'pending';
    }

    // 检查是否所有需要的表单都已确认
    for (let i = 0; i < requiredConfirmCount; i++) {
      const confirmForm = confirms[i];
      // 如果任何一个表单未确认或已取消，返回待确认
      if (!confirmForm || confirmForm.status !== 'confirmed') {
        return 'pending';
      }
    }

    // 所有表单都已确认
    return 'completed';
  }

  // 加载用户表单列表
  async loadUserForms() {
    await formListStore.loadUserForms();
  }

  // 初始化新表单
  initNewForm(config) {
    runInAction(() => {
      this._formData = {
        config: config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    formBasicStore.initBasicData({});
    formDetailStore.initDetailData([]);
    formConfirmStore.initConfirmData([]);
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
      config: config,
      createdAt: now,
      updatedAt: now,
      creator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      status: 'pending',
      confirmStatus: 'pending' // 初始确认状态
    };

    try {
      // 保存表单数据
      await api.setMetadata(
        `${this.formPrefix}_${formId}`,
        formData
      );

      // 创建表单索引
      await formIndexStore.createFormIndex(formData);

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
        formType: formData.config?.type,
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

  // 保存表单数据时更新确认状态
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

    const formData = {
      ...this._formData,
      basic: formBasicStore.basicData,
      detail: formDetailStore.detailData,
      confirms: formConfirmStore.confirmData,
      confirmStatus, // 更新确认状态
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

      // 更新表单索引,包含新的确认状态
      await formIndexStore.updateFormIndex(formData);

      runInAction(() => {
        this._formData = formData;
      });

      api.log.info('保存表单数据成功', {
        formId,
        formType: formData.config?.type,
        confirmStatus
      });

      return true;
    } catch (error) {
      api.log.error('保存表单数据失败', { error, formId });
      throw error;
    }
  }

  // 删除表单 - 修改后只删除索引
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
    });

    formBasicStore.clearBasicData();
    formDetailStore.clearDetailData();
    formConfirmStore.clearConfirmData();
  }

  // 代理方法 - 基本信息
  updateBasicField(field, value) {
    formBasicStore.updateBasicField(field, value);
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
  api
} = context;

const { makeAutoObservable, computed } = mobx;

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
      return this._detailData.reduce((sum, item) => {
        const amount = Number(item.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
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

class FormIndexStore {
  constructor() {
    makeAutoObservable(this);
  }

  // 创建表单结构索引
  async createFormIndex(formData) {
    const indexData = {
      formId: formData.id,
      formType: formData.config?.type || 'default',
      formName: formData.config?.title || '未命名表单',
      description: formData.config?.description,
      version: formData.config?.version || '1.0.0',
      status: formData.status || 'pending',
      confirmStatus: formData.confirmStatus || 'pending', // 添加确认状态
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      creator: formData.creator,
      structure: {
        basicFields: formData.config?.basic?.fields?.length || 0,
        detailColumns: formData.config?.detail?.columns?.length || 0,
        confirmForms: formData.config?.confirm?.forms?.length || 0
      }
    };

    try {
      // 获取现有索引
      const existingResult = await api.getMetadata([`${appId}_form_index`]);
      let existingIndex = [];

      if (existingResult?.data?.[0]?.value) {
        existingIndex = JSON.parse(existingResult.data[0].value);
      }

      // 添加新表单索引
      const updatedIndex = Array.isArray(existingIndex) ?
        [...existingIndex, indexData] : [indexData];

      await api.setMetadata(
        `${appId}_form_index`,
        updatedIndex
      );

      api.log.info('创建表单索引成功', {
        formId: formData.id,
        formType: indexData.formType,
        status: indexData.status,
        confirmStatus: indexData.confirmStatus
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
      status: formData.status,
      confirmStatus: formData.confirmStatus, // 更新确认状态
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      creator: formData.creator,
      structure: {
        basicFields: formData.config?.basic?.fields?.length || 0,
        detailColumns: formData.config?.detail?.columns?.length || 0,
        confirmForms: formData.config?.confirm?.forms?.length || 0
      }
    };

    try {
      // 获取现有索引
      const existingResult = await api.getMetadata([`${appId}_form_index`]);
      let existingIndex = [];

      if (existingResult?.data?.[0]?.value) {
        existingIndex = JSON.parse(existingResult.data[0].value);
      }

      // 更新表单索引
      const updatedIndex = Array.isArray(existingIndex) ?
        existingIndex.map(item =>
          item.formId === formData.id ? indexData : item
        ) : [indexData];

      await api.setMetadata(
        `${appId}_form_index`,
        updatedIndex
      );

      api.log.info('更新表单索引成功', {
        formId: formData.id,
        formType: indexData.formType,
        status: indexData.status,
        confirmStatus: indexData.confirmStatus
      });

      return true;
    } catch (error) {
      api.log.error('更新表单索引失败', { error, formId: formData.id });
      throw error;
    }
  }

  // 删除表单索引
  async deleteFormIndex(formId) {
    try {
      // 获取现有索引
      const existingResult = await api.getMetadata([`${appId}_form_index`]);
      let existingIndex = [];

      if (existingResult?.data?.[0]?.value) {
        existingIndex = JSON.parse(existingResult.data[0].value);
      }

      // 删除表单索引
      const updatedIndex = Array.isArray(existingIndex) ?
        existingIndex.filter(item => item.formId !== formId) : [];

      await api.setMetadata(
        `${appId}_form_index`,
        updatedIndex
      );

      api.log.info('删除表单索引成功', { formId });
      return true;
    } catch (error) {
      api.log.error('删除表单索引失败', { error, formId });
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

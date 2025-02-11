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
  Icon,
  FramerMotion,
  message,
  api,
  mobx,
  appId,
  cn
} = context;

const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure } = NextUI;

// 导入组件
const OutsourceDashboard = await context.wpm.import('page_outsource_dashboard');
const Sidebar = await context.wpm.import('comp_sidebar');
const SidebarDrawer = await context.wpm.import('comp_sidebar_drawer');

const App = observer(() => {
  const {isOpen, onOpenChange} = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="flex h-screen w-full p-2">
        {/* 侧边栏 */}
        <SidebarDrawer
          className={cn("min-w-[288px] rounded-lg", {"min-w-[76px]": isCollapsed})}
          hideCloseButton={true}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <div
            className={cn(
              "will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width",
              {
                "w-[83px] items-center px-[6px] py-6": isCollapsed,
              },
            )}
          >
            <div
              className={cn("flex items-center gap-3 pl-2", {
                "justify-center gap-0 pl-0": isCollapsed,
              })}
            >
              <span
                className={cn("w-full text-small font-bold uppercase opacity-100", {
                  "w-0 opacity-0": isCollapsed,
                })}
              >
                委外加工管理系统
              </span>
              <div className={cn("flex-end flex", {hidden: isCollapsed})}>
                <Icon
                  className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                  icon="solar:round-alt-arrow-left-line-duotone"
                  width={24}
                  onClick={isMobile ? onOpenChange : onToggle}
                />
              </div>
            </div>
            <Spacer y={6} />
            <div className="flex items-center gap-3 px-3">
              <Avatar
                isBordered
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
              <div className={cn("flex max-w-full flex-col", {hidden: isCollapsed})}>
                <p className="text-small font-medium text-foreground">管理员</p>
                <p className="text-tiny font-medium text-default-400">系统管理员</p>
              </div>
            </div>

            <Spacer y={6} />

            <Sidebar
              defaultSelectedKey="dashboard"
              iconClassName="group-data-[selected=true]:text-default-50"
              isCompact={isCollapsed}
              items={[
                {
                  key: "dashboard",
                  title: "委外统计",
                  icon: "solar:chart-2-bold-duotone",
                  href: "/dashboard"
                },
                {
                  key: "plan",
                  title: "委外计划",
                  icon: "solar:calendar-bold-duotone",
                  href: "/plan"
                },
                {
                  key: "process",
                  title: "委外执行",
                  icon: "solar:widget-2-bold-duotone",
                  href: "/process"
                },
                {
                  key: "supplier",
                  title: "供应商管理",
                  icon: "solar:users-group-rounded-bold-duotone",
                  href: "/supplier"
                },
                {
                  key: "report",
                  title: "统计报表",
                  icon: "solar:document-bold-duotone",
                  href: "/report"
                }
              ]}
              itemClasses={{
                base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
                title: "group-data-[selected=true]:text-default-50",
              }}
            />

            <Spacer y={8} />

            <div
              className={cn("mt-auto flex flex-col", {
                "items-center": isCollapsed,
              })}
            >
              {isCollapsed && (
                <Button
                  isIconOnly
                  className="flex h-10 w-10 min-w-5 text-default-600"
                  size="sm"
                  variant="light"
                >
                  <Icon
                    className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                    height={24}
                    icon="solar:round-alt-arrow-right-line-duotone"
                    width={24}
                    onClick={onToggle}
                  />
                </Button>
              )}
              <NextUI.Tooltip content="帮助支持" isDisabled={!isCollapsed} placement="right">
                <Button
                  fullWidth
                  className={cn(
                    "justify-start truncate text-default-600 data-[hover=true]:text-foreground",
                    {
                      "justify-center": isCollapsed,
                    },
                  )}
                  isIconOnly={isCollapsed}
                  startContent={
                    isCollapsed ? null : (
                      <Icon
                        className="flex-none text-default-600"
                        icon="solar:info-circle-line-duotone"
                        width={24}
                      />
                    )
                  }
                  variant="light"
                >
                  {isCollapsed ? (
                    <Icon
                      className="text-default-500"
                      icon="solar:info-circle-line-duotone"
                      width={24}
                    />
                  ) : (
                    "帮助支持"
                  )}
                </Button>
              </NextUI.Tooltip>
              <NextUI.Tooltip content="退出登录" isDisabled={!isCollapsed} placement="right">
                <Button
                  className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                    "justify-center": isCollapsed,
                  })}
                  isIconOnly={isCollapsed}
                  startContent={
                    isCollapsed ? null : (
                      <Icon
                        className="flex-none rotate-180 text-default-500"
                        icon="solar:logout-3-bold-duotone"
                        width={24}
                      />
                    )
                  }
                  variant="light"
                >
                  {isCollapsed ? (
                    <Icon
                      className="rotate-180 text-default-500"
                      icon="solar:logout-3-bold-duotone"
                      width={24}
                    />
                  ) : (
                    "退出登录"
                  )}
                </Button>
              </NextUI.Tooltip>
            </div>
          </div>
        </SidebarDrawer>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="w-full">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<OutsourceDashboard />} />
              </Routes>
          </div>
        </div>
      </div>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_copy_text">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const CopyText = observer(({ children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      message.success("已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error("复制失败");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>{children}</span>
      <NextUI.Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleCopy}
      >
        <Icon
          className="text-default-400"
          icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"}
          width={16}
        />
      </NextUI.Button>
    </div>
  );
});

context.wpm.export('comp_copy_text', CopyText);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_outsource_form">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Chip, Spinner } = NextUI;
const outsourceStore = await context.wpm.import('store_outsource');
const outsourceModule = await context.wpm.import('module_outsource');

const OutsourceForm = observer(({
  isOpen,
  onOpenChange
}) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    productId: "",
    supplierId: "",
    planQuantity: "",
  });

  const [loadingData, setLoadingData] = React.useState(true);

  React.useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true);
        await outsourceStore.loadData();
      } catch (error) {
        console.error("Failed to load form data:", error);
        message.error("加载数据失败");
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      if (!outsourceModule.validateForm(formData)) {
        message.error('请填写完整信息');
        return;
      }

      setLoading(true);
      const success = await outsourceStore.createPlan(formData);
      if (success) {
        message.success('创建成功');
        onOpenChange(false);
        setFormData({
          productId: "",
          supplierId: "",
          planQuantity: "",
        });
      }
    } catch (error) {
      message.error('创建失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplier = outsourceStore.suppliers.find(s => s.id === formData.supplierId);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              新建委外计划
            </ModalHeader>
            <ModalBody>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner label="加载中..." />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Select
                    isRequired
                    label="选择产品"
                    placeholder="请选择产品"
                    selectedKeys={formData.productId ? [formData.productId] : []}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  >
                    {outsourceStore.products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="flex flex-col gap-2">
                    <Select
                      isRequired
                      label="选择加工单位"
                      placeholder="请选择加工单位"
                      selectedKeys={formData.supplierId ? [formData.supplierId] : []}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    >
                      {outsourceStore.suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id}
                          description={supplier.address}
                        >
                          <div className="flex items-center justify-between">
                            <span>{supplier.name}</span>
                            <div className="flex items-center gap-2">
                              <Chip size="sm" variant="flat">{supplier.contact}</Chip>
                              <Chip size="sm" variant="flat">{supplier.phone}</Chip>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>

                    {selectedSupplier && (
                      <div className="rounded-medium bg-default-100 p-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="text-default-500" icon="solar:map-point-bold-duotone" width={20} />
                            <span className="text-small">{selectedSupplier.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className="text-default-500" icon="solar:user-bold-duotone" width={20} />
                            <span className="text-small">{selectedSupplier.contact}</span>
                            <span className="text-small text-default-500">{selectedSupplier.phone}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {outsourceStore.suppliers.length === 0 && (
                      <div className="rounded-medium bg-danger-50 p-3">
                        <div className="flex items-center gap-2 text-danger">
                          <Icon icon="solar:danger-triangle-bold-duotone" width={20} />
                          <span className="text-small">未找到加工单位数据</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    isRequired
                    type="number"
                    label="计划数量"
                    placeholder="请输入计划数量"
                    value={formData.planQuantity}
                    onChange={(e) => setFormData({...formData, planQuantity: e.target.value})}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                isDisabled={loadingData || outsourceStore.suppliers.length === 0}
                onPress={handleSubmit}
              >
                创建
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_outsource_form', OutsourceForm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_outsource_table">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Chip, useDisclosure } = NextUI;
const outsourceStore = await context.wpm.import('store_outsource');
const OutsourceForm = await context.wpm.import('comp_outsource_form');

const OutsourceTable = observer(() => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const columns = [
    {
      key: "planNo",
      label: "计划编号"
    },
    {
      key: "productName",
      label: "产品名称"
    },
    {
      key: "productCode",
      label: "产品编码"
    },
    {
      key: "supplierName",
      label: "加工单位"
    },
    {
      key: "planQuantity",
      label: "计划数量"
    },
    {
      key: "completedQuantity",
      label: "完成数量"
    },
    {
      key: "qualifiedQuantity",
      label: "合格数量"
    },
    {
      key: "status",
      label: "状态"
    },
    {
      key: "actions",
      label: "操作"
    }
  ];

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "status":
        return (
          <Chip
            className="capitalize"
            color={item.status === "进行中" ? "warning" : item.status === "已完成" ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {item.status}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => console.log("查看详情", item.id)}
            >
              <Icon className="text-default-400" icon="solar:eye-bold-duotone" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => console.log("编辑", item.id)}
            >
              <Icon className="text-default-400" icon="solar:pen-bold-duotone" width={16} />
            </Button>
          </div>
        );
      default:
        return item[columnKey];
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">委外执行跟踪</h3>
        <Button
          color="primary"
          endContent={<Icon icon="solar:add-circle-bold-duotone" />}
          onPress={onOpen}
        >
          新建委外计划
        </Button>
      </div>

      <Table
        aria-label="委外数据表格"
        classNames={{
          wrapper: "max-h-[400px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={outsourceStore.tableData}
          emptyContent="暂无数据"
        >
          {(item) => (
            <TableRow key={item.id || item.planNo}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <OutsourceForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  );
});

context.wpm.export('comp_outsource_table', OutsourceTable);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_sidebar">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  ReactRouterDom,
  cn
} = context;

const { Accordion, AccordionItem, Listbox, Tooltip, ListboxItem, ListboxSection } = NextUI;
const { useLocation, useNavigate } = ReactRouterDom;

// 使用普通对象替代 enum
const SidebarItemType = {
  Nest: "nest"
};

const Sidebar = observer(({
  items,
  isCompact,
  defaultSelectedKey,
  onSelect,
  hideEndContent,
  sectionClasses: sectionClassesProp = {},
  itemClasses: itemClassesProp = {},
  iconClassName,
  classNames,
  className,
  ...props
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路由路径确定选中的菜单项
  const getSelectedKeyFromPath = () => {
    const path = location.pathname;
    let selectedKey = defaultSelectedKey;

    // 遍历所有菜单项查找匹配的路由
    const findMatchingItem = (items) => {
      for (const item of items) {
        if (item.href && path.startsWith(item.href)) {
          selectedKey = item.key;
          return true;
        }
        if (item.items) {
          const found = findMatchingItem(item.items);
          if (found) return true;
        }
      }
      return false;
    };

    findMatchingItem(items);
    return selectedKey;
  };

  const [selected, setSelected] = React.useState(getSelectedKeyFromPath());

  // 监听路由变化更新选中状态
  React.useEffect(() => {
    setSelected(getSelectedKeyFromPath());
  }, [location.pathname]);

  const sectionClasses = {
    ...sectionClassesProp,
    base: cn(sectionClassesProp?.base, "w-full", {
      "p-0 max-w-[44px]": isCompact,
    }),
    group: cn(sectionClassesProp?.group, {
      "flex flex-col gap-1": isCompact,
    }),
    heading: cn(sectionClassesProp?.heading, {
      hidden: isCompact,
    }),
  };

  const itemClasses = {
    ...itemClassesProp,
    base: cn(itemClassesProp?.base, {
      "w-11 h-11 gap-0 p-0": isCompact,
    }),
  };

  const renderNestItem = React.useCallback(
    (item) => {
      const isNestType =
        item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest;

      if (isNestType) {
        delete item.href;
      }

      return (
        <ListboxItem
          {...item}
          key={item.key}
          classNames={{
            base: cn(
              {
                "h-auto p-0": !isCompact && isNestType,
              },
              {
                "inline-block w-11": isCompact && isNestType,
              },
            ),
          }}
          endContent={isCompact || isNestType || hideEndContent ? null : item.endContent ?? null}
          startContent={
            isCompact || isNestType ? null : item.icon ? (
              <Icon
                className={cn(
                  "text-default-500 group-data-[selected=true]:text-foreground",
                  iconClassName,
                )}
                icon={item.icon}
                width={24}
              />
            ) : (
              item.startContent ?? null
            )
          }
          title={isCompact || isNestType ? null : item.title}
        >
          {isCompact ? (
            <Tooltip content={item.title} placement="right">
              <div className="flex w-full items-center justify-center">
                {item.icon ? (
                  <Icon
                    className={cn(
                      "text-default-500 group-data-[selected=true]:text-foreground",
                      iconClassName,
                    )}
                    icon={item.icon}
                    width={24}
                  />
                ) : (
                  item.startContent ?? null
                )}
              </div>
            </Tooltip>
          ) : null}
          {!isCompact && isNestType ? (
            <Accordion className={"p-0"}>
              <AccordionItem
                key={item.key}
                aria-label={item.title}
                classNames={{
                  heading: "pr-3",
                  trigger: "p-0",
                  content: "py-0 pl-4",
                }}
                title={
                  item.icon ? (
                    <div className={"flex h-11 items-center gap-2 px-2 py-1.5"}>
                      <Icon
                        className={cn(
                          "text-default-500 group-data-[selected=true]:text-foreground",
                          iconClassName,
                        )}
                        icon={item.icon}
                        width={24}
                      />
                      <span className="text-small font-medium text-default-500 group-data-[selected=true]:text-foreground">
                        {item.title}
                      </span>
                    </div>
                  ) : (
                    item.startContent ?? null
                  )
                }
              >
                {item.items && item.items?.length > 0 ? (
                  <Listbox
                    className={"mt-0.5"}
                    classNames={{
                      list: cn("border-l border-default-200 pl-4"),
                    }}
                    items={item.items}
                    variant="flat"
                  >
                    {item.items.map(renderItem)}
                  </Listbox>
                ) : (
                  renderItem(item)
                )}
              </AccordionItem>
            </Accordion>
          ) : null}
        </ListboxItem>
      );
    },
    [isCompact, hideEndContent, iconClassName, items],
  );

  const renderItem = React.useCallback(
    (item) => {
      const isNestType =
        item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest;

      if (isNestType) {
        return renderNestItem(item);
      }

      return (
        <ListboxItem
          {...item}
          key={item.key}
          endContent={isCompact || hideEndContent ? null : item.endContent ?? null}
          startContent={
            isCompact ? null : item.icon ? (
              <Icon
                className={cn(
                  "text-default-500 group-data-[selected=true]:text-foreground",
                  iconClassName,
                )}
                icon={item.icon}
                width={24}
              />
            ) : (
              item.startContent ?? null
            )
          }
          textValue={item.title}
          title={isCompact ? null : item.title}
        >
          {isCompact ? (
            <Tooltip content={item.title} placement="right">
              <div className="flex w-full items-center justify-center">
                {item.icon ? (
                  <Icon
                    className={cn(
                      "text-default-500 group-data-[selected=true]:text-foreground",
                      iconClassName,
                    )}
                    icon={item.icon}
                    width={24}
                  />
                ) : (
                  item.startContent ?? null
                )}
              </div>
            </Tooltip>
          ) : null}
        </ListboxItem>
      );
    },
    [isCompact, hideEndContent, iconClassName, itemClasses?.base],
  );

  const handleSelectionChange = (keys) => {
    const key = Array.from(keys)[0];
    setSelected(key);

    // 查找选中项的路由并导航
    const findItemByKey = (items, key) => {
      for (const item of items) {
        if (item.key === key) {
          return item;
        }
        if (item.items) {
          const found = findItemByKey(item.items, key);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedItem = findItemByKey(items, key);
    if (selectedItem?.href) {
      navigate(selectedItem.href);
    }

    onSelect?.(key);
  };

  return (
    <Listbox
      key={isCompact ? "compact" : "default"}
      hideSelectedIcon
      as="nav"
      className={cn("list-none", className)}
      classNames={{
        ...classNames,
        list: cn("items-center", classNames?.list),
      }}
      color="default"
      itemClasses={{
        ...itemClasses,
        base: cn(
          "px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100",
          itemClasses?.base,
        ),
        title: cn(
          "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
          itemClasses?.title,
        ),
      }}
      items={items}
      selectedKeys={[selected]}
      selectionMode="single"
      variant="flat"
      onSelectionChange={handleSelectionChange}
      {...props}
    >
      {(item) => {
        return item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest ? (
          renderNestItem(item)
        ) : item.items && item.items?.length > 0 ? (
          <ListboxSection
            key={item.key}
            classNames={sectionClasses}
            showDivider={isCompact}
            title={item.title}
          >
            {item.items.map(renderItem)}
          </ListboxSection>
        ) : (
          renderItem(item)
        );
      }}
    </Listbox>
  );
});

context.wpm.export('comp_sidebar', Sidebar);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_sidebar_drawer">
const {
  wpm,
  React,
  NextUI,
  observer,
  FramerMotion,
  cn
} = context;

// 自定义过渡动画常量
const TRANSITION_EASINGS = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1]
};

const { Drawer, DrawerBody, DrawerContent } = NextUI;

const SidebarDrawer = observer(({
  children,
  className,
  onOpenChange,
  isOpen,
  sidebarWidth = 288,
  classNames = {},
  sidebarPlacement = "left",
  motionProps: drawerMotionProps,
  ...props
}) => {
  const motionProps = React.useMemo(() => {
    if (!!drawerMotionProps && typeof drawerMotionProps === "object") {
      return drawerMotionProps;
    }

    return {
      variants: {
        enter: {
          x: 0,
          transition: {
            x: {
              duration: 0.3,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
        exit: {
          x: sidebarPlacement == "left" ? -sidebarWidth : sidebarWidth,
          transition: {
            x: {
              duration: 0.2,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
      },
    };
  }, [sidebarWidth, sidebarPlacement, drawerMotionProps]);

  return (
    <>
      <Drawer
        {...props}
        classNames={{
          ...classNames,
          wrapper: cn("!w-[var(--sidebar-width)]", classNames?.wrapper, {
            "!items-start !justify-start ": sidebarPlacement === "left",
            "!items-end !justify-end": sidebarPlacement === "right",
          }),
          base: cn(
            "w-[var(--sidebar-width)] !m-0 p-0 h-full max-h-full",
            classNames?.base,
            className,
            {
              "inset-y-0 left-0 max-h-[none] rounded-l-none !justify-start":
                sidebarPlacement === "left",
              "inset-y-0 right-0 max-h-[none] rounded-r-none !justify-end":
                sidebarPlacement === "right",
            },
          ),
          body: cn("p-0", classNames?.body),
          closeButton: cn("z-50", classNames?.closeButton),
        }}
        isOpen={isOpen}
        motionProps={motionProps}
        radius="none"
        scrollBehavior="inside"
        style={{
          "--sidebar-width": `${sidebarWidth}px`,
        }}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
      <div
        className={cn(
          "hidden h-full max-w-[var(--sidebar-width)] overflow-x-hidden overflow-y-scroll sm:flex",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
});

context.wpm.export('comp_sidebar_drawer', SidebarDrawer);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_stat_card" title="统计卡片">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;

const StatCard = observer(({
  title,
  value,
  unit,
  icon,
  trend
}) => {
  const getTrendIcon = () => {
    if (trend > 0) {
      return "solar:arrow-up-bold-duotone";
    } else if (trend < 0) {
      return "solar:arrow-down-bold-duotone";
    }
    return "solar:minus-circle-bold-duotone";
  };

  const getTrendColor = () => {
    if (trend > 0) {
      return "text-success";
    } else if (trend < 0) {
      return "text-danger";
    }
    return "text-default-500";
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-small font-medium text-default-500">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{value}</span>
              <span className="text-small text-default-400">{unit}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Icon
                className={cn("h-4 w-4", getTrendColor())}
                icon={getTrendIcon()}
              />
              <span className={cn("text-small", getTrendColor())}>
                {Math.abs(trend)}%
              </span>
              <span className="text-small text-default-400">
                较上月
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-default-100 p-2">
            <Icon
              className="h-6 w-6 text-default-500"
              icon={icon}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_stat_card', StatCard);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_switch_cell">
const {
  wpm,
  React,
  observer,
  NextUI,
  cn
} = context;

const { extendVariants, Switch } = NextUI;

const CustomSwitch = extendVariants(Switch, {
  variants: {
    color: {
      foreground: {
        wrapper: [
          "group-data-[selected=true]:bg-foreground",
          "group-data-[selected=true]:text-background",
        ],
      },
    },
  },
});

const SwitchCell = observer(({label, description, classNames, ...props}) => (
  <CustomSwitch
    classNames={{
      ...classNames,
      base: cn(
        "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
        "justify-between cursor-pointer rounded-medium gap-2 p-4",
        classNames?.base,
      ),
    }}
    {...props}
  >
    <div className="flex flex-col">
      <p className={cn("text-medium", classNames?.label)}>{label}</p>
      <p className={cn("text-small text-default-500", classNames?.description)}>{description}</p>
    </div>
  </CustomSwitch>
));

context.wpm.export('comp_switch_cell', SwitchCell);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_outsource">
const {
  wpm
} = context;

class OutsourceModule {
  generatePlanNo() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SCJH-${year}${month}${day}-${random}`;
  }

  validateForm(data) {
    return (
      data.productId &&
      data.supplierId &&
      data.planQuantity &&
      parseInt(data.planQuantity) > 0
    );
  }
}

const module = new OutsourceModule();
context.wpm.export('module_outsource', module);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="module_table_constants">
const {
  wpm
} = context;

// 列定义
const columns = [
  {
    key: "id",
    label: "ID"
  },
  {
    key: "name",
    label: "名称"
  },
  {
    key: "status",
    label: "状态"
  },
  {
    key: "createdAt",
    label: "创建时间"
  },
  {
    key: "actions",
    label: "操作"
  }
];

// 状态颜色映射
const statusColorMap = {
  active: "success",
  paused: "warning",
  deleted: "danger"
};

const constants = {
  columns,
  statusColorMap
};

context.wpm.export('module_table_constants', constants);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_outsource_dashboard" title="委外数据统计">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Progress } = NextUI;

const StatCard = await context.wpm.import('comp_stat_card');
const OutsourceTable = await context.wpm.import('comp_outsource_table');
const outsourceStore = await context.wpm.import('store_outsource');

const OutsourceDashboard = observer(() => {
  React.useEffect(() => {
    outsourceStore.loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">委外数据统计</h1>
        <p className="mt-1 text-small text-default-500">
          实时监控委外加工进度和质量数据
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="工序计划委外数量"
          value={outsourceStore.planCount}
          unit="件"
          icon="solar:factory-bold-duotone"
          trend={outsourceStore.planTrend}
        />
        <StatCard
          title="委外加工数量"
          value={outsourceStore.processCount}
          unit="件"
          icon="solar:widget-2-bold-duotone"
          trend={outsourceStore.processTrend}
        />
        <StatCard
          title="委外合格品数量"
          value={outsourceStore.qualifiedCount}
          unit="件"
          icon="solar:check-circle-bold-duotone"
          trend={outsourceStore.qualifiedTrend}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small font-medium">委外工序合格率</p>
                <p className="text-2xl font-semibold">{outsourceStore.qualifiedRate}%</p>
              </div>
              <Progress
                aria-label="合格率"
                classNames={{
                  base: "max-w-md",
                  track: "drop-shadow-md border border-default",
                  indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                  label: "tracking-wider font-medium text-default-600",
                  value: "text-foreground/60",
                }}
                value={outsourceStore.qualifiedRate}
                showValueLabel={true}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small font-medium">委外项目标准完成率</p>
                <p className="text-2xl font-semibold">{outsourceStore.completionRate}%</p>
              </div>
              <Progress
                aria-label="完成率"
                classNames={{
                  base: "max-w-md",
                  track: "drop-shadow-md border border-default",
                  indicator: "bg-gradient-to-r from-blue-500 to-cyan-500",
                  label: "tracking-wider font-medium text-default-600",
                  value: "text-foreground/60",
                }}
                value={outsourceStore.completionRate}
                showValueLabel={true}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <OutsourceTable />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_outsource_dashboard', OutsourceDashboard);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_outsource">
const {
  wpm,
  mobx,
  message,
  api
} = context;

const { makeAutoObservable } = mobx;
const outsourceModule = await context.wpm.import('module_outsource');

class OutsourceStore {
  // 统计数据
  planCount = 2820;
  processCount = 2150;
  qualifiedCount = 1850;

  // 趋势数据
  planTrend = 5.2;
  processTrend = 3.8;
  qualifiedTrend = 4.5;

  // 比率数据
  qualifiedRate = 100;
  completionRate = 65.6;

  // 表格数据
  tableData = [];

  // 产品列表
  products = [];

  // 供应商列表
  suppliers = [];

  constructor() {
    makeAutoObservable(this);
    // 初始化一些测试数据
    this.tableData = [
      {
        id: "test_1",
        planNo: outsourceModule.generatePlanNo(),
        productName: "测试产品1",
        productCode: "TEST-001",
        supplierName: "测试供应商1",
        planQuantity: 100,
        completedQuantity: 50,
        qualifiedQuantity: 45,
        status: "进行中"
      },
      {
        id: "test_2",
        planNo: outsourceModule.generatePlanNo(),
        productName: "测试产品2",
        productCode: "TEST-002",
        supplierName: "测试供应商2",
        planQuantity: 200,
        completedQuantity: 200,
        qualifiedQuantity: 190,
        status: "已完成"
      }
    ];
  }

  async loadData() {
    try {
      await Promise.all([
        this.loadTableData(),
        this.loadProducts(),
        this.loadSuppliers()
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("加载数据失败");
    }
  }

  async loadTableData() {
    try {
      const result = await api.getMetadata(['resource_1734924640937']);
      const dataJson = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : null;
      if (dataJson?.data) {
        const newData = dataJson.data.map(item => ({
          id: item.dataid || `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          planNo: outsourceModule.generatePlanNo(),
          productName: "镀锌铜钢圆钢",
          productCode: "BH-GW-R8",
          supplierName: item['加工单位'],
          planQuantity: 200,
          completedQuantity: 0,
          qualifiedQuantity: 0,
          status: "进行中"
        }));
        this.tableData = [...this.tableData, ...newData];
      }
    } catch (error) {
      console.error("Failed to load table data:", error);
      throw error;
    }
  }

  async loadProducts() {
    try {
      const result = await api.getMetadata(['resource_products']);
      const dataJson = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : null;
      if (dataJson?.data) {
        this.products = dataJson.data.map(item => ({
          id: item.dataid || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item['产品名称'] || '未知产品',
          code: item['产品型号'] || '-',
          price: item['单价'] || '0'
        }));
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      throw error;
    }
  }

  async loadSuppliers() {
    try {
      const result = await api.getMetadata(['resource_1734924640937']);
      const dataJson = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : null;
      if (dataJson?.data) {
        this.suppliers = dataJson.data.map(item => ({
          id: item.dataid || `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item['加工单位'] || '未知供应商',
          address: item['加工单位地址'] || '-',
          contact: item['联系人'] || '-',
          phone: item['联系人手机号'] || '-'
        }));
      }

      if (this.suppliers.length === 0) {
        console.warn("No suppliers loaded from resource_1734924640937");
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      throw error;
    }
  }

  async createPlan(data) {
    try {
      const product = this.products.find(p => p.id === data.productId);
      const supplier = this.suppliers.find(s => s.id === data.supplierId);

      if (!product || !supplier) {
        throw new Error("Invalid product or supplier");
      }

      const plan = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        planNo: outsourceModule.generatePlanNo(),
        productName: product.name,
        productCode: product.code,
        supplierName: supplier.name,
        planQuantity: parseInt(data.planQuantity),
        completedQuantity: 0,
        qualifiedQuantity: 0,
        status: "进行中",
        createdAt: new Date().toISOString()
      };

      // 保存到元数据
      await api.setMetadata(`plan_${plan.id}`, JSON.stringify(plan));

      // 更新本地数据
      this.tableData.unshift(plan);

      return true;
    } catch (error) {
      console.error("Failed to create plan:", error);
      throw error;
    }
  }

  setTableData(data) {
    this.tableData = data;
  }
}

const store = new OutsourceStore();
context.wpm.export('store_outsource', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_table">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class TableStore {
  items = [];

  constructor() {
    makeAutoObservable(this);

    // 初始化示例数据
    this.items = [
      {
        id: 1,
        name: "项目 A",
        status: "active",
        createdAt: "2024-01-01",
      },
      {
        id: 2,
        name: "项目 B",
        status: "paused",
        createdAt: "2024-01-15",
      },
      {
        id: 3,
        name: "项目 C",
        status: "deleted",
        createdAt: "2024-02-01",
      },
    ];
  }

  setItems(items) {
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }

  updateItem(id, data) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }
}

const store = new TableStore();
context.wpm.export('store_table', store);
</mo-ai-code>
```

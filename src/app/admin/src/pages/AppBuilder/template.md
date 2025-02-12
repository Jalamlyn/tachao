# 应用代码导出

## All Modules

```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } = NextUI;

// 导入页面组件
const ChatPage = await context.wpm.import('page_chat');
const UploadPage = await context.wpm.import('page_upload');

const App = observer(() => {
  const navigate = useNavigate();

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="min-h-screen bg-background">
        <Navbar>
          <NavbarBrand>
            <Icon icon="solar:calendar-bold-duotone" className="w-6 h-6 text-primary"/>
            <p className="font-bold text-inherit">考勤助手</p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
              <Link color="foreground" href="/chat">
                智能对话
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="/upload">
                数据上传
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        <main className="container mx-auto py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Routes>
        </main>
      </div>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
App.displayName = 'App';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_input" title="对话输入组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Input, Button } = NextUI;

const ChatInput = observer(({ onSend, loading }) => {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入问题,例如: 统计本月迟到情况..."
        className="flex-1"
        size="lg"
        endContent={
          <Button
            isIconOnly
            color="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSend}
          >
            <Icon icon="solar:arrow-up-linear" className="w-4 h-4" />
          </Button>
        }
      />
    </div>
  );
});

context.wpm.export('comp_chat_input', ChatInput);
ChatInput.displayName = 'ChatInput';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_message" title="对话消息组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Avatar, Card, CardBody, Chip } = NextUI;
const { motion } = FramerMotion;

const ChatMessage = observer(({ message, isAi }) => {
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    let interval;
    if (message.phase === 'thinking' || message.phase === 'answering') {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    }
    return () => clearInterval(interval);
  }, [message.phase]);

  const hasError = message.error && message.errorMessage;
  const isLoading = message.phase === 'thinking' || message.phase === 'answering';

  return (
    <div className={cn("flex gap-3 mb-4", {
      "justify-end": !isAi
    })}>
      {isAi && (
        <Avatar
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=34&h=34"
          size="sm"
          className="flex-shrink-0"
        />
      )}
      <div className={cn("flex flex-col max-w-[80%]", {
        "items-end": !isAi
      })}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn("mb-1", {
            "bg-primary text-white": !isAi,
            "bg-default-100": isAi
          })}>
            <CardBody className="py-2 px-3">
              <p className="text-sm whitespace-pre-wrap">
                {isLoading ? `${message.content || '思考中'}${dots}` : message.content}
              </p>
              {message.stats && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip color="success" variant="flat" size="sm">
                    正常: {message.stats.normal}
                  </Chip>
                  <Chip color="warning" variant="flat" size="sm">
                    迟到: {message.stats.late}
                  </Chip>
                  <Chip color="danger" variant="flat" size="sm">
                    早退: {message.stats.early}
                  </Chip>
                  <Chip color="danger" variant="flat" size="sm">
                    缺勤: {message.stats.absent}
                  </Chip>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {hasError && (
          <motion.div
            className="mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Chip
              variant="flat"
              color="danger"
              size="sm"
              startContent={
                <Icon
                  icon="solar:danger-triangle-bold-duotone"
                  className="w-3 h-3"
                />
              }
            >
              {message.errorMessage}
            </Chip>
          </motion.div>
        )}

        <div className="mt-1 flex items-center gap-2">
          <time className="text-xs text-default-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </time>
        </div>
      </div>
      {!isAi && (
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=34&h=34"
          size="sm"
          className="flex-shrink-0"
        />
      )}
    </div>
  );
});

context.wpm.export('comp_chat_message', ChatMessage);
ChatMessage.displayName = 'ChatMessage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_data_preview" title="数据预览组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card } = NextUI;

const DataPreview = observer(({ data, onImport, loading }) => {
  if (!data) return null;

  return (
    <Card className="mt-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">数据预览</h3>
            <p className="text-small text-default-500">
              共 {data.total} 条记录
            </p>
          </div>
          <Button
            color="primary"
            onPress={onImport}
            isLoading={loading}
            startContent={
              <Icon icon="solar:import-bold-duotone" className="w-4 h-4" />
            }
          >
            导入数据
          </Button>
        </div>

        <Table
          aria-label="考勤数据预览"
          classNames={{
            wrapper: "max-h-[400px]"
          }}
        >
          <TableHeader>
            {data.headers.map((header, index) => (
              <TableColumn key={index}>{header}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});

context.wpm.export('comp_data_preview', DataPreview);
DataPreview.displayName = 'DataPreview';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_upload_excel" title="Excel上传组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Card, CardBody, Button, Progress } = NextUI;
const { motion } = FramerMotion;

// 导入工具
const excelUtils = await context.wpm.import('utils_excel');

const UploadExcel = observer(({ onUpload }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      message.error('请上传Excel文件(.xlsx或.xls)');
      return;
    }

    try {
      setUploadStatus({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      api.log.info('开始处理Excel文件', {
        fileName: file.name,
        fileSize: file.size
      });

      // 转换为CSV
      const { headers, rows, csv } = await excelUtils.excelToCSV(file);

      // 上传文件
      const result = await api.upload.uploadFile(file, {
        onProgress: (percent) => {
          setUploadStatus(prev => ({
            ...prev,
            progress: percent
          }));
        },
        maxSize: 10 * 1024 * 1024
      });

      setUploadStatus(prev => ({
        ...prev,
        status: 'success',
        fileUrl: result.fileUrl
      }));

      if (onUpload) {
        onUpload({
          ...result,
          headers,
          rows,
          csv
        });
      }

      message.success('文件上传成功');
      api.log.info('文件处理完成', {
        fileName: file.name,
        headers,
        rowCount: rows.length
      });

    } catch (error) {
      api.log.error('文件处理失败', {
        error: error.message,
        fileName: file.name
      });

      setUploadStatus(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));

      message.error('文件上传失败: ' + error.message);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      excelUtils.generateTemplate();
      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button
          color="primary"
          variant="flat"
          startContent={
            <Icon icon="solar:download-square-bold-duotone" className="w-4 h-4" />
          }
          onPress={handleDownloadTemplate}
        >
          下载模板
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
      />

      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging ? "border-primary" : "border-default-200",
          uploadStatus?.status === 'uploading' ? "opacity-50" : ""
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardBody className="py-8">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{
                scale: isDragging ? 1.1 : 1
              }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Icon
                icon="solar:file-text-bold-duotone"
                className="w-8 h-8 text-primary"
              />
            </motion.div>

            <div className="text-center">
              <p className="text-default-700 mb-1">
                拖拽Excel文件到这里,或者
                <Button
                  variant="light"
                  color="primary"
                  className="px-1"
                  onClick={() => fileInputRef.current?.click()}
                  isDisabled={uploadStatus?.status === 'uploading'}
                >
                  点击上传
                </Button>
              </p>
              <p className="text-small text-default-500">
                支持 .xlsx, .xls 格式,最大10MB
              </p>
            </div>

            {uploadStatus && (
              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon="solar:file-bold-duotone"
                    className="w-4 h-4 text-default-500"
                  />
                  <span className="text-small text-default-700">
                    {uploadStatus.fileName}
                  </span>
                  {uploadStatus.status === 'success' && (
                    <Icon
                      icon="solar:check-circle-bold-duotone"
                      className="w-4 h-4 text-success"
                    />
                  )}
                  {uploadStatus.status === 'error' && (
                    <Icon
                      icon="solar:danger-circle-bold-duotone"
                      className="w-4 h-4 text-danger"
                    />
                  )}
                </div>

                {uploadStatus.status === 'uploading' && (
                  <Progress
                    size="sm"
                    value={uploadStatus.progress}
                    color="primary"
                    className="max-w-md"
                  />
                )}

                {uploadStatus.status === 'error' && (
                  <p className="text-small text-danger">
                    {uploadStatus.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('comp_upload_excel', UploadExcel);
UploadExcel.displayName = 'UploadExcel';
</mo-ai-code>
```

```jsx
<mo-ai-code type="markdown" name="readme" title="应用说明文档">
# 多页应用说明文档

## 简介
这是一个使用 AI 助手创建的多页应用程序。该应用采用现代化的技术栈和组件库,提供了良好的用户界面和交互体验。

## 功能特性
- 路由系统:使用 React Router 进行页面导航
- 响应式设计:适配不同屏幕尺寸
- 现代化UI:使用 NextUI 组件库
- 状态管理:采用 MobX 进行状态管理

## 项目结构
```

└── App.jsx # 应用入口(包含路由配置和主要内容)

```

## 开发指南
1. 使用 AI 助手:
   - 在左侧输入您的需求
   - AI 将帮助您开发新功能或修改现有功能

2. 自定义开发:
   - 遵循 React 最佳实践
   - 使用 NextUI 组件库构建界面
   - 使用 MobX 进行状态管理

## 技术栈
- React
- NextUI
- React Router
- MobX
- Tailwind CSS

## 集成说明
- 此多页应用支持集成单页应用模块
- 可以通过导入单页应用组件来扩展功能

## 后续计划
- 添加更多功能模块
- 优化用户体验
- 完善文档说明

## 贡献指南
欢迎提供建议和反馈,一起改进这个应用!
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_chat" title="对话页面">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Card, CardBody } = NextUI;

// 导入组件
const ChatInput = await context.wpm.import('comp_chat_input');
const ChatMessage = await context.wpm.import('comp_chat_message');
const chatStore = await context.wpm.import('store_chat');

const ChatPage = observer(() => {
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatStore.messages]);

  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <Icon icon="solar:calendar-bold-duotone" className="w-8 h-8 text-primary"/>
        <div>
          <h1 className="text-xl font-bold">考勤助手</h1>
          <p className="text-small text-default-500">AI驱动的考勤管理工具</p>
        </div>
      </div>

      <Card className="flex-1 mb-4">
        <CardBody className="p-4 overflow-y-auto">
          {chatStore.messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isAi={message.role === 'ai'}
            />
          ))}
          <div ref={messagesEndRef} />
        </CardBody>
      </Card>

      <ChatInput
        onSend={chatStore.sendMessage}
        loading={chatStore.loading}
      />
    </div>
  );
});

context.wpm.export('page_chat', ChatPage);
ChatPage.displayName = 'ChatPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_upload" title="数据上传页面">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Card, CardBody } = NextUI;

// 导入组件
const UploadExcel = await context.wpm.import('comp_upload_excel');
const DataPreview = await context.wpm.import('comp_data_preview');
const chatStore = await context.wpm.import('store_chat');

const UploadPage = observer(() => {
  const handleUpload = async (fileInfo) => {
    try {
      api.log.info('处理上传文件', {
        fileName: fileInfo.fileName,
        rowCount: fileInfo.rows.length
      });

      // 更新CSV数据到chatStore
      chatStore.setCSVData(fileInfo.csv);

    } catch (error) {
      api.log.error('处理上传文件失败', {
        error: error.message,
        fileName: fileInfo.fileName
      });
      message.error('处理文件失败: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">上传考勤数据</h1>
        <p className="text-default-500">
          上传Excel格式的考勤记录,支持批量导入
        </p>
      </div>

      <div className="grid gap-6">
        <UploadExcel onUpload={handleUpload} />

        <div className="bg-default-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Excel格式说明</h3>
          <ul className="list-disc list-inside space-y-1 text-small text-default-500">
            <li>文件格式:.xlsx 或 .xls</li>
            <li>必填字段:员工ID、姓名、日期、签到时间、签退时间</li>
            <li>日期格式:YYYY-MM-DD</li>
            <li>时间格式:HH:mm</li>
            <li>可选字段:备注</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

context.wpm.export('page_upload', UploadPage);
UploadPage.displayName = 'UploadPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_attendance" title="考勤数据服务">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

class AttendanceService {
  // 元数据键名
  static METADATA_KEY = `${appId}_attendance_records`;

  // 保存考勤记录
  async saveRecords(records) {
    try {
      api.log.info('开始保存考勤记录', {
        recordCount: records.length
      });

      await api.setMetadata(AttendanceService.METADATA_KEY, {
        records,
        updatedAt: new Date().toISOString()
      });

      api.log.info('考勤记录保存成功');
      return true;
    } catch (error) {
      api.log.error('保存考勤记录失败', {
        error: error.message
      });
      throw error;
    }
  }

  // 获取考勤记录
  async getRecords() {
    try {
      api.log.info('开始获取考勤记录');

      const result = await api.getMetadata([AttendanceService.METADATA_KEY]);
      const data = result.data?.[0]?.value;

      if (!data) {
        api.log.info('没有找到考勤记录');
        return [];
      }

      api.log.info('成功获取考勤记录', {
        recordCount: data.records?.length
      });

      return data.records || [];
    } catch (error) {
      api.log.error('获取考勤记录失败', {
        error: error.message
      });
      throw error;
    }
  }

  // 统计考勤数据
  async getStats(startDate, endDate) {
    try {
      const records = await this.getRecords();

      api.log.info('开始统计考勤数据', {
        startDate,
        endDate,
        totalRecords: records.length
      });

      const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
      });

      const stats = {
        total: filteredRecords.length,
        normal: filteredRecords.filter(r => r.status === 'normal').length,
        late: filteredRecords.filter(r => r.status === 'late').length,
        early: filteredRecords.filter(r => r.status === 'early').length,
        absent: filteredRecords.filter(r => r.status === 'absent').length,
        period: {
          start: startDate,
          end: endDate
        }
      };

      api.log.info('考勤统计完成', { stats });
      return stats;
    } catch (error) {
      api.log.error('统计考勤数据失败', {
        error: error.message
      });
      throw error;
    }
  }

  // 解析Excel数据
  parseExcelData(data) {
    try {
      api.log.info('开始解析Excel数据', {
        rowCount: data.length
      });

      const records = data.map((row, index) => {
        // 检查数据格式
        if (!row.date || !row.employeeId || !row.employeeName) {
          throw new Error(`第${index + 1}行数据格式不正确`);
        }

        // 处理考勤状态
        let status = 'normal';
        if (!row.checkIn && !row.checkOut) {
          status = 'absent';
        } else if (this.isLate(row.checkIn)) {
          status = 'late';
        } else if (this.isEarly(row.checkOut)) {
          status = 'early';
        }

        return {
          id: `${row.employeeId}_${row.date}`,
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          date: row.date,
          checkIn: row.checkIn || '',
          checkOut: row.checkOut || '',
          status,
          remark: row.remark || ''
        };
      });

      api.log.info('Excel数据解析完成', {
        recordCount: records.length
      });

      return records;
    } catch (error) {
      api.log.error('解析Excel数据失败', {
        error: error.message
      });
      throw error;
    }
  }

  // 判断是否迟到
  isLate(checkInTime) {
    if (!checkInTime) return false;
    const [hours, minutes] = checkInTime.split(':').map(Number);
    return hours > 9 || (hours === 9 && minutes > 0);
  }

  // 判断是否早退
  isEarly(checkOutTime) {
    if (!checkOutTime) return false;
    const [hours, minutes] = checkOutTime.split(':').map(Number);
    return hours < 18 || (hours === 18 && minutes < 0);
  }
}

const attendanceService = new AttendanceService();
context.wpm.export('service_attendance', attendanceService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_attendance" title="考勤数据管理">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { makeAutoObservable, runInAction } = mobx;

// 导入服务
const attendanceService = await context.wpm.import('service_attendance');

class AttendanceStore {
  records = [];
  loading = false;
  uploadStatus = null;
  previewData = null;
  stats = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeData();
  }

  // 初始化数据
  async initializeData() {
    try {
      this.loading = true;
      const records = await attendanceService.getRecords();

      runInAction(() => {
        this.records = records;
        this.updateStats();
      });

      api.log.info('考勤数据初始化完成', {
        recordCount: records.length
      });
    } catch (error) {
      api.log.error('考勤数据初始化失败', {
        error: error.message
      });
      message.error('数据加载失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // 更新统计数据
  async updateStats() {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const stats = await attendanceService.getStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      runInAction(() => {
        this.stats = stats;
      });

      api.log.info('统计数据更新完成', { stats });
    } catch (error) {
      api.log.error('更新统计数据失败', {
        error: error.message
      });
    }
  }

  // 处理文件上传
  async handleFileUpload(file) {
    try {
      this.loading = true;
      this.uploadStatus = {
        status: 'uploading',
        progress: 0
      };

      api.log.info('开始上传文件', {
        fileName: file.name,
        fileSize: file.size
      });

      // 上传文件
      const fileInfo = await api.upload.uploadFile(file, {
        onProgress: (percent) => {
          runInAction(() => {
            this.uploadStatus.progress = percent;
          });
        },
        maxSize: 10 * 1024 * 1024 // 10MB
      });

      // 读取Excel数据
      const workbook = await xlsx.read(await file.arrayBuffer());
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // 解析数据
      const records = attendanceService.parseExcelData(data);

      // 保存记录
      await attendanceService.saveRecords(records);

      runInAction(() => {
        this.records = records;
        this.previewData = {
          headers: ['员工ID', '姓名', '日期', '签到时间', '签退时间', '状态', '备注'],
          rows: records.map(r => [
            r.employeeId,
            r.employeeName,
            r.date,
            r.checkIn,
            r.checkOut,
            r.status,
            r.remark
          ]),
          total: records.length
        };
        this.uploadStatus = {
          status: 'success',
          fileUrl: fileInfo.fileUrl
        };
      });

      await this.updateStats();
      message.success('数据导入成功');

      api.log.info('文件处理完成', {
        recordCount: records.length,
        fileUrl: fileInfo.fileUrl
      });

    } catch (error) {
      api.log.error('文件处理失败', {
        error: error.message
      });

      runInAction(() => {
        this.uploadStatus = {
          status: 'error',
          error: error.message
        };
      });

      message.error('数据导入失败: ' + error.message);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // 下载模板
  downloadTemplate() {
    try {
      api.log.info('开始生成模板数据');

      const templateData = [
        {
          employeeId: 'EMP001',
          employeeName: '张三',
          date: '2023-12-25',
          checkIn: '09:00',
          checkOut: '18:00',
          remark: '正常出勤'
        },
        {
          employeeId: 'EMP002',
          employeeName: '李四',
          date: '2023-12-25',
          checkIn: '09:30',
          checkOut: '18:00',
          remark: '迟到'
        }
      ];

      const ws = xlsx.utils.json_to_sheet(templateData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '考勤记录');

      // 设置列宽
      ws['!cols'] = [
        { wch: 10 }, // employeeId
        { wch: 10 }, // employeeName
        { wch: 12 }, // date
        { wch: 8 },  // checkIn
        { wch: 8 },  // checkOut
        { wch: 20 }  // remark
      ];

      xlsx.writeFile(wb, '考勤记录模板.xlsx');
      api.log.info('模板下载完成');

    } catch (error) {
      api.log.error('下载模板失败', {
        error: error.message
      });
      message.error('下载模板失败');
    }
  }

  // 获取考勤统计
  getAttendanceStats = async (startDate, endDate) => {
    try {
      return await attendanceService.getStats(startDate, endDate);
    } catch (error) {
      api.log.error('获取考勤统计失败', {
        error: error.message,
        startDate,
        endDate
      });
      throw error;
    }
  }
}

const attendanceStore = new AttendanceStore();
context.wpm.export('store_attendance', attendanceStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_chat" title="对话状态管理">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { makeAutoObservable, runInAction } = mobx;

class ChatStore {
  messages = [];
  loading = false;
  calculating = false;
  messageIdCounter = 0;
  csvData = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCSVData = (csv) => {
    this.csvData = csv;
    api.log.info('更新CSV数据', {
      dataLength: csv?.length
    });
  }

  generateMessageId = () => {
    return `msg_${Date.now()}_${this.messageIdCounter++}`;
  }

  addMessage = (message) => {
    const messageId = this.generateMessageId();
    this.messages.push({
      ...message,
      id: messageId,
      timestamp: new Date().toISOString()
    });

    api.log.info('添加新消息', {
      messageId,
      role: message.role,
      phase: message.phase
    });

    return messageId;
  }

  updateMessage = (messageId, updates) => {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        ...updates
      };

      api.log.info('更新消息', {
        messageId,
        updates: Object.keys(updates)
      });
    }
  }

  sendMessage = async (content) => {
    try {
      this.loading = true;

      api.log.info('发送新消息', { content });

      // 添加用户消息
      const userMessageId = this.addMessage({
        role: 'user',
        content,
        phase: 'completed'
      });

      // 添加AI消息
      const aiMessageId = this.addMessage({
        role: 'ai',
        content: '',
        phase: 'thinking'
      });

      this.calculating = true;

      await ai.chat([
        {
          role: 'system',
          content: `你是一个考勤分析助手,可以分析考勤数据并回答问题。
${this.csvData ? `当前考勤数据(CSV格式):\n${this.csvData}` : '当前没有考勤数据可供分析。'}`
        },
        {
          role: 'user',
          content
        }
      ], {
        onChunk: (chunk) => {
          runInAction(() => {
            api.log.info('收到AI响应chunk', {
              chunk: chunk.slice(0, 100),
              messageId: aiMessageId
            });

            const currentMessage = this.messages.find(m => m.id === aiMessageId);
            const newContent = (currentMessage?.content || '') + chunk;

            this.updateMessage(aiMessageId, {
              content: newContent,
              phase: 'answering'
            });
          });
        },
        onResult: () => {
          api.log.info('AI对话完成', {
            messageId: aiMessageId
          });

          runInAction(() => {
            this.calculating = false;
            this.updateMessage(aiMessageId, {
              phase: 'completed'
            });
          });
        },
        onError: (error) => {
          api.log.error('AI 对话失败', {
            error: error.message,
            messageId: aiMessageId
          });

          runInAction(() => {
            this.updateMessage(aiMessageId, {
              error: true,
              errorMessage: error.message,
              phase: 'error'
            });
            this.calculating = false;
          });
        }
      });

    } catch (error) {
      api.log.error('发送消息失败', {
        error: error.message,
        userMessage: content
      });
      message.error('发送消息失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}

const chatStore = new ChatStore();
context.wpm.export('store_chat', chatStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_attendance" title="考勤类型定义">
// 考勤记录类型
type AttendanceRecord = {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'normal' | 'late' | 'early' | 'absent'
  remark?: string
}

// 考勤统计类型
type AttendanceStats = {
  total: number
  normal: number
  late: number
  early: number
  absent: number
  period: {
    start: string
    end: string
  }
}

// 上传状态类型
type UploadStatus = {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  fileUrl?: string
}

// 预览数据类型
type PreviewData = {
  headers: string[]
  rows: any[]
  total: number
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="utils" name="utils_excel" title="Excel工具模块">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

// Excel转CSV
const excelToCSV = async (file) => {
  try {
    api.log.info('开始转换Excel到CSV', {
      fileName: file.name,
      fileSize: file.size
    });

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 获取数据范围
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const headers = [];
    const rows = [];

    // 读取表头
    for(let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[xlsx.utils.encode_cell({r: 0, c: C})];
      headers.push(cell?.v || `Column${C + 1}`);
    }

    // 读取数据行
    for(let R = range.s.r + 1; R <= range.e.r; ++R) {
      const row = [];
      for(let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[xlsx.utils.encode_cell({r: R, c: C})];
        row.push(cell?.v || '');
      }
      rows.push(row);
    }

    // 生成CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    api.log.info('Excel转CSV成功', {
      headers,
      rowCount: rows.length
    });

    return {
      headers,
      rows,
      csv: csvContent
    };

  } catch (error) {
    api.log.error('Excel转CSV失败', {
      error: error.message,
      fileName: file.name
    });
    throw error;
  }
};

// 生成模板
const generateTemplate = () => {
  try {
    api.log.info('开始生成考勤模板');

    const template = [
      ['员工ID', '姓名', '日期', '签到时间', '签退时间', '备注'],
      ['EMP001', '张三', '2023-12-25', '09:00', '18:00', '正常出勤'],
      ['EMP002', '李四', '2023-12-25', '09:30', '18:00', '迟到']
    ];

    const ws = xlsx.utils.aoa_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, '考勤记录');

    // 设置列宽
    ws['!cols'] = [
      { wch: 10 }, // 员工ID
      { wch: 10 }, // 姓名
      { wch: 12 }, // 日期
      { wch: 10 }, // 签到时间
      { wch: 10 }, // 签退时间
      { wch: 20 }  // 备注
    ];

    xlsx.writeFile(wb, '考勤记录模板.xlsx');
    api.log.info('模板生成成功');

  } catch (error) {
    api.log.error('生成模板失败', {
      error: error.message
    });
    throw error;
  }
};

context.wpm.export('utils_excel', {
  excelToCSV,
  generateTemplate
});
</mo-ai-code>
```

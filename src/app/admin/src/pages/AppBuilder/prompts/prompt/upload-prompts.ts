export const UPLOAD_PROMPTS = {
  uploadPrompt: {
    getUploadPrompt() {
      return `
系统提供了以下文件上传API，你可以用它们来实现文件上传相关功能：

1. 文件上传API说明：
api.upload = {
  // 获取上传签名URL
  getSignedUrl: (fileName: string) => Promise<{
    formUploadHost: string;
    fileKey: string;
    accessKeyId: string;
    policy: string;
    signature: string;
  }>,
  
  // 创建文件活动记录
  createActivity: (fileInfo: { 
    fileName: string; 
    fileKey: string 
  }) => Promise<any>,
  
  // 查询文件活动记录
  queryActivity: () => Promise<{
    data: Array<{
      createdAt: string;
      files: Array<{
        fileName: string;
        downloadUrl: string;
        fileKey: string;
        type?: string;
      }>;
    }>;
  }>,
  
  // 上传文件(主要API)
  uploadFile: (
    file: File,
    options?: {
      // 上传进度回调
      onProgress?: (percent: number) => void;
      // 最大文件大小(字节)
      maxSize?: number;
      // 自定义上传请求
      customRequest?: (params: {
        file: File;
        onProgress: (percent: number) => void;
      }) => Promise<any>;
    }
  ) => Promise<{
    fileName: string;
    downloadUrl: string;
    fileKey: string;
    type?: string;
  }>
}

2. 使用示例：

\`\`\`jsx
const { 
  React,
  NextUI,
  api,
  message 
} = context;

const { Button } = NextUI;

const FileUploadDemo = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      
      const result = await api.upload.uploadFile(file, {
        // 显示上传进度
        onProgress: (percent) => {
          setProgress(percent);
        },
        // 设置最大文件大小(这里设置为10MB)
        maxSize: 10 * 1024 * 1024,
      });
      
      setFileInfo(result);
      message.success("文件上传成功");
      
    } catch (error) {
      message.error(error.message || "上传失败");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      
      <Button
        as="label"
        htmlFor="file-upload"
        color="primary"
        isLoading={uploading}
      >
        {uploading ? \`上传中 \${progress}%\` : "选择文件"}
      </Button>
      
      {fileInfo && (
        <div className="text-sm">
          <p>文件名：{fileInfo.fileName}</p>
          <p>下载链接：
            <a 
              href={fileInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              点击下载
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
\`\`\`

3. 注意事项：
- 使用前需要从context中解构api对象
- 所有上传API都封装在api.upload命名空间下
- uploadFile是主要的上传方法，支持进度回调和自定义上传
- 默认使用OSS表单上传，支持自定义上传方式
- 上传完成后会自动创建活动记录并返回文件信息

4. 常见使用场景：
- 文件上传组件
- 图片上传预览
- 文档管理系统
- 头像上传
- 附件上传

5. 错误处理：
- 文件大小超限
- 网络错误
- 服务器错误
- 文件信息不完整
建议使用try-catch捕获并处理这些错误

6. 最佳实践：
- 总是显示上传进度
- 优雅处理错误情况
- 提供文件大小限制
- 支持上传状态反馈
- 可选的文件预览功能
- 合理的UI交互设计

7. 高级用法：
- 自定义上传请求：
\`\`\`jsx
const customUpload = async (file) => {
  const result = await api.upload.uploadFile(file, {
    customRequest: async ({ file, onProgress }) => {
      // 自定义上传逻辑
      const formData = new FormData();
      formData.append('file', file);
      
      // 使用自己的上传接口
      const response = await fetch('/your-upload-api', {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    }
  });
};
\`\`\`

- 批量上传：
\`\`\`jsx
const batchUpload = async (files) => {
  const results = await Promise.all(
    Array.from(files).map(file =>
      api.upload.uploadFile(file, {
        onProgress: (percent) => {
          // 处理每个文件的进度
        }
      })
    )
  );
};
\`\`\`

8. 安全考虑：
- 文件大小限制
- 文件类型验证
- 上传权限控制
- 防止重复上传
- 敏感信息处理

9. 性能优化：
- 大文件分片上传
- 文件压缩
- 并发控制
- 失败重试机制
- 缓存策略`
    }
  }
}
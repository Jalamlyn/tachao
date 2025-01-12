export const UPLOAD_PROMPTS = {
  uploadPrompt: `
系统提供了以下文件上传API，你可以用它们来实现文件上传相关功能：

1. 文件上传API说明：
api.upload = {
  // 上传文件
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
        onProgress: (percent: number) => void 
      }) => Promise<any>;
      // 上传成功回调
      onSuccess?: (fileInfo: any) => void;
      // 上传失败回调
      onError?: (error: Error) => void;
      // 上传类型，如 'image'
      uploadType?: string;
      // 图片裁剪选项
      cropOptions?: {
        quality?: number;  // 图片质量，默认 0.8
      };
    }
  ) => Promise<{
    fileName: string;    // 文件名
    fileUrl: string;     // 文件访问地址
    fileID: string;      // 文件唯一标识
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
        
        // 成功回调
        onSuccess: (fileInfo) => {
          setFileInfo(fileInfo);
          message.success("上传成功");
        },
        
        // 错误回调
        onError: (error) => {
          message.error(error.message || "上传失败");
        },
        
        // 如果是图片上传
        uploadType: "image",
        cropOptions: {
          quality: 0.8  // 图片质量
        }
      });
      
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
          <p>文件地址：
            <a 
              href={fileInfo.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              点击查看
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
\`\`\`

3. 注意事项：

- 文件大小限制：
  * 通过 maxSize 参数控制
  * 超过限制会抛出错误
  * 建议在上传前进行检查

- 图片处理：
  * uploadType 设置为 "image" 时启用
  * 支持通过 cropOptions 配置图片质量
  * 可以进行压缩和裁剪处理

- 文件命名：
  * 自动生成唯一的文件路径
  * 包含时间戳和随机字符串
  * 保留原始文件扩展名

4. 常见使用场景：
- 图片上传
- 文档上传
- 头像上传
- 附件上传
- 批量文件上传

5. 错误处理：
- 文件大小超限
- 网络错误
- 服务器错误
- 文件类型错误
建议使用 try-catch 和错误回调处理这些错误

6. 最佳实践：
- 总是显示上传进度
- 提供文件大小限制提示
- 处理各种错误情况
- 优化用户体验
- 提供上传状态反馈
- 支持文件预览
- 实现优雅降级

7. 高级用法：
- 自定义上传实现：
\`\`\`jsx
const customUpload = async (file) => {
  const result = await api.upload.uploadFile(file, {
    customRequest: async ({ file, onProgress }) => {
      // 自定义上传逻辑
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/your-upload-api', {
        method: 'POST',
        body: formData,
        onUploadProgress: (event) => {
          const percent = (event.loaded / event.total) * 100;
          onProgress(percent);
        }
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
          console.log(\`File: \${file.name}, Progress: \${percent}%\`);
        }
      })
    )
  );
};
\`\`\`

8. 安全考虑：
- 文件大小限制
- 文件类型验证
- 文件名安全处理
- 上传权限控制
- 防止重复上传
- 内容安全检查
- 防止恶意文件

9. 性能优化：
- 图片压缩
- 并发控制
- 断点续传
- 失败重试
- 缓存处理
- 预览优化
- 按需加载

10. 用户体验建议：
- 显示上传进度
- 提供预览功能
- 支持拖拽上传
- 显示文件大小
- 提供取消功能
- 友好的错误提示
- 上传完成反馈`,
}

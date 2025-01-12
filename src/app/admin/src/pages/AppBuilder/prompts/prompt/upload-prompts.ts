export const UPLOAD_PROMPTS = {
  uploadPrompt: `
系统提供了以下文件上传API，你可以用它们来实现文件上传相关功能：

1. 文件上传API说明：
context.api.upload = {
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
      
      const result = await context.api.upload.uploadFile(file, {
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

7. 高级用法：
- 自定义上传实现：
\`\`\`jsx
const customUpload = async (file) => {
  const result = await context.api.upload.uploadFile(file, {
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
      context.api.upload.uploadFile(file, {
        onProgress: (percent) => {
          // 处理每个文件的进度
          console.log(\`File: \${file.name}, Progress: \${percent}%\`);
        }
      })
    )
  );
};
\`\`\``,
}

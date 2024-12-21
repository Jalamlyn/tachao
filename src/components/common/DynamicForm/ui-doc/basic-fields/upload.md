# 上传字段

## 基础文件上传
```typescript
{
  name: "basicUpload",
  label: "文件上传",
  type: "upload",
  uploadConfig: {
    uploadType: "file",
    maxSize: 10485760, // 10MB
    maxCount: 1
  }
}
```
基础的文件上传功能。

## 图片上传
```typescript
{
  name: "imageUpload",
  label: "图片上传",
  type: "upload",
  uploadConfig: {
    uploadType: "image",
    maxSize: 5242880, // 5MB
    maxCount: 9,
    thumbnail: true,
    cropOptions: {
      aspect: 1,
      quality: 0.8
    }
  }
}
```
支持图片上传、预览和裁剪。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "上传示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "uploadGroup",
          title: "上传字段示例",
          fields: [
            {
              name: "avatar",
              label: "头像",
              type: "upload",
              required: true,
              uploadConfig: {
                uploadType: "image",
                maxSize: 2097152, // 2MB
                maxCount: 1,
                thumbnail: true,
                cropOptions: {
                  aspect: 1,
                  quality: 0.8
                },
                onSuccess: (file) => {
                  console.log("上传成功:", file)
                },
                onError: (error) => {
                  console.error("上传失败:", error)
                }
              }
            },
            {
              name: "documents",
              label: "文档",
              type: "upload",
              uploadConfig: {
                uploadType: "file",
                maxSize: 10485760, // 10MB
                maxCount: 5,
                accept: ".pdf,.doc,.docx",
                downloadConfig: {
                  method: "GET",
                  withCredentials: true
                }
              },
              description: "支持PDF、Word文档,最多5个文件"
            },
            {
              name: "gallery",
              label: "图片集",
              type: "upload",
              uploadConfig: {
                uploadType: "image",
                maxSize: 5242880, // 5MB
                maxCount: 9,
                thumbnail: true,
                accept: "image/*",
                onPreview: (file) => {
                  console.log("预览图片:", file)
                }
              },
              description: "最多上传9张图片"
            }
          ]
        }
      ]
    }
  }
}
```
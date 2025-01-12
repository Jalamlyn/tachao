export const IMAGE_PROMPTS = {
  imagePrompt: `
在生成代码时涉及图片使用，可以使用以下占位图片服务：

1. 图片服务说明：

a) 真实照片占位：
- Picsum Photos (Lorem Picsum): https://picsum.photos
  * 固定尺寸: https://picsum.photos/200/300
  * 方形图片: https://picsum.photos/200
  * 灰度图片: https://picsum.photos/200/300?grayscale
  * 模糊效果: https://picsum.photos/200/300?blur
  * 指定图片: https://picsum.photos/id/237/200/300

b) 纯占位图片：
- DummyImage: https://dummyimage.com
  * 基础用法: https://dummyimage.com/600x400
  * 自定义颜色: https://dummyimage.com/600x400/000/fff
  * 带文字: https://dummyimage.com/600x400/000/fff&text=Hello+World

2. 使用场景：

a) 真实照片适用于：
- 产品展示
- 用户头像
- 背景图片
- 文章配图
- 相册示例

b) 占位图片适用于：
- 开发测试
- 布局占位
- 加载状态
- 默认图片
- 错误状态

3. 使用示例：

\`\`\`jsx
const { React, NextUI } = context;
const { Image } = NextUI;

const ImageDemo = () => {
  return (
    <div className="space-y-4">
      {/* 真实照片示例 */}
      <div>
        <h3 className="text-lg font-medium mb-2">产品展示图</h3>
        <Image
          src="https://picsum.photos/800/600"
          alt="Product"
          className="rounded-lg"
        />
      </div>

      {/* 用户头像示例 */}
      <div>
        <h3 className="text-lg font-medium mb-2">用户头像</h3>
        <Image
          src="https://picsum.photos/200/200"
          alt="User Avatar"
          className="rounded-full w-20 h-20"
        />
      </div>

      {/* 占位图示例 */}
      <div>
        <h3 className="text-lg font-medium mb-2">加载占位图</h3>
        <Image
          src="https://dummyimage.com/400x300/e0e0e0/666666&text=Loading..."
          alt="Loading Placeholder"
          className="rounded-lg"
        />
      </div>
    </div>
  );
};
\`\`\`

4. 最佳实践：

a) 图片尺寸：
- 根据实际需求选择合适尺寸
- 考虑响应式布局需求
- 避免过大图片影响加载
- 保持宽高比例一致

b) 性能优化：
- 使用合适的图片尺寸
- 添加加载占位状态
- 实现懒加载
- 处理加载错误

c) 用户体验：
- 提供加载状态反馈
- 处理图片加载失败
- 保持图片质量
- 确保图片alt文本

5. 注意事项：

a) 真实照片服务：
- 网络依赖性
- 随机性
- 加载时间
- 内容适当性

b) 占位图服务：
- 使用简单
- 加载快速
- 可自定义
- 稳定性好

6. 错误处理：

\`\`\`jsx
const ImageWithFallback = ({ src, alt, ...props }) => {
  const [error, setError] = React.useState(false);
  
  const handleError = () => {
    setError(true);
  };
  
  return (
    <Image
      src={error ? "https://dummyimage.com/400x300/e0e0e0/666666&text=Image+Error" : src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};
\`\`\`

7. 响应式示例：

\`\`\`jsx
const ResponsiveImage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 小图 */}
      <Image
        src="https://picsum.photos/400/300"
        alt="Small"
        className="w-full rounded-lg"
      />
      
      {/* 中图 */}
      <Image
        src="https://picsum.photos/800/600"
        alt="Medium"
        className="w-full rounded-lg"
      />
      
      {/* 大图 */}
      <Image
        src="https://picsum.photos/1200/900"
        alt="Large"
        className="w-full rounded-lg"
      />
    </div>
  );
};
\`\`\`

8. 图片类型建议：

a) 产品图片：
- 使用高质量产品照片
- 保持白色或简洁背景
- 突出产品细节
示例: https://picsum.photos/800/800

b) 用户头像：
- 使用正面人像照片
- 适当的裁剪比例
- 清晰的面部特征
示例: https://picsum.photos/200/200

c) 背景图片：
- 选择合适的场景
- 考虑文字可读性
- 适当的亮度对比
示例: https://picsum.photos/1920/1080

d) 图标占位：
- 使用简单的占位图
- 保持统一的尺寸
- 清晰的用途说明
示例: https://dummyimage.com/64x64/000/fff&text=Icon

9. 进阶用法：

a) 图片预加载：
\`\`\`jsx
const PreloadImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  
  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);
  
  if (!loaded) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg" 
           style={{ width: props.width, height: props.height }} 
      />
    );
  }
  
  return <Image src={src} alt={alt} {...props} />;
};
\`\`\`

b) 图片集合：
\`\`\`jsx
const ImageGallery = () => {
  const images = [
    { id: '1', size: '800x600' },
    { id: '2', size: '800x600' },
    { id: '3', size: '800x600' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Image
          key={index}
          src={\`https://picsum.photos/id/\${image.id}/\${image.size}\`}
          alt={\`Gallery Image \${index + 1}\`}
          className="w-full rounded-lg"
        />
      ))}
    </div>
  );
};
\`\`\`

10. 安全考虑：
- 使用HTTPS链接
- 验证图片来源
- 控制图片大小
- 处理跨域问题
- 注意内容安全性`,
}
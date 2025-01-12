export const IMAGE_PROMPTS = {
  imagePrompt: `
在生成代码时涉及图片使用，可以使用以下占位图片服务：

1. 图片服务说明：

a) 真实照片占位：
- Unsplash Source: https://source.unsplash.com
  * 随机图片: https://source.unsplash.com/random/{width}x{height}
  * 指定关键词: https://source.unsplash.com/random/{width}x{height}?{keywords}
  * 示例: https://source.unsplash.com/random/800x600?nature

b) 纯占位图片：
- Placeholder.com: https://via.placeholder.com
  * 基础用法: https://via.placeholder.com/{width}x{height}
  * 自定义文本: https://via.placeholder.com/{width}x{height}?text={text}
  * 示例: https://via.placeholder.com/300x200?text=Product+Image

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
          src="https://source.unsplash.com/random/800x600?product"
          alt="Product"
          className="rounded-lg"
        />
      </div>

      {/* 用户头像示例 */}
      <div>
        <h3 className="text-lg font-medium mb-2">用户头像</h3>
        <Image
          src="https://source.unsplash.com/random/200x200?portrait"
          alt="User Avatar"
          className="rounded-full w-20 h-20"
        />
      </div>

      {/* 占位图示例 */}
      <div>
        <h3 className="text-lg font-medium mb-2">加载占位图</h3>
        <Image
          src="https://via.placeholder.com/400x300?text=Loading..."
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
      src={error ? "https://via.placeholder.com/400x300?text=Image+Error" : src}
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
        src="https://source.unsplash.com/random/400x300?nature"
        alt="Small"
        className="w-full rounded-lg"
      />
      
      {/* 中图 */}
      <Image
        src="https://source.unsplash.com/random/800x600?city"
        alt="Medium"
        className="w-full rounded-lg"
      />
      
      {/* 大图 */}
      <Image
        src="https://source.unsplash.com/random/1200x900?architecture"
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
示例: https://source.unsplash.com/random/800x800?product

b) 用户头像：
- 使用正面人像照片
- 适当的裁剪比例
- 清晰的面部特征
示例: https://source.unsplash.com/random/200x200?face

c) 背景图片：
- 选择合适的场景
- 考虑文字可读性
- 适当的亮度对比
示例: https://source.unsplash.com/random/1920x1080?background

d) 图标占位：
- 使用简单的占位图
- 保持统一的尺寸
- 清晰的用途说明
示例: https://via.placeholder.com/64x64?text=Icon

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
    { type: 'nature', size: '800x600' },
    { type: 'architecture', size: '800x600' },
    { type: 'people', size: '800x600' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Image
          key={index}
          src={\`https://source.unsplash.com/random/\${image.size}?\${image.type}\`}
          alt={image.type}
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
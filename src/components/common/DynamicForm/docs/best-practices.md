## 最佳实践

1. **字段命名规范**
   - 使用驼峰命名法
   - 名称应具有描述性
   - 避免使用特殊字符

2. **表单验证**
   - 合理使用必填验证
   - 添加适当的字段验证
   - 处理好字段间的依赖验证

3. **用户体验**
   - 添加合适的提示信息
   - 使用 tooltip 说明字段用途
   - 合理使用禁用状态

4. **性能优化**
   - 避免过多的字段依赖
   - 优化计算逻辑
   - 合理使用缓存

5. **移动端适配**
   - 确保布局响应式
   - 适配触摸操作
   - 优化表单尺寸

### 打印样式技巧

1. **设置页面方向**
```css
@media print {
  @page { 
    size: landscape; 
  }
}
```

2. **设置页面大小**
```css
@media print {
  @page {
    size: 50mm 150mm;
  }
}
```

3. **设置页面边距**
```javascript
const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};
```

4. **处理不显示元素的打印**
```css
/* 使用这个替代 display: none */
.hidden-but-printable {
  overflow: hidden;
  height: 0;
}
```

5. **避免空白页**
```css
@media print {
  html, body {
    height: 100vh;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
}
```

6. **处理分页**
```css
@media print {
  .page-break {
    margin-top: 1rem;
    display: block;
    page-break-before: auto;
  }
}

@page {
  size: auto;
  margin: 20mm;
}
```

7. **网格系统打印适配**
- 确保响应式布局在打印时正确显示
- 考虑使用专门的打印布局类
- 可以覆盖默认的网格列定义

8. **图片和背景处理**
```css
@media print {
  img {
    max-width: 100% !important;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```
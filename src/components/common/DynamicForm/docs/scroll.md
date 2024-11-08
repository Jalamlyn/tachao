## 滚动容器打印处理

在打印包含滚动容器的内容时，可能会遇到以下问题：

1. 无法控制滚动位置，导致打印内容不是预期的部分
2. 溢出内容被截断，导致打印内容不完整

### 解决方案

#### 1. 使用自定义打印函数

通过 `print` 属性传入自定义打印函数，在打印前修改滚动容器的属性：

```javascript
const customToPrint = (printWindow) => {
  const printContent = printWindow.contentDocument || printWindow.contentWindow?.document;
  const printedScrollContainer = printContent.querySelector('.scroll-container');

  const originScrollContainer = document.querySelector('.scroll-container');

  // 设置打印容器的滚动位置与原容器一致
  printedScrollContainer.scrollTop = originScrollContainer.scrollTop;

  // 可以设置 overflow 和 height 属性来显示所有内容
  // printedScrollContainer.style.overflow = "visible";
  // printedScrollContainer.style.height = "fit-content";

  printWindow.contentWindow.print();
}

const handlePrint = useReactToPrint({
  // ...其他配置
  print: customToPrint,
});
```

#### 2. 使用打印样式

通过 CSS 媒体查询在打印时修改滚动容器的样式：

```css
@media print {
  .scroll-container {
    overflow: visible;
    height: fit-content;
  }
}
```

### 最佳实践

1. **选择合适的方案**
   - 如果需要精确控制滚动位置，使用自定义打印函数
   - 如果只需显示全部内容，使用 CSS 媒体查询即可

2. **性能考虑**
   - 避免在打印时进行复杂的 DOM 操作
   - 注意内存使用，特别是处理大量内容时

3. **兼容性处理**
   - 测试不同浏览器的打印效果
   - 考虑移动设备的特殊情况

4. **用户体验**
   - 提供预览功能
   - 清晰的打印提示
   - 合理的默认打印设置

### 示例代码

完整的实现示例：

```javascript
const PrintableContent = ({ scrollContainerId }) => {
  const handlePrint = useReactToPrint({
    content: () => document.getElementById('printContent'),
    print: (printWindow) => {
      const printDoc = printWindow.contentDocument;
      const originalContainer = document.getElementById(scrollContainerId);
      const printContainer = printDoc.querySelector(`#${scrollContainerId}`);

      // 复制滚动位置
      if (originalContainer && printContainer) {
        printContainer.scrollTop = originalContainer.scrollTop;
      }

      // 执行打印
      return new Promise((resolve) => {
        printWindow.contentWindow.print();
        resolve();
      });
    },
    onBeforePrint: () => {
      // 打印前的准备工作
      console.log('Preparing to print...');
    },
    onAfterPrint: () => {
      // 打印后的清理工作
      console.log('Printing completed');
    }
  });

  return (
    <div>
      <button onClick={handlePrint}>打印内容</button>
      <div id="printContent">
        <div id={scrollContainerId} className="scroll-container">
          {/* 滚动内容 */}
        </div>
      </div>
    </div>
  );
};
```
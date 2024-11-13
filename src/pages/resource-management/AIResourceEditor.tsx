// ... 前面的代码保持不变 ...

  // 新增预览处理函数
  const handlePreview = useCallback((code: Message["code"]) => {
    // 添加日志打印
    console.log("Preview Button Clicked, Code Object:", {
      preview: code?.preview ? "AnalysisResult Component" : null,
      content: code?.content
    })

    setCurrentPreview(code)
    
    // 添加状态变化日志
    console.log("Current Preview State Updated:", {
      hasPreview: code?.preview ? "Yes" : "No",
      contentLength: code?.content?.length || 0
    })
  }, [])

// ... 后面的代码保持不变 ...
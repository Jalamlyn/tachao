// ... (前面的代码保持不变)

app.post("/chat-claude-office", async (req, res) => {
  try {
    const {
      messages,
      temperature,
      max_tokens,
      model,
      apiKey,
      system,
      cid,
      tools,
      tool_choice,
    } = req.body;
    
    if (cid !== "Hx9Kp2Qm7Zf3Lw5Ry8Tj6") {
      throw new Error("非法访问");
    }

    // 添加模型映射
    const modelMap = {
      "claude-3-5-sonnet-20241022": "claude-3-sonnet-20240229",  // EXPERT 版本
      "claude-3-5-haiku-20241022": "claude-3-haiku-20240307"     // ADVANCED 版本
    };

    // 获取实际使用的模型
    const actualModel = modelMap[model] || "claude-3-haiku-20240307"; // 默认使用 haiku

    const apiUrl = "https://api.anthropic.com/v1/messages";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: actualModel,
        messages,
        temperature: temperature || 0,
        max_tokens: max_tokens || 8192,
        stream: true,
        system,
        tools,
        tool_choice,
      }),
    });

    if (!response.ok) {
      const errorResponse = response.clone();
      const errorBody = await errorResponse.text();
      throw new Error(
        `API 请求失败: ${response.status} ${response.statusText}\n${errorBody}`
      );
    }

    res.writeHead(response.status, {
      ...response.headers,
      "Content-Type": "text/event-stream",
    });

    response.body.pipe(res);

    response.body.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.error("Claude API 错误:", error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response ? await error.response.text() : null,
    });
  }
});

// ... (后面的代码保持不变)
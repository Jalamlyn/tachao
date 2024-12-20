const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

// 允许的域名列表
const ALLOWED_ORIGINS = [
  'http://localhost:5174',
  'https://www.mobenai.com.cn',
  'http://www.mobenai.com.cn'
];

// 域名验证中间件
const validateOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  
  if (!origin) {
    console.log('Blocked request: No origin header');
    return res.status(403).json({ error: 'Origin header is required' });
  }

  if (!ALLOWED_ORIGINS.includes(origin)) {
    console.log(`Blocked request from unauthorized origin: ${origin}`);
    return res.status(403).json({ error: 'Unauthorized origin' });
  }

  next();
};

// 请求日志中间件
const logRequest = (req, res, next) => {
  const requestInfo = {
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress
  };
  
  console.log('Incoming request:', JSON.stringify(requestInfo, null, 2));
  next();
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(logRequest);

async function getAccessToken() {
  const keyFilePath = path.join(__dirname, 'key.json');
  const auth = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    console.log('Access Token:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('身份验证错误:', error);
    throw error;
  }
}

const validateRequest = (req, res, next) => {
  const { messages, model } = req.body;
  if (!messages || !model) {
    return res.status(400).json({ error: "缺少必要参数" });
  }
  next();
};

app.post("/chat-azure", validateOrigin, validateRequest, async (req, res) => {
  try {
    const { messages, temperature, max_tokens, model } = req.body;
    
    // 配置信息
    const apiKey = "5d5c1f3cc91b440b8391851b2eadfb1c";
    const modelEndpoints = {
      EXPERT: "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview",
      ADVANCED: "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o-mini-2/chat/completions?api-version=2024-02-15-preview",
    };
    
    const apiEndPoint = modelEndpoints[model];

    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature: temperature || 0,
        max_tokens: max_tokens || 16000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorResponse = response.clone();
      const errorBody = await errorResponse.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n${errorBody}`
      );
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let buffer = '';
    let isDone = false;

    response.body.on('data', (chunk) => {
      buffer += chunk.toString();
      
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data:')) continue;

        try {
          const jsonStr = line.replace(/^data: /, '').trim();
          
          if (jsonStr === '[DONE]') {
            if (!isDone) {
              res.write('data: [DONE]\n\n');
              isDone = true;
            }
            continue;
          }

          const jsonData = JSON.parse(jsonStr);
          
          // 删除模型信息
          if (jsonData.model) delete jsonData.model;
          
          res.write(`data: ${JSON.stringify(jsonData)}\n\n`);
        } catch (e) {
          console.error('Error processing chunk:', e);
          continue;
        }
      }
    });

    response.body.on('end', () => {
      if (!isDone) {
        res.write('data: [DONE]\n\n');
      }
      res.end();
    });

    response.body.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream processing error' });
      }
      res.end();
    });

  } catch (error) {
    console.error("Azure OpenAI API error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message,
        details: error.response ? await error.response.text() : null,
      });
    }
  }
});

// 保持原有的其他路由...

const PORT = 9000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`服务器正在运行，地址为 http://${HOST}:${PORT}`);
});
import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import DynamicFormConfigStr from "./DynamicFormConfigStr"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig, parseFormEditOperations } from "@/utils/codeParser"
import message from "@/components/Message"
import { set, cloneDeep } from "lodash"
import React from "react"

// 导入 shadcn UI 组件
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"

// 导入 NextUI Button
import { Button } from "@nextui-org/react"

// UI 组件映射
const uiComponents = {
  Alert,
  AlertTitle,
  AlertDescription,
  Button, // NextUI Button
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Calendar,
}

// ... 其余代码保持不变 ...

private async editForm(
  currentConfig: DynamicFormConfig,
  editDescription: string,
  onChunk: (chunk: string) => void
): Promise<{
  config: DynamicFormConfig
  title?: string
} | null> {
  onChunk("🔄 正在分析编辑需求...\n")
  await new Promise((resolve) => setTimeout(resolve, 300))

  const prompt = `请根据以下编辑描述,生成精确的表单配置修改代码:

当前表单配置:
${jsonStringify(currentConfig)}

编辑需求:
${editDescription}

请生成使用 lodash 的 set 函数的修改代码,使用如下格式:
\`\`\`
<shata-ai-edit>
// 使用 set(config, path, value) 进行精确修改
set(config, 'formFields.basicInfo[0].label', '新的标签');
set(config, 'formFields.basicInfo[0].required', true);
// 如果需要修改标题
config.title = "新的标题";
</shata-ai-edit>
\`\`\`

注意:
1. 只生成需要修改的部分
2. 使用精确的对象路径
3. 每个修改使用单独的 set 语句
4. 确保路径正确且存在
5. 自定义组件只能使用允许的 UI 组件`

  try {
    onChunk("🛠️ 正在应用修改...\n")
    const response = await this.processAIResponse(prompt, onChunk)
    const editOperation = await parseFormEditOperations(response)
    const newConfig = cloneDeep(currentConfig)
    
    // 传入 React 和 UI 组件
    editOperation(newConfig, set, React, ...Object.values(uiComponents))

    onChunk("✅ 表单修改完成！\n")
    return {
      config: newConfig,
      title: newConfig.title,
    }
  } catch (error) {
    console.error("Error editing form:", error)
    throw new Error("编辑表单失败：" + (error as Error).message)
  }
}

// ... 其余代码保持不变 ...
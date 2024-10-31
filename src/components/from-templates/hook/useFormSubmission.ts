import { useCallback } from "react"
import { useFormMetadata } from "./useFormMetadata"
import { merge } from "lodash"
import chatMoV2 from "@/service/chat/chat-deepseek"
import message from "../../Message"

interface FormData {
  id: string
  templateId: string
  status: string
  data: any
}

const defaultFormData: FormData = {
  id: "SQ1729346166613",
  templateId: "salesOrder",
  status: "pending_approval",
  data: {
    customerInfo: {
      customerId: "6711c93c53081ac535d930ef",
      customerName: "锡东沙塔智能科技",
      customerCode: "KH240123-01",
      contactId: "6711c93c53081ac535d932bc",
      contactName: "葛老师",
      contactPhone: "15050671835",
    },
    basicInfo: {
      orderName: "货到付款的电子销售单",
      signDate: "2024-10-19",
      deliveryDate: "2024-10-31",
      department: "市场部",
      salesperson: "王老五",
    },
    productDetails: [
      {
        data_id: "6711c93c53081ac535d93123",
        标题: "UPS-3C6KVA",
        产品编码: "CP0005",
        产品属性: "零件",
        产品类型: "交换机-电源",
        产品名称: "UPS",
        品牌: "戴克威尔",
        规格型号: "3C6KVA",
        单位: "套",
        "成本单价/元": "360",
        "销售单价(含税)/元": "680",
        "增值税税率 %": "13.%",
        "销售单价(不含税)/元": "601.77",
        "税额/元": "88.4",
        "售价毛利/元": "320",
        产品权限: "销售,采购",
        提交人: "陈苍茫",
        提交时间: "2023-04-20 11:05:40",
        更新时间: "2024-02-23 16:27:06",
        quantity: 3,
        totalPrice: 2040,
        productOriginalTotalPrice: 2040,
        isProductSelected: true,
        discountAmount: 0,
      },
    ],
    totalAmount: 2040,
    totalAmountInWords: "贰仟零肆拾零元整",
    grossProfitRate: 47.05882352941176,
    discountAmount: 0,
    discountRate: 0,
    attachment: null,
    deliveryPlan: {
      address: "UNIT 1101, UNIT2, 28, YUJINGLANWAN",
      detailedAddress: "UNIT 1101, UNIT2, 28, YUJINGLANWAN",
      plans: [
        {
          batch: "整批",
          plannedDate: "2024-10-19",
          content: "",
        },
      ],
    },
    financialTerms: {
      settlementPeriod: "货到付款",
      paymentPlans: [
        {
          item: "整批货款",
          percentage: 100,
          amount: 2040,
          method: "现金",
          plannedDate: "2024-10-20",
          notes: "货到付款",
        },
      ],
    },
    invoiceDetails: {
      title: "模本科技",
      taxNumber: "30929999",
      taxType: "增值税",
      vatRate: "12",
    },
    bankAccount: {
      account: "6214777788889999",
      bank: "工商银行",
    },
  },
}

const generateAIFormPatch = async (userInput: string): Promise<Partial<FormData>> => {
  const prompt = `根据以下用户需求，生成一个销售订单表单的部分数据（patch）。只需要生成与用户需求相关的字段，不需要生成完整的表单数据。请以 JSON 格式返回结果。

用户需求: ${userInput}

要修改的对象：${JSON.stringify(defaultFormData)}

请按照下列格式返回修改对象的 js 代码
<mo-ai-script>
return (defaultFormData) =>{
  return {
    ...defaultFormData,
    根据需求修改的字段
  }
}
</mo-ai-script>`

  let aiResponse = ""
  await chatMoV2(
    [{ role: "user", content: prompt }],
    (chunk) => {
      aiResponse += chunk
    },
    () => {},
    true,
    0.7
  )

  try {
    console.log(aiResponse)
    const workflowRegex = /<mo-ai-script>([\s\S]*?)<\/mo-ai-script>/
    const match = aiResponse.match(workflowRegex)
    if (match) {
      const [, workflowBody] = match
      const workflowFunction = new Function(workflowBody)
      const result = workflowFunction()(defaultFormData)
      return result as Partial<FormData>
    } else {
      message.error("AI 命令执行失败，请稍后重试")
    }
  } catch (error) {
    console.error("Error parsing AI response:", error)
    throw new Error("Failed to generate AI form patch")
  }
}

export const useFormSubmission = () => {
  const { addForm } = useFormMetadata()

  const submitForm = useCallback(
    async (userInput: string) => {
      try {
        console.log("[useFormSubmission] User input:", userInput)

        const aiPatch = await generateAIFormPatch(userInput)
        console.log("[useFormSubmission] AI generated patch:", aiPatch)

        const mergedFormData = merge({}, defaultFormData, aiPatch)
        console.log("[useFormSubmission] Merged form data:", mergedFormData)

        // 使用 orderNumber 作为 id 和 title
        const orderNumber = mergedFormData.data?.basicInfo?.orderNumber
        const newForm = {
          id: orderNumber || `SQ${new Date().getTime()}`,
          templateId: mergedFormData.templateId,
          title: orderNumber || mergedFormData.data.basicInfo?.orderName || "Untitled Form",
          data: mergedFormData.data,
          status: mergedFormData.status,
        }

        const result = await addForm(newForm)
        if (result) {
          console.log("[useFormSubmission] Form submitted successfully:", result)
          return result
        } else {
          throw new Error("Failed to submit form")
        }
      } catch (error) {
        console.error("[useFormSubmission] Error submitting form:", error)
        throw error
      }
    },
    [addForm]
  )

  return { submitForm }
}
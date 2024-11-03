import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button, Tooltip, CardBody, Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { useFormSubmission } from "@/components/from-templates/hook/useFormSubmission"
import message from "@/components/Message"

const CreateFormPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { submitForm } = useFormSubmission()
  const [error, setError] = useState<string | null>(null)

  const handleCommand = async (command: string) => {
    if (!command.trim()) return

    setIsLoading(true)
    try {
      await submitForm(command)
      message.success("单据创建成功")
    } catch (error) {
      console.error("Error creating form:", error)
      setError("创建单据时发生错误")
      message.error("创建单据失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='bg-white/10 border border-white/20 shadow-xl backdrop-blur-md bg-white'>
      <CardBody className='p-6'>
        <div className='text-black/80 mb-6 space-y-4'>
          <h3 className='text-lg font-medium'>智能开单助手</h3>
          <p>您可以通过自然语言描述来创建单据，例如：</p>
          <ul className='list-disc list-inside space-y-2 text-black/70'>
            <li>"创建一个销售订单，客户是锡东沙塔智能科技，产品是UPS，数量3台"</li>
            <li>"帮我生成一张请假单，请假时间是明天上午，事由是看医生"</li>
            <li>"创建一个采购申请，采购5台笔记本电脑，供应商是联想"</li>
          </ul>
        </div>

        {error && (
          <div className='text-black/90 bg-red-500/20 border border-red-500/30 p-4 rounded-lg mb-4'>{error}</div>
        )}

        <CommandInput placeholder='请输入您的开单需求，例如：创建一个销售订单...' disabled={isLoading} />
      </CardBody>
    </Card>
  )
}

export default CreateFormPage

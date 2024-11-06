"use client"

import type { TextAreaProps } from "@nextui-org/react"

import React from "react"
import { Textarea } from "@nextui-org/react"
import { cn } from "@nextui-org/react"

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ classNames = {}, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      aria-label='Prompt'
      className='min-h-[40px]'
      classNames={{
        ...classNames,
        label: cn("hidden", classNames?.label),
        input: cn("py-0 text-black", classNames?.input),
      }}
      minRows={1}
      placeholder='请输入您的指令,例如 创建 xxx，编辑 xxx 必须是和表单相关的指令，不然 AI 会拒绝您的指令'
      radius='lg'
      variant='bordered'
      {...props}
    />
  )
})

export default PromptInput

PromptInput.displayName = "PromptInput"

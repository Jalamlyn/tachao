import React, { useState } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CodeSearchDialog from "./CodeSearchDialog"

interface CodeSearchProps {
  appId: string
}

const CodeSearch: React.FC<CodeSearchProps> = ({ appId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant="light"
        startContent={<Icon icon="solar:bot-linear" className="w-5 h-5" />}
        onPress={() => setIsDialogOpen(true)}
      >
        AI 搜索
      </Button>
      <CodeSearchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        appId={appId}
      />
    </>
  )
}

export default CodeSearch
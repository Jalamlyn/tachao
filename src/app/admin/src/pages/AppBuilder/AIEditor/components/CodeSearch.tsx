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
        variant='light'
        color='secondary'
        isIconOnly
        startContent={<Icon icon='hugeicons:ai-chat-02' className='w-5 h-5' />}
        className='ml-2'
        onPress={() => setIsDialogOpen(true)}
      ></Button>
      <CodeSearchDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} appId={appId} />
    </>
  )
}

export default CodeSearch

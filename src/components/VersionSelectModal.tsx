import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from "@nextui-org/react"
import { Icon } from "@iconify/react"

export interface VersionSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (useCurrentVersion: boolean) => void
  currentVersionIndex: number
  latestVersionIndex: number
}

const VersionSelectModal: React.FC<VersionSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentVersionIndex,
  latestVersionIndex,
}) => {
  const [selected, setSelected] = React.useState<"current" | "latest">("current")

  const handleConfirm = () => {
    onConfirm(selected === "current")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement='center'
      classNames={{
        base: "max-w-md",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:history' className='w-5 h-5 text-warning' />
            <span>选择要保存的版本</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-6'>
            <p className='text-default-700'>
              您当前正在查看历史版本（版本 {currentVersionIndex + 1}）， 但系统中存在更新的版本（版本{" "}
              {latestVersionIndex + 1}）。 请选择要保存的版本：
            </p>
            <RadioGroup
              value={selected}
              onValueChange={(value) => setSelected(value as "current" | "latest")}
              className='gap-4'
            >
              <Radio value='current' description='保存当前正在查看的历史版本'>
                保存当前版本（版本 {currentVersionIndex + 1}）
              </Radio>
              <Radio value='latest' description='保存最新的版本'>
                保存最新版本（版本 {latestVersionIndex + 1}）
              </Radio>
            </RadioGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='primary' onPress={handleConfirm}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VersionSelectModal

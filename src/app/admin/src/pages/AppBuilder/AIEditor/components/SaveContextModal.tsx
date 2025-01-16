import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import { getCodeTypeIcon, getCodeTypeColor } from "./utils"

interface SaveContextModalProps {
  isOpen: boolean
  onClose: () => void
}

const SaveContextModal: React.FC<SaveContextModalProps> = observer(({ isOpen, onClose }) => {
  const [name, setName] = useState("")
  const selectedModules = appCodeStore.getSelectedModulesInfo()

  const handleSave = () => {
    if (!name.trim()) return
    appCodeStore.saveContextShortcut(name.trim())
    setName("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "bg-gradient-to-b from-white to-default-50",
        header: "border-b-1 border-default-100",
        body: "py-6",
        closeButton: "hover:bg-default-100",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:bookmark-square-minimalistic-linear" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">保存快捷上下文</h3>
              <p className="text-small text-default-500">将当前选中的模块保存为快捷上下文</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="快捷上下文名称"
              placeholder="输入名称..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="bordered"
              autoFocus
            />
            <div>
              <div className="text-small font-medium mb-2 flex items-center gap-2">
                <Icon icon="solar:module-linear" className="w-4 h-4 text-default-500" />
                已选择的模块 ({selectedModules.length})
              </div>
              <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-default-50">
                {selectedModules.map((module) => (
                  <Chip key={module.id} size="sm" variant="flat" className="h-6">
                    <div className="flex items-center gap-1">
                      <Icon
                        icon={getCodeTypeIcon(module.type)}
                        className={`w-3 h-3 text-${getCodeTypeColor(module.type)}`}
                      />
                      <span>{module.title || module.name}</span>
                    </div>
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSave} isDisabled={!name.trim()}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

export default SaveContextModal
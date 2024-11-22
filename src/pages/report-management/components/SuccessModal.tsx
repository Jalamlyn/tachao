import React from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onViewReport: () => void
  onGoToReports: () => void
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, onViewReport, onGoToReports }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg' placement='center'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
            <span>报表保存成功</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <p className='text-default-600'>恭喜！您的报表已经保存成功。现在您可以：</p>
            <div className='flex flex-col gap-2'>
              <div className='p-4 border rounded-lg bg-gray-50'>
                <h3 className='font-medium mb-2'>查看报表</h3>
                <p className='text-sm text-gray-500 mb-4'>立即查看生成的报表内容和分析结果。</p>
                <Button
                  color='primary'
                  onClick={onViewReport}
                  startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                >
                  查看报表
                </Button>
              </div>
              <div className='p-4 border rounded-lg'>
                <h3 className='font-medium mb-2'>返回报表管理</h3>
                <p className='text-sm text-gray-500 mb-4'>返回报表列表查看或管理您的所有报表。</p>
                <Button
                  variant='bordered'
                  onClick={onGoToReports}
                  startContent={<Icon icon='mdi:format-list-bulleted' className='w-4 h-4' />}
                >
                  查看所有报表
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SuccessModal
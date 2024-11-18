import React, { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"

interface AIGenerationDialogProps {
  isOpen: boolean
  onClose: () => void
  generationContent: string
  title?: string
  ResultComponent?: React.ComponentType<any>
  resultProps?: any
}

const AIGenerationDialog: React.FC<AIGenerationDialogProps> = ({
  isOpen,
  onClose,
  generationContent,
  title = "沙塔智能",
  ResultComponent,
  resultProps = {},
}) => {
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setShowResult(false)
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='4xl'
      scrollBehavior='inside'
      classNames={{
        base: "max-h-[80vh]",
      }}
    >
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <AnimatePresence mode='wait'>
            {!showResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='bg-gray-50 rounded-lg p-4'
              >
                <pre className='whitespace-pre-wrap font-mono text-sm'>{generationContent}</pre>
              </motion.div>
            ) : (
              ResultComponent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='border rounded-lg p-4'
                >
                  <ResultComponent {...resultProps} />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AIGenerationDialog

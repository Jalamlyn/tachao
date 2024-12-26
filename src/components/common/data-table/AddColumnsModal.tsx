import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AddColumnsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (columns: string[]) => Promise<void>
}

const AddColumnsModal: React.FC<AddColumnsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [columns, setColumns] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddColumn = () => {
    setColumns([...columns, ''])
  }

  const handleRemoveColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    setColumns(newColumns.length ? newColumns : [''])
  }

  const handleColumnChange = (index: number, value: string) => {
    const newColumns = [...columns]
    newColumns[index] = value
    setColumns(newColumns)
  }

  const handleSubmit = async () => {
    const validColumns = columns.filter(col => col.trim() !== '')
    if (validColumns.length === 0) return

    setIsSubmitting(true)
    try {
      await onConfirm(validColumns)
      setColumns([''])
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (!isSubmitting) {
        setColumns([''])
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加新列</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {columns.map((column, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={column}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                    placeholder="输入列名"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColumn(index)}
                    disabled={columns.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddColumn}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加另一列
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || columns.every(col => col.trim() === '')}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddColumnsModal
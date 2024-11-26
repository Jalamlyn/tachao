import React, { useState, useRef } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import message from "@/components/Message";

interface WordUploadProps {
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}

const WordUploadButton: React.FC<WordUploadProps> = ({
  onSuccess,
  onError
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [extractingToc, setExtractingToc] = useState(false);
  const [tocData, setTocData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      try {
        setExtractingToc(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTocData({
          chapters: [
            { title: "第一章", page: 1 },
            { title: "第二章", page: 10 },
          ]
        });
      } catch (error) {
        onError(error as Error);
      } finally {
        setExtractingToc(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.doc') && !droppedFile.name.endsWith('.docx')) {
        message.error('请上传Word文档(.doc/.docx)');
        return;
      }
      setFile(droppedFile);
      try {
        setExtractingToc(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTocData({
          chapters: [
            { title: "第一章", page: 1 },
            { title: "第二章", page: 10 },
          ]
        });
      } catch (error) {
        onError(error as Error);
      } finally {
        setExtractingToc(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("请选择文件");
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess({ file, tocData });
      onClose();
      setFile(null);
      setTocData(null);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <>
      <Button 
        onClick={onOpen}
        color="primary"
        startContent={<Icon icon="mdi:file-word" className="text-xl" />}
        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
      >
        上传Word文档
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        classNames={{
          base: "bg-background",
          header: "border-b-1 border-default-200",
          body: "py-6",
          footer: "border-t-1 border-default-200",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:file-word" className="text-blue-600 text-2xl" />
              <span className="text-xl font-semibold">上传Word文档</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center w-full h-40 
                    px-4 transition-all duration-200 bg-default-50 
                    border-2 border-dashed rounded-xl cursor-pointer
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-default-300'}
                    hover:border-primary hover:bg-primary/5
                  `}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:file-word" className="w-12 h-12 text-blue-600" />
                      <span className="font-medium text-default-700">{file.name}</span>
                      <Chip size="sm" color="primary" variant="flat">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Chip>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:upload" className="w-12 h-12 text-default-400" />
                      <span className="font-medium text-default-600">点击选择或拖拽文件到这里</span>
                      <span className="text-sm text-default-400">支持 .doc, .docx 格式</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc"
                className="sr-only"
                onChange={handleFileSelect}
              />

              <AnimatePresence>
                {extractingToc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center py-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-default-600">正在提取文档信息...</span>
                    </div>
                  </motion.div>
                )}

                {tocData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-default-200 bg-default-50 overflow-hidden"
                  >
                    <div className="p-4 bg-default-100 border-b border-default-200">
                      <h3 className="text-sm font-medium text-default-700">文档目录</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {tocData.chapters.map((chapter: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm p-2 rounded-lg hover:bg-default-100">
                          <span className="text-default-700">{chapter.title}</span>
                          <span className="text-default-400">第 {chapter.page} 页</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 p-4 rounded-xl bg-default-50">
                <h4 className="text-sm font-medium text-default-700 mb-2">文档选项</h4>
                <Checkbox 
                  defaultSelected 
                  size="sm"
                  classNames={{
                    label: "text-default-600"
                  }}
                >
                  提取目录结构
                </Checkbox>
                <Checkbox 
                  defaultSelected 
                  size="sm"
                  classNames={{
                    label: "text-default-600"
                  }}
                >
                  包含页眉页脚
                </Checkbox>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={onClose}
              className="font-medium"
            >
              取消
            </Button>
            <Button 
              color="primary"
              onPress={handleUpload} 
              isDisabled={!file}
              className="font-medium bg-blue-600 hover:bg-blue-700"
              startContent={<Icon icon="mdi:upload" />}
            >
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WordUploadButton;
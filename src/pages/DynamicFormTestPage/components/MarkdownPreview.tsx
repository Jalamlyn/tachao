import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface MarkdownPreviewProps {
  content: string;
  onCopy?: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, onCopy }) => {
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      onCopy?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <div className="bg-gray-50 rounded-lg p-4">
        {content ? (
          <>
            <div className="absolute right-2 top-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                <Icon icon="mdi:content-copy" className="h-4 w-4" />
              </Button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {content}
            </pre>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon
              icon="mdi:markdown"
              className="w-12 h-12 mx-auto mb-4 opacity-50"
            />
            <p>暂无生成内容</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MarkdownPreview;
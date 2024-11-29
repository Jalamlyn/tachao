import React, { useState, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Chip, ScrollShadow } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useTagManagement } from "@/hooks/useTagManagement";
import { TagType } from "@/types/tag";
import message from "@/components/Message";
import { useTagStore } from "@/stores/useTagStore";

interface TagManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TagType;
}

const TAG_COLORS = [
  { value: "primary", label: "蓝色" },
  { value: "secondary", label: "紫色" },
  { value: "success", label: "绿色" },
  { value: "warning", label: "黄色" },
  { value: "danger", label: "红色" },
  { value: "default", label: "灰色" },
  { value: "content1", label: "浅灰色" },
  { value: "content2", label: "深灰色" },
  { value: "content3", label: "暗色" },
  { value: "content4", label: "浅色" }
];

const TagManageModal: React.FC<TagManageModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const {
    tagsIndex,
    createTag,
    deleteTag,
    getTagUsageCount,
    lastUpdate
  } = useTagManagement(type);

  const { updateTags, setHasChanges, hasChanges, resetChanges } = useTagStore();

  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      message.error('请输入标签名称');
      return;
    }

    if (tagsIndex?.tags.some(tag => 
      tag.type === type && tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    )) {
      message.error('标签名称已存在');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await createTag({
        name: newTagName.trim(),
        color: selectedColor,
        type
      });

      if (result) {
        setNewTagName("");
        setSelectedColor("primary");
        setHasChanges(true); // 标记发生变化
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const usageCount = getTagUsageCount(tagId);
    if (usageCount > 0) {
      message.error(`无法删除标签，当前有 ${usageCount} 个项目正在使用此标签`);
      return;
    }

    try {
      const success = await deleteTag(tagId);
      if (success) {
        setHasChanges(true); // 标记发生变化
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleClose = useCallback(() => {
    if (hasChanges) {
      updateTags(); // 只在有变化时更新
    } else {
      resetChanges(); // 重置状态
    }
    onClose();
  }, [hasChanges, updateTags, resetChanges, onClose]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:tag-multiple" className="w-6 h-6" />
            <span>管理标签</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">创建新标签</h3>
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="输入标签名称"
                  className="flex-1"
                  maxLength={20}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && newTagName.trim()) {
                      handleCreateTag();
                    }
                  }}
                />
                <Select
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="w-32"
                  items={TAG_COLORS}
                  renderValue={(items) => {
                    const selectedItem = items[0];
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${selectedItem?.data?.value}-500`} />
                        <span>{selectedItem?.data?.label}</span>
                      </div>
                    );
                  }}
                >
                  {(color) => (
                    <SelectItem 
                      key={color.value} 
                      value={color.value}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-3 h-3 rounded-full bg-${color.value}-500`} />
                      {color.label}
                    </SelectItem>
                  )}
                </Select>
                <Button
                  color="primary"
                  onClick={handleCreateTag}
                  isLoading={isSubmitting}
                  startContent={<Icon icon="mdi:plus" />}
                >
                  创建
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">现有标签</h3>
              <ScrollShadow 
                className="flex flex-wrap gap-2 min-h-[100px] max-h-[300px] overflow-y-auto p-2"
                hideScrollBar={false}
              >
                {tagsIndex?.tags
                  .filter(tag => tag.type === type)
                  .map(tag => {
                    const usageCount = getTagUsageCount(tag.id);
                    return (
                      <Chip
                        key={`${tag.id}-${lastUpdate}`}
                        color={tag.color as any}
                        variant="flat"
                        onClose={usageCount === 0 ? () => handleDeleteTag(tag.id) : undefined}
                        className="h-8"
                      >
                        {tag.name}
                        <span className="ml-2 text-xs">
                          ({usageCount})
                        </span>
                      </Chip>
                    );
                  })}
                {(!tagsIndex?.tags.length || !tagsIndex?.tags.filter(tag => tag.type === type).length) && (
                  <div className="flex items-center justify-center w-full h-[100px] text-default-400">
                    暂无标签
                  </div>
                )}
              </ScrollShadow>
            </div>

            <div className="text-sm text-default-400 space-y-1">
              <p>• 标签一旦创建后名称不可修改</p>
              <p>• 只有未被使用的标签才能删除</p>
              <p>• 标签名称最长20个字符</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TagManageModal;
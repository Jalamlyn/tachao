import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import EmptyState from "@/components/EmptyState"

export const renderEmptyState = (selectedTags, tagsIndex, handleClearTags, navigate) => () => {
  if (selectedTags.length > 0) {
    const tagNames = selectedTags
      .map((tagId) => tagsIndex?.tags.find((tag) => tag.id === tagId)?.name)
      .filter(Boolean)
      .join("、")

    return (
      <EmptyState
        type='no-data'
        title={`未找到匹配的表单模板`}
        description={
          <div className='space-y-2'>
            <p>当前筛选标签：{tagNames}</p>
            <Button color='primary' variant='flat' onClick={handleClearTags}>
              清除筛选
            </Button>
          </div>
        }
        icon={<Icon icon='mdi:filter-off' className='w-32 h-32 text-default-600' />}
      />
    )
  }

  return (
    <EmptyState
      type='no-data'
      title='还没有表单模板'
      description='创建你的第一个表单模板，AI 助手会帮助你快速生成专业的表单'
      action={{
        text: "去创建",
        onClick: () => navigate("/admin/documents/create"),
      }}
    />
  )
}

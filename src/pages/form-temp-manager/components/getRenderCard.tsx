import { Button, Chip, Card, CardBody, CardFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Template } from "./TemplateGallery"

export const getRenderCard =
  (
    onTemplateSelect,
    tagsIndex,
    getItemTags,
    handleShareClick,
    handleRenameClick,
    handleAIEditClick,
    handleEditTagsClick,
    handleDeleteClick
  ) =>
  (template: Template) => (
    <Card
      isPressable
      isHoverable
      className='w-full h-[240px] group relative'
      onPress={() => onTemplateSelect(template.id)}
    >
      {/* 标签显示在右上角 */}
      <div className='absolute top-2 right-2 z-10 flex flex-wrap gap-1 max-w-[70%] justify-end'>
        {tagsIndex &&
          getItemTags(template.id).map((tag) => (
            <Chip
              key={tag.id}
              size='sm'
              color={tag.color as any}
              variant='flat'
              className='bg-background/60 backdrop-blur-sm'
            >
              {tag.name}
            </Chip>
          ))}
      </div>

      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='fluent:document-add-48-regular'
            className='w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
      </CardBody>
      <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
        <div className='flex justify-between items-center w-full'>
          <h4
            className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors duration-300'
            title={template.title}
          >
            {template.title}
          </h4>
        </div>
        <div className='flex justify-between items-center w-full'>
          <div className='flex gap-2'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleShareClick(template, e)}
            >
              <Icon icon='mdi:share' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleRenameClick(template, e)}
            >
              <Icon icon='mdi:pencil' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-300'
              onClick={(e) => handleAIEditClick(template, e)}
            >
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleEditTagsClick(template, e)}
            >
              <Icon icon='mdi:tag-multiple' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-danger hover:bg-danger-50 transition-colors duration-300'
              onClick={(e) => handleDeleteClick(template, e)}
            >
              <Icon icon='mdi:delete' className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )

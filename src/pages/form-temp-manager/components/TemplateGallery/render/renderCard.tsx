import { Card, CardBody, CardFooter, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react"
import { Template } from ".."

export const renderCard =
  (
    onTemplateSelect,
    tagsIndex,
    getItemTags,
    handleRenameClick,
    handleAIEditClick,
    handleDataManageClick,
    handleShareClick,
    handleEditTagsClick,
    handleDeleteClick,
    handlePermissionsClick
  ) =>
  (template: Template) => (
    <Card isPressable isHoverable className='w-full h-[240px] group' onPress={() => onTemplateSelect(template.id)}>
      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='fluent:document-add-48-regular'
            className='w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
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
              className='text-default-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-300'
              onClick={(e) => handleAIEditClick(template, e)}
            >
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
                >
                  <Icon icon='mdi:dots-vertical' className='w-4 h-4' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='模板操作'>
                <DropdownSection title='常用操作'>
                  <DropdownItem
                    key='data'
                    startContent={<Icon icon='mdi:database' className='w-4 h-4' />}
                    onClick={(e) => handleDataManageClick(template, e)}
                  >
                    数据管理
                  </DropdownItem>
                  <DropdownItem
                    key='share'
                    startContent={<Icon icon='mdi:share' className='w-4 h-4' />}
                    onClick={(e) => handleShareClick(template, e)}
                  >
                    分享
                  </DropdownItem>
                  <DropdownItem
                    key='permissions'
                    startContent={<Icon icon='mdi:shield-account' className='w-4 h-4' />}
                    onClick={(e) => handlePermissionsClick(template, e)}
                  >
                    权限管理
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title='模板设置'>
                  <DropdownItem
                    key='rename'
                    startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                    onClick={(e) => handleRenameClick(template, e)}
                  >
                    重命名
                  </DropdownItem>
                  <DropdownItem
                    key='tags'
                    startContent={<Icon icon='mdi:tag-multiple' className='w-4 h-4' />}
                    onClick={(e) => handleEditTagsClick(template, e)}
                  >
                    标签管理
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title='危险操作'>
                  <DropdownItem
                    key='delete'
                    className='text-danger'
                    color='danger'
                    startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                    onPress={(e) => handleDeleteClick(template, e)}
                  >
                    删除
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
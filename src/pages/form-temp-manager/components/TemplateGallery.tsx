// 保持原有代码不变，只修改 CardGallery 的使用部分
return (
    <>
      <CardGallery
        items={internalTemplates}
        renderCard={renderCard}
        emptyState={<EmptyState />}
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={['title']}
        searchPlaceholder="搜索模板..."
        onSearch={setSearchValue}
        customSearch={(template, value) => 
          template.title.toLowerCase().includes(value.toLowerCase())
        }
      />

      {/* 其他 Modal 组件保持不变 */}
    </>
  )
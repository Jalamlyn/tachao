// 保持原有代码不变，只修改 CardGallery 的使用部分
return (
    <>
      <CardGallery
        items={reports}
        renderCard={renderCard}
        emptyState={<EmptyState state={getEmptyState(templates.length > 0)} onCreateReport={onCreateReport} />}
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={['title']}
        searchPlaceholder="搜索报表..."
        onSearch={setSearchValue}
        customSearch={(report, value) => 
          report.title.toLowerCase().includes(value.toLowerCase())
        }
      />

      {/* 其他 Modal 组件保持不变 */}
    </>
  )
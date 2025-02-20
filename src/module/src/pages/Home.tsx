import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const { Tabs, Tab, Card, CardBody, Spinner, Button } = NextUI
const { motion } = FramerMotion

const KnowledgeCard = await wpm.import("comp_knowledge_card")
const knowledgeStore = await wpm.import("store_knowledge")

const HomePage = observer(() => {
  React.useEffect(() => {
    try {
      api.log.info("HomePage组件加载")
      knowledgeStore.loadCategories()
    } catch (error) {
      api.log.error("HomePage加载失败", {
        error: error.message,
      })
    }
  }, [])

  if (knowledgeStore.loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Spinner label='加载中...' color='primary' />
      </div>
    )
  }

  if (knowledgeStore.error) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh]'>
        <p className='text-danger mb-4'>加载失败: {knowledgeStore.error}</p>
        <Button color='primary' onClick={() => knowledgeStore.loadCategories()} className='bg-pink-500 text-white'>
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6 bg-pink-50/30 min-h-screen p-6 rounded-lg'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-pink-700'>宝妈知识库</h1>
        <p className='text-pink-500'>专业的产后护理和育儿知识平台</p>
      </motion.div>

      {knowledgeStore.categories && knowledgeStore.categories.length > 0 ? (
        <Tabs
          selectedKey={knowledgeStore.currentCategory}
          onSelectionChange={knowledgeStore.setCategory}
          variant='light'
          classNames={{
            tabList: "bg-pink-100/50 p-0",
            cursor: "bg-pink-500",
            tab: cn(
              "h-10 px-4 data-[selected=true]:bg-pink-500 data-[selected=true]:text-white",
              "text-pink-700 hover:text-pink-500 transition-colors",
              "data-[selected=true]:font-medium",
              "data-[hover=true]:text-pink-600"
            ),
            tabContent: "group-data-[selected=true]:text-white",
            base: "justify-center",
          }}
        >
          {knowledgeStore.categories.map((category) => (
            <Tab key={category.id} title={category.name} />
          ))}
        </Tabs>
      ) : null}

      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {knowledgeStore.filteredArticles &&
          knowledgeStore.filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <KnowledgeCard article={article} />
            </motion.div>
          ))}
      </motion.div>
    </div>
  )
})

context.wpm.export("page_home", HomePage)
HomePage.displayName = "HomePage"

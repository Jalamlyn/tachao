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
  ReactMarkdown,
  remarkGfm,
} = context

const { Card, CardBody, CardHeader, Image, Button, Chip, Breadcrumbs, BreadcrumbItem, Spinner } = NextUI
const { useParams, Link } = ReactRouterDom
const { motion } = FramerMotion

const knowledgeStore = await wpm.import("store_knowledge")

const ArticlePage = observer(() => {
  const { id } = useParams()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    loadArticle()
  }, [id])

  const loadArticle = async () => {
    try {
      setLoading(true)
      setError(null)

      await knowledgeStore.loadArticleDetail(id)

      api.log.info("文章详情加载成功", {
        articleId: id,
      })
    } catch (error) {
      api.log.error("文章详情加载失败", {
        articleId: id,
        error: error.message,
      })
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Spinner label='加载中...' color='primary' />
      </div>
    )
  }

  if (error || !knowledgeStore.currentArticle) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <Icon icon='solar:document-failed-bold-duotone' className='w-16 h-16 text-danger mb-4' />
        <p className='text-danger mb-4'>{error || "文章不存在"}</p>
        <Button
          as={Link}
          href='/'
          color='primary'
          variant='flat'
          startContent={<Icon icon='solar:home-angle-bold-duotone' className='w-4 h-4' />}
        >
          返回首页
        </Button>
      </div>
    )
  }

  const { title, content, category, coverImage, createdAt } = knowledgeStore.currentArticle

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <Breadcrumbs size='sm' className='mb-6'>
        <BreadcrumbItem>
          <Link to='/' className='text-default-500 hover:text-primary'>
            首页
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/?category=${category}`} className='text-default-500 hover:text-primary'>
            {category}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>文章详情</BreadcrumbItem>
      </Breadcrumbs>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className='border-none'>
          <CardHeader className='flex flex-col items-start px-8 pt-8 pb-0'>
            <div className='flex items-center gap-2 mb-4'>
              <Chip color='primary' variant='flat' size='sm' className='bg-pink-100 text-pink-600'>
                {category}
              </Chip>
              <span className='text-default-400 text-sm'>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className='text-3xl font-bold mb-6'>{title}</h1>
          </CardHeader>

          <CardBody className='px-8 pb-8'>
            <div className='relative w-full h-[400px] mb-8 rounded-xl overflow-hidden'>
              <Image
                src={coverImage || "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27"}
                alt={title}
                className='w-full h-full object-cover'
              />
            </div>

            <div className='prose prose-pink max-w-none dark:prose-invert'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className='text-2xl font-bold mb-4' {...props} />,
                  h2: ({ node, ...props }) => <h2 className='text-xl font-bold mb-3' {...props} />,
                  h3: ({ node, ...props }) => <h3 className='text-lg font-bold mb-2' {...props} />,
                  p: ({ node, ...props }) => <p className='mb-4 text-default-600' {...props} />,
                  ul: ({ node, ...props }) => <ul className='list-disc pl-5 mb-4' {...props} />,
                  ol: ({ node, ...props }) => <ol className='list-decimal pl-5 mb-4' {...props} />,
                  li: ({ node, ...props }) => <li className='mb-1' {...props} />,
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className='px-1 py-0.5 bg-pink-50 dark:bg-pink-900/10 rounded text-pink-500' {...props} />
                    ) : (
                      <code
                        className='block p-4 bg-pink-50 dark:bg-pink-900/10 rounded-lg overflow-x-auto'
                        {...props}
                      />
                    ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className='border-l-4 border-pink-200 dark:border-pink-800 pl-4 italic' {...props} />
                  ),
                  a: ({ node, ...props }) => <a className='text-pink-500 hover:text-pink-600 underline' {...props} />,
                  img: ({ node, ...props }) => <img className='rounded-lg shadow-lg my-4' {...props} />,
                  table: ({ node, ...props }) => (
                    <div className='overflow-x-auto my-4'>
                      <table className='min-w-full divide-y divide-pink-200 dark:divide-pink-800' {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className='px-4 py-2 bg-pink-50 dark:bg-pink-900/10 font-semibold' {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className='px-4 py-2 border-t border-pink-100 dark:border-pink-800' {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {knowledgeStore.relatedArticles.length > 0 && (
              <div className='mt-12'>
                <h2 className='text-xl font-bold mb-4'>相关文章</h2>
                <div className='grid grid-cols-2 gap-4'>
                  {knowledgeStore.relatedArticles.map((article) => (
                    <Card key={article.id} isPressable as={Link} to={`/article/${article.id}`} className='border-1'>
                      <CardBody className='p-4'>
                        <h3 className='font-medium mb-2 line-clamp-2'>{article.title}</h3>
                        <p className='text-default-400 text-sm line-clamp-2'>{article.description}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
})

context.wpm.export("page_article", ArticlePage)
ArticlePage.displayName = "ArticlePage"

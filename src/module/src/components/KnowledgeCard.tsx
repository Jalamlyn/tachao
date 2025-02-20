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

const { Card, CardHeader, CardBody, CardFooter, Image, Button, Link } = NextUI
const { motion } = FramerMotion

const KnowledgeCard = observer(({ article }) => {
  const [imageError, setImageError] = React.useState(false)

  const handleImageError = (e) => {
    api.log.warn("文章图片加载失败", {
      articleId: article.id,
      imageUrl: article.coverImage,
    })
    setImageError(true)
  }

  const fallbackImage = `https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&dpr=2&q=80`

  return (
    <Card isPressable isHoverable className='w-full h-[300px] border-none'>
      <CardHeader className='absolute z-10 top-0 flex-col items-start p-5'>
        <p className='text-tiny text-white/70 uppercase font-bold bg-pink-500/20 px-2 py-1 rounded-full'>
          {article.category}
        </p>
        <h4 className='text-white font-medium text-large mt-2 line-clamp-2 text-shadow'>{article.title}</h4>
      </CardHeader>

      <Image
        removeWrapper
        alt={article.title}
        className='z-0 w-full h-full object-cover brightness-75 hover:scale-105 transition-transform duration-300'
        src={imageError ? fallbackImage : article.coverImage || fallbackImage}
        onError={handleImageError}
      />

      <CardFooter className='absolute bg-gradient-to-t from-black/60 via-black/40 to-transparent bottom-0 z-10 border-t-1 border-white/20'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='solar:calendar-bold' className='text-white/70 w-4 h-4' />
            <p className='text-tiny text-white/70'>{new Date(article.createdAt).toLocaleDateString()}</p>
          </div>
          <p className='text-tiny text-white/90 line-clamp-1'>{article.description}</p>
        </div>
        <Button
          as={Link}
          href={`/article/${article.id}`}
          className={cn(
            "ml-auto bg-gradient-to-r from-pink-500 to-pink-400",
            "text-white font-medium",
            "shadow-lg shadow-pink-500/20",
            "hover:opacity-90 hover:shadow-pink-500/30",
            "transition-all duration-300"
          )}
          radius='full'
          size='sm'
        >
          阅读更多
        </Button>
      </CardFooter>
    </Card>
  )
})

context.wpm.export("comp_knowledge_card", KnowledgeCard)
KnowledgeCard.displayName = "KnowledgeCard"

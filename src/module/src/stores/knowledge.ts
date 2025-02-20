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

const { makeAutoObservable, runInAction } = mobx

class KnowledgeStore {
  categories = []
  articles = []
  currentCategory = "all"
  currentArticle = null
  relatedArticles = []
  loading = false
  error = null

  constructor() {
    makeAutoObservable(this)
  }

  setCategory = (category) => {
    this.currentCategory = category
    api.log.info("切换知识分类", { category })
  }

  get filteredArticles() {
    if (this.currentCategory === "all") {
      return this.articles
    }
    return this.articles.filter((article) => article.category === this.currentCategory)
  }

  loadCategories = async () => {
    try {
      this.loading = true
      api.log.info("开始加载知识分类")

      // 模拟数据，实际项目中应该从API获取
      const categories = [
        { id: "all", name: "全部" },
        { id: "pregnancy", name: "孕期护理" },
        { id: "postpartum", name: "产后恢复" },
        { id: "baby", name: "婴儿护理" },
        { id: "nutrition", name: "营养饮食" },
      ]

      const articles = [
        {
          id: 1,
          title: "产后恢复必知的10个关键点",
          description: "详细解析产后身体恢复的注意事项，帮助新妈妈更好地度过恢复期。",
          category: "postpartum",
          coverImage: "https://images.unsplash.com/photo-1519824145371-296894a0daa9",
          createdAt: new Date("2024-01-15").toISOString(),
          content: `
# 产后恢复必知的10个关键点

产后恢复是每位新妈妈都要经历的重要阶段。以下是10个关键注意事项，帮助您更好地度过恢复期。

## 1. 充足的休息

保证每天至少8小时的睡眠，可以分段进行。在宝宝睡眠时也要及时休息。

## 2. 合理的饮食

- 注意营养均衡
- 多吃含蛋白质的食物
- 补充充足的水分
- 适量食用催乳食物

## 3. 适度运动

从简单的散步开始，逐渐增加运动量。注意不要过度劳累。

## 4. 心理调节

保持积极乐观的心态，有助于身体恢复。如果感到压力，要及时与家人沟通。

## 5. 伤口护理

保持伤口清洁干燥，按医嘱进行护理。

## 6. 哺乳姿势

采用正确的哺乳姿势，避免颈椎和腰部受损。

## 7. 盆底恢复

进行适当的盆底肌训练，促进恢复。

## 8. 营养补充

根据医生建议补充维生素和矿物质。

## 9. 情绪管理

产后情绪波动属于正常现象，要学会自我调节。

## 10. 定期检查

按时进行产后检查，及时发现和解决问题。

记住，每个人的恢复情况都不同，要根据自身情况调整。如有不适，及时就医。
          `,
        },
        {
          id: 2,
          title: "新生儿护理全攻略",
          description: "从洗澡到换尿布，详细的新生儿日常护理指南。",
          category: "baby",
          coverImage: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
          createdAt: new Date("2024-01-16").toISOString(),
          content: "新生儿护理的详细内容...",
        },
        {
          id: 3,
          title: "孕期营养补充指南",
          description: "专业营养师为准妈妈推荐的营养补充方案。",
          category: "pregnancy",
          coverImage: "https://images.unsplash.com/photo-1519824145371-296894a0daa9",
          createdAt: new Date("2024-01-17").toISOString(),
          content: "孕期营养补充的详细内容...",
        },
      ]

      runInAction(() => {
        this.categories = categories
        this.articles = articles
        this.error = null
      })

      api.log.info("知识分类加载成功", {
        categoriesCount: categories.length,
        articlesCount: articles.length,
      })
    } catch (error) {
      api.log.error("加载知识分类失败", {
        error: error.message,
      })
      runInAction(() => {
        this.error = error.message
      })
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  loadArticleDetail = async (articleId) => {
    try {
      api.log.info("开始加载文章详情", { articleId })

      const article = this.articles.find((a) => a.id === Number(articleId))

      if (!article) {
        throw new Error("文章不存在")
      }

      // 获取相关文章
      const related = this.articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 2)

      runInAction(() => {
        this.currentArticle = article
        this.relatedArticles = related
      })

      api.log.info("文章详情加载成功", {
        articleId,
        title: article.title,
        relatedCount: related.length,
      })
    } catch (error) {
      api.log.error("加载文章详情失败", {
        articleId,
        error: error.message,
      })
      throw error
    }
  }
}

const knowledgeStore = new KnowledgeStore()
context.wpm.export("store_knowledge", knowledgeStore)

import ErrorBoundary from "@/components/ErrorBoundary"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { useEffect } from "react"
import AnalysisResult from "../components/AnalysisResult"
import message from "@/components/Message"
import { useNavigate } from "react-router-dom"

export const useLoadData = (
  reportId,
  getReportDetail,
  setCurrentTemplateIds,
  loadFormFilteredDetails,
  setReportData,
  processReportData,
  templateInfoMapRef,
  setProcessedData,
  processedDataRef,
  versionControl,
  setPreviewComponent,
  setPreviewContent,
  searchParams,
  templateId,
  templateInfoMap,
  setIsLoadingTemplates,
  loadTemplateFilteredDetails,
  setTemplateInfoMap
) => {
  const navigate = useNavigate()
  const loadTemplateInfo = async (templateIds: string[]) => {
    setIsLoadingTemplates(true)
    try {
      const templateDetails = await loadTemplateFilteredDetails((index) => templateIds.includes(index.id))
      const templateMap = templateDetails.reduce(
        (acc, template) => {
          acc[template.id] = template.title
          return acc
        },
        {} as Record<string, string>
      )
      setTemplateInfoMap(templateMap)
      templateInfoMapRef.current = templateMap
      // 配置 AIReportAgent
      AIReportAgent.configure({
        templateInfoMap: templateMap,
      })
    } catch (error) {
      console.error("Error loading template info:", error)
      message.error("加载模板信息失败")
    } finally {
      setIsLoadingTemplates(false)
    }
  }
  useEffect(() => {
    const loadData = async () => {
      try {
        if (reportId && reportId !== "create") {
          // 1. 先获取报表信息
          const report = await getReportDetail(reportId)

          // 2. 从报表中获取 templateId
          const reportTemplateIds = report?.data?.templateIds || [report?.data?.templateId]

          if (!reportTemplateIds?.length) {
            throw new Error("报表模板ID不存在")
          }

          setCurrentTemplateIds(reportTemplateIds)
          await loadTemplateInfo(reportTemplateIds)

          // 3. 使用 templateIds 获取最新的表单数据
          const formDetails = await loadFormFilteredDetails((index) =>
            reportTemplateIds.includes(index.indexFields?.templateId)
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              templateId: detail.indexFields?.templateId,
              ...detail.data,
            }))

            // 4. 设置最新数据
            setReportData(formData)
            const processed = processReportData(formData, templateInfoMapRef.current)
            setProcessedData(processed)
            processedDataRef.current = processed
          }

          // 5. 加载已有的分析结果
          if (report?.data?.rawConfig) {
            versionControl.addVersion({
              rawConfig: report.data.rawConfig,
            })

            // 使用 rawConfig 重新分析数据
            const analysis = await AIReportAgent.analyzeData(processedDataRef.current, report.data.rawConfig)

            setPreviewComponent(
              <ErrorBoundary
                onReset={() => {
                  const prevVersion = versionControl.rollback()
                  if (prevVersion) {
                    setPreviewContent(prevVersion.rawConfig || "")
                    AIReportAgent.analyzeData(processedDataRef.current, prevVersion.rawConfig || "")
                      .then((analysis) => {
                        setPreviewComponent(<AnalysisResult analysis={analysis} />)
                      })
                      .catch((error) => {
                        message.error("分析数据失败")
                        console.error(error)
                      })
                  }
                }}
              >
                <AnalysisResult analysis={analysis} />
              </ErrorBoundary>
            )
            setPreviewContent(report.data.rawConfig)
          }
        } else {
          // 处理创建新报表的场景
          const templateIds = searchParams.get("templateIds")?.split(",") || [templateId]
          setCurrentTemplateIds(templateIds)
          await loadTemplateInfo(templateIds)

          const formDetails = await loadFormFilteredDetails((index) =>
            templateIds.includes(index.indexFields?.templateId)
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              templateId: detail.indexFields?.templateId,
              ...detail.data,
            }))

            setReportData(formData)
            const processed = processReportData(formData, templateInfoMap)
            setProcessedData(processed)
            processedDataRef.current = processed
          }
        }
      } catch (error) {
        console.error("[loadData] Error loading data:", error)
        message.error("数据加载失败")
        navigate("/we-chat-app/admin/reports")
      }
    }

    loadData()
  }, [reportId, templateId, searchParams])
}

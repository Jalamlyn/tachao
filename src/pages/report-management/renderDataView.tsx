import { Tabs, Tab } from "@nextui-org/react"
import { processReportData } from "@/utils/processReportData"
import DataTable from "@/pages/report-management/components/DataTable"

export const getRenderDataView =
  (templateInfoMap, currentTemplateIds, processedData, reportData, activeDataTab, setActiveDataTab) => () => {
    const getTemplateTitle = (templateId: string) => {
      return templateInfoMap[templateId] || `模板 ${templateId}`
    }
    if (currentTemplateIds.length <= 1) {
      // 单模板场景 - 保持原有展示方式
      return (
        <DataTable
          columns={processedData.columns}
          flattenedData={processedData.flattenedData}
          isLoading={!processedData.columns.length || !processedData.flattenedData.length}
        />
      )
    }

    // 多模板场景 - 使用 Tabs 展示
    const templateData = reportData.reduce((acc, item) => {
      const templateId = item.templateId
      if (!acc[templateId]) {
        acc[templateId] = []
      }
      acc[templateId].push(item)
      return acc
    }, {})

    return (
      <Tabs
        size='sm'
        variant='underlined'
        selectedKey={activeDataTab}
        onSelectionChange={(key) => setActiveDataTab(key as string)}
      >
        <Tab key='all' title='全部数据'>
          <DataTable
            columns={processedData.columns}
            flattenedData={processedData.flattenedData}
            isLoading={!processedData.columns.length || !processedData.flattenedData.length}
            showSourceIndicator
          />
        </Tab>
        {Object.entries(templateData).map(([templateId, data]) => {
          const processed = processReportData(data as any[], templateInfoMap)
          const templateTitle = getTemplateTitle(templateId)

          return (
            <Tab key={templateId} title={templateTitle}>
              <DataTable
                columns={processed.columns}
                flattenedData={processed.flattenedData}
                isLoading={!processed.columns.length || !processed.flattenedData.length}
              />
            </Tab>
          )
        })}
      </Tabs>
    )
  }

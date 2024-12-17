import { useEffect, useState } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pagination } from "@nextui-org/react" // 引入 nextui 的 Pagination 组件
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"
import { useMetadataTable } from "@/components/metadata-table/useMetadataTable" // 引入 useMetadataTable

const CostRecords = () => {
  // 使用 useMetadataTable 来管理分页和数据逻辑
  const {
    data: records,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = useMetadataTable({
    type: "ai-cost-records",
    searchFields: ["timestamp", "model"],
    pagination: { defaultPageSize: 10, pageSizeOptions: [10, 20, 50] },
  })

  return (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon='solar:card-transfer-bold-duotone' className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>费用明细</h3>
        </div>
        <Table aria-label='费用明细表'>
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>模型</TableColumn>
            <TableColumn>输入Token</TableColumn>
            <TableColumn>输出Token</TableColumn>
            <TableColumn>输入费用(塔币)</TableColumn>
            <TableColumn>输出费用(塔币)</TableColumn>
            <TableColumn>总费用(塔币)</TableColumn>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                <TableCell>{record.model === "ADVANCED" ? "高级模型" : "专家模型"}</TableCell>
                <TableCell>{record.promptTokenCount}</TableCell>
                <TableCell>{record.candidatesTokenCount}</TableCell>
                <TableCell>{record.inputCost.toFixed(4)}</TableCell>
                <TableCell>{record.outputCost.toFixed(4)}</TableCell>
                <TableCell>{record.totalCost.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 使用 nextui 的 Pagination 组件 */}
        <div className="flex justify-center items-center mt-4">
          <Pagination
            total={Math.ceil(total / pageSize)}
            initialPage={1}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            size="lg"
            color="primary" // 设置主题颜色
            showShadow // 为当前页添加阴影效果
            isCompact // 启用紧凑模式
            loop // 启用分页循环
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default CostRecords
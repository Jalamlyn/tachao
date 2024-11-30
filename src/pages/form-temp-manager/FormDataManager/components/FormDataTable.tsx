import React, { useMemo } from "react";
import { ResourceDataTable } from "@/components/common/data-table/ResourceDataTable";
import { processReportData } from "../../utils/processReportData";

interface FormDataTableProps {
  data: any[];
  templateId: string;
  templateTitle: string;
  onSelectionChange?: (selectedRows: string[]) => void;
  onRefresh?: () => void;
}

const FormDataTable: React.FC<FormDataTableProps> = ({
  data,
  templateId,
  templateTitle,
  onSelectionChange,
  onRefresh,
}) => {
  // 处理数据
  const processedData = useMemo(() => {
    const templateInfoMap = { [templateId]: templateTitle };
    return processReportData(data, templateInfoMap);
  }, [data, templateId, templateTitle]);

  // 转换为 ResourceDataTable 期望的格式
  const tableData = useMemo(() => ({
    data: processedData.flattenedData,
    columns: processedData.columns.map(col => ({
      ...col,
      enableSorting: true,
      enableFiltering: true,
    })),
  }), [processedData]);

  return (
    <ResourceDataTable
      id={`form-data-${templateId}`}
      appId="form-management"
      initialData={tableData}
      onSelectionChange={onSelectionChange}
      onRefresh={onRefresh}
    />
  );
};

export default FormDataTable;
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useMetadata } from "@/hooks/useMetadata";
import PageLayout from "@/components/PageLayout";
import FormDataTable from "./components/FormDataTable";
import message from "@/components/Message";
import { processReportData } from "../utils/processReportData";

const FormDataManager: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const location = useLocation();
  const { title } = location.state || {};
  
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const { loadFilteredDetails, remove } = useMetadata("form");

  // 加载表单数据
  const loadFormData = async () => {
    if (!templateId) return;
    
    setIsLoading(true);
    try {
      const forms = await loadFilteredDetails(
        (index) => index.indexFields?.templateId === templateId
      );
      setFormData(forms);
    } catch (error) {
      console.error("Failed to load form data:", error);
      message.error("加载表单数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [templateId]);

  // 处理数据统计
  const statistics = useMemo(() => {
    return {
      total: formData.length,
      completed: formData.filter(item => 
        item.processConfirmations?.completed
      ).length,
      pending: formData.filter(item => 
        !item.processConfirmations?.completed
      ).length
    };
  }, [formData]);

  // 处理批量导出
  const handleExport = async () => {
    try {
      // 导出逻辑
      message.success("导出成功");
    } catch (error) {
      message.error("导出失败");
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (!selectedRows.length) return;
    
    try {
      await Promise.all(selectedRows.map(id => remove(id)));
      message.success("删除成功");
      loadFormData();
      setSelectedRows([]);
    } catch (error) {
      message.error("删除失败");
    }
  };

  const pageActions = (
    <div className="flex gap-2">
      <Button
        variant="flat"
        color="primary"
        onClick={handleExport}
        startContent={<Icon icon="mdi:file-export" className="w-4 h-4" />}
      >
        导出数据
      </Button>
      {selectedRows.length > 0 && (
        <Button
          variant="flat"
          color="danger"
          onClick={handleBatchDelete}
          startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
        >
          批量删除
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout 
      title={`${title || '表单'} - 数据管理`}
      titleIcon="mdi:database"
      actions={pageActions}
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500">总数据量</div>
          <div className="text-2xl font-bold">{statistics.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">已完成</div>
          <div className="text-2xl font-bold text-success">
            {statistics.completed}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">待处理</div>
          <div className="text-2xl font-bold text-warning">
            {statistics.pending}
          </div>
        </Card>
      </div>

      {/* 数据表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner label="加载中..." />
        </div>
      ) : (
        <FormDataTable
          data={formData}
          templateId={templateId}
          templateTitle={title}
          onSelectionChange={setSelectedRows}
          onRefresh={loadFormData}
        />
      )}
    </PageLayout>
  );
};

export default FormDataManager;
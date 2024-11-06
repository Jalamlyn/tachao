import React from "react";
import { Breadcrumbs, BreadcrumbItem, Tabs, Tab } from "@nextui-org/react";
import DocumentContent from "./DocumentContent";
import TableContent from "./TableContent";
import ReportContent from "./ReportContent";
import { Icon } from "@iconify/react";

const AppDetail: React.FC = () => {
  return (
    <div className="p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem href="/we-chat-app/admin">首页</BreadcrumbItem>
        <BreadcrumbItem href="/we-chat-app/admin/applications">应用列表</BreadcrumbItem>
        <BreadcrumbItem>应用详情</BreadcrumbItem>
      </Breadcrumbs>

      <h1 className="text-2xl font-bold mb-4">应用详情</h1>

      <Tabs aria-label="应用详情标签页" color="primary" variant="bordered">
        <Tab
          key="documents"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:file-document-outline" width="20" height="20" />
              <span>单据</span>
            </div>
          }
        >
          <DocumentContent />
        </Tab>
        <Tab
          key="tables"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:table" width="20" height="20" />
              <span>表格</span>
            </div>
          }
        >
          <TableContent />
        </Tab>
        <Tab
          key="reports"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:chart-bar" width="20" height="20" />
              <span>报表</span>
            </div>
          }
        >
          <ReportContent />
        </Tab>
      </Tabs>
    </div>
  );
};

export default AppDetail;
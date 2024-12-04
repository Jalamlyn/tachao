import React from 'react';
import { Card, CardBody, CardFooter, Button, Chip, Tabs, Tab } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@nextui-org/react";
import ServiceConsultModal from "./ServiceConsultModal";
import PageLayout from "@/components/PageLayout";

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'industry';
  category: string;
  status: 'available' | 'comingSoon' | 'beta' | 'enterprise';
  features: string[];
  thumbnail?: string;
}

const functionalTemplates: FormTemplate[] = [
  {
    id: 'process-form',
    title: '通用流程表单',
    description: '适用于各类审批流程和数据收集场景',
    type: 'functional',
    category: 'process',
    status: 'available',
    features: ['流程审批', '数据收集', '状态管理'],
  },
  {
    id: 'survey-form',
    title: '问卷调查表单',
    description: '用于市场调研、满意度调查等场景',
    type: 'functional',
    category: 'survey',
    status: 'comingSoon',
    features: ['多题型支持', '逻辑跳转', '数据分析'],
  },
  {
    id: 'custom-form',
    title: '专业定制表单',
    description: '企业级定制化表单解决方案',
    type: 'functional',
    category: 'custom',
    status: 'available',
    features: ['需求分析', '专属定制', '技术支持'],
  },
  {
    id: 'hr-form',
    title: '人力资源表单',
    description: '适用于招聘、考勤、绩效评估等人事场景',
    type: 'functional',
    category: 'hr',
    status: 'available',
    features: ['招聘管理', '考勤记录', '绩效评估'],
  },
  {
    id: 'finance-form',
    title: '财务报销表单',
    description: '用于费用报销、预算申请等财务场景',
    type: 'functional',
    category: 'finance',
    status: 'available',
    features: ['费用报销', '预算管理', '审批流程'],
  },
  {
    id: 'project-form',
    title: '项目管理表单',
    description: '适用于项目立项、进度跟踪等项目管理场景',
    type: 'functional',
    category: 'project',
    status: 'available',
    features: ['项目立项', '进度跟踪', '资源分配'],
  },
  {
    id: 'customer-service-form',
    title: '客户服务表单',
    description: '用于客户反馈、服务评价等客服场景',
    type: 'functional',
    category: 'customer-service',
    status: 'available',
    features: ['客户反馈', '服务评价', '问题跟踪'],
  },
  {
    id: 'asset-form',
    title: '资产管理表单',
    description: '适用于设备领用、资产盘点等资产管理场景',
    type: 'functional',
    category: 'asset',
    status: 'available',
    features: ['资产登记', '设备领用', '盘点管理'],
  }
];

const industryTemplates: FormTemplate[] = [
  {
    id: 'education-form',
    title: '教育培训表单',
    description: '适用于教育机构的招生、考试等场景',
    type: 'industry',
    category: 'education',
    status: 'available',
    features: ['在线考试', '课程报名', '成绩管理'],
  },
  {
    id: 'healthcare-form',
    title: '医疗健康表单',
    description: '适用于医疗机构的问诊、预约等场景',
    type: 'industry',
    category: 'healthcare',
    status: 'available',
    features: ['在线问诊', '预约挂号', '健康档案'],
  },
  {
    id: 'retail-form',
    title: '零售行业表单',
    description: '适用于会员管理、商品反馈等零售场景',
    type: 'industry',
    category: 'retail',
    status: 'available',
    features: ['会员登记', '商品反馈', '库存管理'],
  },
  {
    id: 'manufacturing-form',
    title: '制造业表单',
    description: '适用于生产计划、质量检验等制造场景',
    type: 'industry',
    category: 'manufacturing',
    status: 'available',
    features: ['生产计划', '质量检验', '物料管理'],
  },
  {
    id: 'finance-industry-form',
    title: '金融行业表单',
    description: '适用于开户申请、理财产品购买等金融场景',
    type: 'industry',
    category: 'finance',
    status: 'available',
    features: ['开户申请', '理财购买', '风险评估'],
  },
  {
    id: 'real-estate-form',
    title: '房地产表单',
    description: '适用于看房预约、房屋验收等房地产场景',
    type: 'industry',
    category: 'real-estate',
    status: 'available',
    features: ['预约看房', '房屋验收', '租赁管理'],
  },
  {
    id: 'restaurant-form',
    title: '餐饮服务表单',
    description: '适用于预订登记、配送信息等餐饮场景',
    type: 'industry',
    category: 'restaurant',
    status: 'available',
    features: ['预订登记', '配送管理', '会员服务'],
  }
];

const TemplateCard: React.FC<{
  template: FormTemplate;
  onSelect: (template: FormTemplate) => void;
}> = ({ template, onSelect }) => {
  const isCustom = template.id === 'custom-form';
  const isAvailable = template.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`w-full hover:shadow-lg transition-shadow duration-300 ${
          isCustom ? 'border-2 border-primary' : ''
        }`}
        isPressable={isAvailable}
        onPress={() => isAvailable && onSelect(template)}
      >
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              isCustom ? 'bg-primary text-white' : 'bg-default-100'
            }`}>
              <Icon 
                icon={isCustom ? "mdi:crown" : "mdi:file-document-outline"} 
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{template.title}</h3>
                {isCustom && (
                  <Chip color="primary" variant="flat" size="sm">推荐</Chip>
                )}
                {!isAvailable && (
                  <Chip variant="flat" size="sm">即将推出</Chip>
                )}
              </div>
              <p className="text-small text-default-500">{template.description}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {template.features.map((feature, index) => (
                <Chip key={index} variant="flat" size="sm">
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
        <CardFooter className="gap-2">
          {isCustom ? (
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:crown" className="w-4 h-4" />}
              onPress={() => onSelect(template)}
            >
              咨询定制方案
            </Button>
          ) : (
            <Button
              color="default"
              variant="flat"
              startContent={<Icon icon="mdi:arrow-right" className="w-4 h-4" />}
              isDisabled={!isAvailable}
              onPress={() => isAvailable && onSelect(template)}
            >
              {isAvailable ? '使用此模板' : '即将推出'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const FormTemplateSelect: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleTemplateSelect = (template: FormTemplate) => {
    if (template.id === 'custom-form') {
      onOpen();
      return;
    }

    navigate(`/we-chat-app/admin/documents/create/${template.id}`, {
      state: {
        templateType: template.type,
        templateTitle: template.title,
        templateDescription: template.description
      }
    });
  };

  return (
    <PageLayout title='选择表单模板' titleIcon='mdi:form-select'>
      <div>
        <Tabs aria-label="表单模板分类">
          <Tab 
            key="functional" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:function" className="w-4 h-4" />
                <span>按功能分类</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {functionalTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          </Tab>
          <Tab 
            key="industry" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:domain" className="w-4 h-4" />
                <span>按行业分类</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {industryTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          </Tab>
        </Tabs>

        <ServiceConsultModal isOpen={isOpen} onClose={onClose} />
      </div>
    </PageLayout>
  );
};

export default FormTemplateSelect;
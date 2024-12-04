import { FormTemplate } from "./FormTemplateSelect";

export const functionalTemplates: FormTemplate[] = [
  {
    id: "process-form",
    title: "通用流程表单",
    description: "适用于各类审批流程和数据收集场景",
    type: "functional",
    category: "process",
    status: "available",
    features: ["流程审批", "数据收集", "状态管理"],
    promptTemplate: "process-template-prompt"
  },
  {
    id: "hr-form",
    title: "人力资源表单",
    description: "用于招聘、考勤、绩效评估等人事场景",
    type: "functional",
    category: "hr",
    status: "available",
    features: ["招聘管理", "人员入职", "绩效考核", "培训记录"],
    promptTemplate: "hr-template-prompt"
  },
  {
    id: "custom-form",
    title: "专业定制表单",
    description: "企业级定制化表单解决方案",
    type: "functional",
    category: "custom",
    status: "available",
    features: ["需求分析", "专属定制", "技术支持"],
    promptTemplate: "custom-template-prompt"
  },
  {
    id: "finance-form",
    title: "财务报销表单",
    description: "用于费用报销、预算申请等财务场景",
    type: "functional",
    category: "finance",
    status: "comingSoon",
    features: ["费用报销", "预算管理", "审批流程"],
    promptTemplate: "finance-template-prompt"
  },
  {
    id: "project-form",
    title: "项目管理表单",
    description: "适用于项目立项、进度跟踪等项目管理场景",
    type: "functional",
    category: "project",
    status: "comingSoon",
    features: ["项目立项", "进度跟踪", "资源分配"],
    promptTemplate: "project-template-prompt"
  },
  {
    id: "customer-service-form",
    title: "客户服务表单",
    description: "用于客户反馈、服务评价等客服场景",
    type: "functional",
    category: "customer-service",
    status: "comingSoon",
    features: ["客户反馈", "服务评价", "问题跟踪"],
    promptTemplate: "customer-service-template-prompt"
  },
  {
    id: "asset-form",
    title: "资产管理表单",
    description: "适用于设备领用、资产盘点等资产管理场景",
    type: "functional",
    category: "asset",
    status: "comingSoon",
    features: ["资产登记", "设备领用", "盘点管理"],
    promptTemplate: "asset-template-prompt"
  },
];

export const industryTemplates: FormTemplate[] = [
  {
    id: "education-form",
    title: "教育培训表单",
    description: "适用于教育机构的招生、考试等场景",
    type: "industry",
    category: "education",
    status: "comingSoon",
    features: ["在线考试", "课程报名", "成绩管理"],
    promptTemplate: "education-template-prompt"
  },
  {
    id: "healthcare-form",
    title: "医疗健康表单",
    description: "适用于医疗机构的问诊、预约等场景",
    type: "industry",
    category: "healthcare",
    status: "comingSoon",
    features: ["在线问诊", "预约挂号", "健康档案"],
    promptTemplate: "healthcare-template-prompt"
  },
  {
    id: "retail-form",
    title: "零售行业表单",
    description: "适用于会员管理、商品反馈等零售场景",
    type: "industry",
    category: "retail",
    status: "comingSoon",
    features: ["会员登记", "商品反馈", "库存管理"],
    promptTemplate: "retail-template-prompt"
  },
  {
    id: "manufacturing-form",
    title: "制造业表单",
    description: "适用于生产计划、质量检验等制造场景",
    type: "industry",
    category: "manufacturing",
    status: "comingSoon",
    features: ["生产计划", "质量检验", "物料管理"],
    promptTemplate: "manufacturing-template-prompt"
  },
  {
    id: "finance-industry-form",
    title: "金融行业表单",
    description: "适用于开户申请、理财产品购买等金融场景",
    type: "industry",
    category: "finance",
    status: "comingSoon",
    features: ["开户申请", "理财购买", "风险评估"],
    promptTemplate: "finance-industry-template-prompt"
  },
  {
    id: "real-estate-form",
    title: "房地产表单",
    description: "适用于看房预约、房屋验收等房地产场景",
    type: "industry",
    category: "real-estate",
    status: "comingSoon",
    features: ["预约看房", "房屋验收", "租赁管理"],
    promptTemplate: "real-estate-template-prompt"
  },
  {
    id: "restaurant-form",
    title: "餐饮服务表单",
    description: "适用于预订登记、配送信息等餐饮场景",
    type: "industry",
    category: "restaurant",
    status: "comingSoon",
    features: ["预订登记", "配送管理", "会员服务"],
    promptTemplate: "restaurant-template-prompt"
  },
];
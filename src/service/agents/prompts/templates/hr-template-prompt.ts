import { TemplatePrompt } from '../types'

/**
 * HR模板提示词
 * 包含人力资源相关表单的标准化需求描述
 */
export const hrTemplatePrompt: TemplatePrompt = {
  title: '人力资源表单',
  description: '适用于招聘、考勤、绩效评估等人事场景',
  category: 'hr',
  version: '1.0.0',
  prompt: `我需要创建一个完整的人力资源管理表单系统，这是一个用于员工招聘、入职、考勤和绩效管理的综合性表单。

具体需求如下：

1. 基础信息收集
   - 应聘者/员工基本信息
     * 姓名（必填）
     * 性别（单选）
     * 出生日期（日期选择）
     * 身份证号（必填，需要验证格式）
     * 联系电话（必填，需要验证格式）
     * 电子邮箱（必填，需要验证格式）
     * 现居地址（必填）
     * 期望工作地点（多选）

2. 教育背景
   - 学历信息（可添加多条）
     * 学校名称（必填）
     * 专业名称（必填）
     * 学历层次（下拉选择：专科/本科/硕士/博士）
     * 入学时间（日期选择）
     * 毕业时间（日期选择）
     * 是否应届（自动根据毕业时间判断）

3. 工作经验
   - 工作经历（可添加多条）
     * 公司名称（必填）
     * 职位名称（必填）
     * 所在部门
     * 入职时间（日期选择）
     * 离职时间（日期选择）
     * 工作描述（文本框）
     * 离职原因

4. 技能评估
   - 专业技能（可添加多条）
     * 技能名称（必填）
     * 掌握程度（评分：1-5星）
     * 使用时长
     * 相关证书

5. 面试评估（主管填写）
   - 面试记录
     * 面试官（必填）
     * 面试时间（日期时间选择）
     * 面试方式（单选：现场/视频/电话）
     * 技术评分（1-5分）
     * 沟通评分（1-5分）
     * 综合评分（1-5分）
     * 面试记录（富文本编辑器）
     * 是否通过（是/否）

6. 入职登记
   - 入职信息
     * 部门（必填，下拉选择）
     * 职位（必填）
     * 直属上级（必填）
     * 工号（自动生成）
     * 入职日期（日期选择）
     * 试用期长度（月）
     * 合同期限（年）
     * 基本工资
     * 社保缴纳基数

7. 附件上传
   - 证件照片（必填）
   - 身份证扫描件（必填）
   - 学历证书
   - 专业证书
   - 其他附件

业务规则：
1. 表单分步骤填写，每步完成后才能进入下一步
2. 必填字段需要实时验证
3. 身份证号码需要验证真实性
4. 联系方式需要验证格式
5. 薪资字段需要加密处理
6. 附件上传需要限制文件大小和格式
7. 面试评估需要记录评估人和评估时间
8. 提供暂存功能，可以保存草稿
9. 根据不同角色显示不同的表单内容

流程控制：
1. 应聘者只能填写基础信息到技能评估部分
2. 面试评估只能由具有面试官权限的用户填写
3. 入职登记只能由HR人员填写
4. 表单提交后生成PDF文档
5. 需要支持审批流程
6. 提供数据导出功能

UI要求：
1. 分步骤显示，有进度提示
2. 表单验证要实时反馈
3. 必填字段要明显标识
4. 大文本输入要支持富文本编辑
5. 提供预览功能
6. 响应式设计，支持移动端

请根据以上需求，生成一个完整的人力资源管理表单。表单要具有良好的扩展性，后续可能会增加新的字段和功能。同时要考虑数据的安全性和私密性，确保敏感信息得到适当保护。`,

  examples: [
    {
      title: '面试评估表',
      description: '用于记录面试过程和评估结果',
      fields: [
        { name: 'interviewer', label: '面试官', type: 'text', required: true },
        { name: 'candidate', label: '候选人', type: 'text', required: true },
        { name: 'date', label: '面试日期', type: 'date', required: true },
        { name: 'evaluation', label: '评估结果', type: 'textarea', required: true }
      ]
    },
    {
      title: '入职登记表',
      description: '新员工入职信息采集',
      fields: [
        { name: 'name', label: '姓名', type: 'text', required: true },
        { name: 'department', label: '部门', type: 'select', required: true },
        { name: 'position', label: '职位', type: 'text', required: true },
        { name: 'startDate', label: '入职日期', type: 'date', required: true }
      ]
    }
  ],

  metadata: {
    industry: '人力资源',
    complexity: 'high',
    estimatedFields: 50,
    commonUses: [
      '招聘管理',
      '人员入职',
      '绩效考核',
      '培训记录'
    ],
    relatedTemplates: [
      'performance-evaluation',
      'training-record',
      'leave-application'
    ]
  }
}

export default hrTemplatePrompt
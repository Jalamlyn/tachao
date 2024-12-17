/**
 * 通用流程表单模板提示词
 * 包含通用审批流程相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const processTemplatePrompt = `这是一个用于通用审批流程管理的综合性表单。

具体需求如下：

1. 申请信息分组
   - 基本信息
     * 申请人（resource，关联员工主数据，必填）
     * 申请部门（resource，关联部门主数据，必填）
     * 申请日期（date，必填）
     * 紧急程度（select，选项：普通/紧急/特急，必填）
     * 申请标题（text，必填）
     * 申请说明（textarea，必填）
     * 预计完成日期（date）
     * 相关附件（file，支持多文件上传）

   - 申请类型
     * 流程类型（select，必填，选项：行政审批/财务审批/人事审批/其他）
     * 子类型（select，根据流程类型联动）
     * 是否需要会签（switch）
     * 会签部门（resource，关联部门主数据，多选）

2. 费用明细表格（如果涉及费用）
   - 可添加多行记录，包含字段：
     * 费用类型（select，必填）
     * 费用金额（number，必填）
     * 费用说明（text）
     * 发生日期（date）
     * 发票凭证（file，支持图片上传）
     * 报销金额（number，必填）
     * 实报金额（number，自动计算）

3. 审批流程步骤
   - 部门主管审批
     * 审批人（resource，关联员工主数据）
     * 审批时间（datetime）
     * 审批结果（radio：同意/不同意/退回）
     * 审批意见（textarea）
     * 附件上传（file）
     * 审批签名（signature）

   - 分管领导审批（金额超过阈值时显示）
     * 审批人（resource，关联员工主数据）
     * 审批时间（datetime）
     * 审批结果（radio：同意/不同意/退回）
     * 审批意见（textarea）
     * 附件上传（file）
     * 审批签名（signature）

   - 会签部门审批（如果需要会签）
     * 会签部门（resource，关联部门主数据）
     * 会签人（resource，关联员工主数据）
     * 会签时间（datetime）
     * 会签意见（textarea）
     * 会签结果（radio：同意/不同意/退回）
     * 会签签名（signature）

   - 最终审批
     * 审批人（resource，关联员工主数据）
     * 审批时间（datetime）
     * 审批结果（radio：同意/不同意/退回）
     * 审批意见（textarea）
     * 附件上传（file）
     * 审批签名（signature）

4. 执行反馈
   - 执行信息
     * 执行人（resource，关联员工主数据）
     * 开始时间（datetime）
     * 完成时间（datetime）
     * 执行状态（select：进行中/已完成/暂停/终止）
     * 执行说明（textarea）
     * 相关附件（file）

   - 执行进度
     * 进度比例（slider，0-100）
     * 最新更新（datetime）
     * 进度说明（textarea）
     * 遇到的问题（textarea）
     * 解决方案（textarea）


上述需求是否满足您的需求？如果不满足您可以告诉我您需要什么功能，我随时调整模板内容`

export default processTemplatePrompt

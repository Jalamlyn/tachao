/**
 * 客户服务表单模板提示词
 * 包含客户服务相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const customerServiceTemplatePrompt = `这是一个用于客户服务、反馈处理和满意度调查的综合性表单。

具体需求如下：

1. 客户信息分组
   - 基本信息
     * 客户名称（resource，关联客户主数据，必填）
     * 联系人（text，必填）
     * 联系电话（tel，必填）
     * 电子邮箱（email）
     * 客户等级（select：VIP/普通/潜在）
     * 所属行业（select）
     * 服务区域（select）
     * 客户来源（select：直销/代理商/网络/其他）

   - 服务记录
     * 服务编号（text，自动生成）
     * 服务类型（select，必填：咨询/投诉/建议/售后/其他）
     * 紧急程度（select：普通/紧急/特急）
     * 受理时间（datetime，必填）
     * 预计响应时间（datetime）
     * 服务方式（select：电话/现场/远程/邮件）

2. 问题描述分组
   - 问题信息
     * 问题类型（select，必填）
     * 问题标题（text，必填）
     * 问题描述（textarea，必填）
     * 相关产品（resource，关联产品主数据）
     * 问题图片（image，支持多图片）
     * 相关附件（file）
     * 重现步骤（textarea）
     * 影响范围（select：个别/部分/全部）

   - 初步诊断
     * 问题级别（select：一般/严重/致命）
     * 优先级（select：低/中/高）
     * 预估解决时间（number）
     * 初步分析（textarea）
     * 临时解决方案（textarea）

3. 处理过程表格
   - 可添加多行记录，包含字段：
     * 处理时间（datetime，必填）
     * 处理人（resource，关联员工主数据，必填）
     * 处理类型（select：诊断/处理/回访）
     * 处理方式（select：电话/现场/远程）
     * 处理描述（textarea，必填）
     * 处理结果（textarea）
     * 相关图片（image）
     * 处理状态（select：处理中/已解决/待验证）
     * 耗时（number，单位：分钟）

4. 解决方案分组
   - 问题解决
     * 解决方案（textarea，必填）
     * 解决时间（datetime，必填）
     * 解决人（resource，关联员工主数据）
     * 解决方式（select：现场解决/远程解决/其他）
     * 相关文档（file）
     * 解决说明（textarea）
     * 预防措施（textarea）
     * 经验总结（textarea）

5. 满意度评价
   - 客户反馈
     * 是否解决（radio：是/否）
     * 解决效果（select：完全解决/部分解决/未解决）
     * 服务态度（rate，1-5星）
     * 响应速度（rate，1-5星）
     * 专业程度（rate，1-5星）
     * 整体满意度（rate，1-5星）
     * 评价内容（textarea）
     * 改进建议（textarea）

6. 服务确认流程
   - 客服主管审核
     * 审核人（resource，关联员工主数据）
     * 审核时间（datetime）
     * 审核结果（radio：通过/不通过/退回）
     * 审核意见（textarea）
     * 审核签名（signature）

   - 质量评估
     * 评估人（resource，关联员工主数据）
     * 评估时间（datetime）
     * 服务质量（select：优/良/中/差）
     * 评估意见（textarea）
     * 改进建议（textarea）
     * 评估签名（signature）

特殊功能支持：
1. 表单分组展示，使用 Tabs 切换
2. 支持表格数据的动态添加和删除
3. 支持图片上传和预览
4. 支持电子签名
5. 支持资源选择（关联主数据）
6. 支持数字字段的自动计算
7. 支持必填字段实时验证
8. 支持表单打印，生成标准化的 PDF 文档
9. 支持流程确认步骤的状态追踪
10. 支持表单数据的暂存和恢复
11. 支持服务质量评估
12. 支持客户满意度统计
13. 支持服务时效监控
14. 支持知识库关联
15. 支持服务报表导出

上述需求是否满足您的需求？如果不满足您可以告诉我您需要什么功能，我随时调整模板内容`

export default customerServiceTemplatePrompt

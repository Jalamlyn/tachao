/**
 * 医疗健康表单模板提示词
 * 包含医疗机构的问诊、预约等相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const healthcareTemplatePrompt = `这是一个用于医疗机构的问诊、预约和健康管理的综合性表单。

具体需求如下：

1. 患者基本信息分组
   - 个人信息
     * 患者姓名（text，必填）
     * 性别（radio：男/女）
     * 出生日期（date，必填）
     * 身份证号（text，必填，支持验证）
     * 联系电话（tel，必填）
     * 电子邮箱（email）
     * 现居地址（textarea）
     * 职业（text）
     * 婚姻状况（select：未婚/已婚/离异/丧偶）

   - 紧急联系人
     * 联系人姓名（text，必填）
     * 与患者关系（select）
     * 联系电话（tel，必填）
     * 居住地址（textarea）

2. 就医信息分组
   - 就诊信息
     * 就诊号（text，自动生成）
     * 就诊类型（select：门诊/急诊/复诊）
     * 科室（resource，关联科室主数据，必填）
     * 医生（resource，关联医生主数据，必填）
     * 预约时间（datetime，必填）
     * 就诊状态（select：待就诊/就诊中/已完成/已取消）
     * 医保类型（select：城镇职工/城镇居民/新农合/自费）
     * 医保卡号（text）

   - 病历信息
     * 主诉（textarea，必填）
     * 现病史（textarea）
     * 既往史（textarea）
     * 家族史（textarea）
     * 过敏史（textarea）
     * 体格检查（textarea）
     * 初步诊断（textarea）
     * 处理意见（textarea）

3. 检查检验表格
   - 可添加多行记录，包含字段：
     * 项目名称（resource，关联检查项目主数据，必填）
     * 检查类型（select：检验/影像/特检）
     * 检查科室（resource，关联科室主数据）
     * 检查医生（resource，关联医生主数据）
     * 检查时间（datetime）
     * 检查结果（textarea）
     * 结果解释（textarea）
     * 异常标记（switch）
     * 报告附件（file）
     * 备注说明（textarea）

4. 处方用药表格
   - 可添加多行记录，包含字段：
     * 药品名称（resource，关联药品主数据，必填）
     * 规格（text，自动获取）
     * 用法（select）
     * 用量（number）
     * 单位（text，自动获取）
     * 频次（select）
     * 用药天数（number）
     * 总量（number，自动计算）
     * 单价（number，自动获取）
     * 金额（number，自动计算）
     * 备注（textarea）

5. 治疗记录表格
   - 可添加多行记录，包含字段：
     * 治疗项目（resource，关联治疗项目主数据，必填）
     * 治疗时间（datetime）
     * 治疗医生（resource，关联医生主数据）
     * 治疗方案（textarea）
     * 治疗过程（textarea）
     * 治疗效果（select：显效/有效/无效）
     * 不良反应（textarea）
     * 注意事项（textarea）
     * 随访建议（textarea）

6. 费用结算
   - 费用明细
     * 挂号费（number，自动获取）
     * 检查费（number，自动计算）
     * 化验费（number，自动计算）
     * 治疗费（number，自动计算）
     * 药品费（number，自动计算）
     * 其他费用（number）
     * 总费用（number，自动计算）
     * 医保支付（number）
     * 自费金额（number，自动计算）
     * 实收金额（number）
     * 支付方式（select：现金/医保卡/银行卡/移动支付）
     * 发票号码（text）

7. 随访记录
   - 随访信息
     * 随访时间（datetime）
     * 随访方式（select：电话/门诊/家访）
     * 随访医生（resource，关联医生主数据）
     * 症状变化（textarea）
     * 用药情况（textarea）
     * 不良反应（textarea）
     * 生活建议（textarea）
     * 下次随访（date）
     * 随访结果（select：稳定/好转/加重）


上述需求是否满足您的需求？如果不满足您可以告诉我您需要什么功能，我随时调整模板内容`

export default healthcareTemplatePrompt

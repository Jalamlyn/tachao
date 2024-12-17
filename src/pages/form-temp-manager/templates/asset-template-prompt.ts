/**
 * 资产管理表单模板提示词
 * 包含资产管理相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const assetTemplatePrompt = `这是一个用于资产管理、设备领用和资产盘点的综合性表单。

具体需求如下：

1. 资产基本信息分组
   - 资产信息
     * 资产编号（text，自动生成）
     * 资产名称（text，必填）
     * 资产类别（select，必填：固定资产/低值易耗品/无形资产）
     * 规格型号（text，必填）
     * 单位（select）
     * 购置日期（date，必填）
     * 购置金额（number，必填）
     * 使用年限（number）
     * 折旧方法（select：年限平均法/工作量法/双倍余额法）
     * 残值率（number）
     * 资产状态（select：在用/闲置/维修/报废）

   - 供应商信息
     * 供应商（resource，关联供应商主数据）
     * 合同编号（text）
     * 保修期限（date）
     * 维保联系人（text）
     * 联系电话（tel）
     * 质保文件（file）

2. 资产领用表格
   - 可添加多行记录，包含字段：
     * 领用人（resource，关联员工主数据，必填）
     * 所属部门（resource，关联部门主数据，必填）
     * 领用日期（date，必填）
     * 预计归还日期（date）
     * 领用数量（number，必填）
     * 领用原因（textarea）
     * 使用地点（text）
     * 领用状态（select：待审批/已领用/已归还）
     * 备注说明（textarea）

3. 资产维护表格
   - 可添加多行记录，包含字段：
     * 维护日期（date，必填）
     * 维护类型（select：日常保养/定期维护/故障维修）
     * 维护人员（resource，关联员工主数据）
     * 维护内容（textarea，必填）
     * 维护费用（number）
     * 维护结果（textarea）
     * 下次维护日期（date）
     * 相关附件（file）
     * 维护签名（signature）

4. 资产盘点表格
   - 可添加多行记录，包含字段：
     * 盘点日期（date，必填）
     * 盘点人（resource，关联员工主数据，必填）
     * 账面数量（number，自动获取）
     * 实盘数量（number，必填）
     * 盘盈盘亏（number，自动计算）
     * 资产状况（select：完好/损坏/待维修/报废）
     * 盘点说明（textarea）
     * 盘点照片（image）
     * 处理建议（textarea）

5. 资产处置流程
   - 处置申请
     * 申请人（resource，关联员工主数据）
     * 申请日期（date）
     * 处置类型（select：报废/转让/捐赠/其他）
     * 处置原因（textarea，必填）
     * 预计处置收益（number）
     * 处置方式（select：拍卖/协议转让/报废处理）
     * 相关附件（file）

   - 评估确认
     * 评估人（resource，关联员工主数据）
     * 评估时间（datetime）
     * 评估价值（number）
     * 评估意见（textarea）
     * 评估报告（file）
     * 评估签名（signature）

   - 审批流程
     * 部门主管（resource，关联员工主数据）
     * 审批时间（datetime）
     * 审批意见（textarea）
     * 审批签名（signature）

     * 资产管理员（resource，关联员工主数据）
     * 确认时间（datetime）
     * 确认意见（textarea）
     * 确认签名（signature）

     * 财务主管（resource，关联员工主数据）
     * 审批时间（datetime）
     * 审批意见（textarea）
     * 审批签名（signature）

6. 统计分析
   - 资产统计
     * 资产总值（number，自动计算）
     * 累计折旧（number，自动计算）
     * 资产净值（number，自动计算）
     * 在用数量（number，自动统计）
     * 闲置数量（number，自动统计）
     * 维修数量（number，自动统计）
     * 报废数量（number，自动统计）

上述需求是否满足您的需求？如果不满足您可以告诉我您需要什么功能，我随时调整模板内容`

export default assetTemplatePrompt

/**
 * 制造业表单模板提示词
 * 包含制造业相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const manufacturingTemplatePrompt = `这是一个用于制造业的生产计划、质量检验和物料管理的综合性表单。

具体需求如下：

1. 生产计划分组
   - 计划信息
     * 计划编号（text，自动生成）
     * 计划名称（text，必填）
     * 产品名称（resource，关联产品主数据，必填）
     * 计划类型（select：正常生产/返工/试产）
     * 计划数量（number，必填）
     * 开始日期（date，必填）
     * 结束日期（date，必填）
     * 生产线（resource，关联生产线主数据）
     * 责任人（resource，关联员工主数据）
     * 计划状态（select：未开始/进行中/已完成/已取消）
     * 备注说明（textarea）

   - 工艺要求
     * 工艺文件（file）
     * 技术要求（textarea）
     * 质量标准（textarea）
     * 注意事项（textarea）
     * 特殊要求（textarea）

2. 物料需求表格
   - 可添加多行记录，包含字段：
     * 物料编码（text，自动生成）
     * 物料名称（resource，关联物料主数据，必填）
     * 规格型号（text，自动关联）
     * 需求数量（number，必填）
     * 单位（select）
     * 库存数量（number，自动获取）
     * 采购数量（number，自动计算）
     * 预计到货（date）
     * 实际到货（date）
     * 物料状态（select：待采购/已采购/已到货/已检验）
     * 备注（textarea）

3. 生产进度表格
   - 可添加多行记录，包含字段：
     * 工序名称（text，必填）
     * 计划产量（number，必填）
     * 实际产量（number）
     * 合格数量（number）
     * 不合格数（number）
     * 开始时间（datetime）
     * 结束时间（datetime）
     * 生产人员（resource，关联员工主数据）
     * 设备编号（resource，关联设备主数据）
     * 工时（number，自动计算）
     * 进度状态（select：未开始/进行中/已完成）

4. 质量检验表格
   - 可添加多行记录，包含字段：
     * 检验编号（text，自动生成）
     * 检验项目（text，必填）
     * 标准值（number）
     * 允许误差（number）
     * 实测值（number）
     * 检验结果（select：合格/不合格）
     * 检验人（resource，关联员工主数据）
     * 检验时间（datetime）
     * 检验设备（resource，关联设备主数据）
     * 不合格原因（textarea）
     * 处理方式（select：返工/报废/让步接收）

5. 设备管理
   - 设备信息
     * 设备编号（text，自动生成）
     * 设备名称（text，必填）
     * 设备类型（select）
     * 规格型号（text）
     * 生产厂家（text）
     * 购置日期（date）
     * 使用年限（number）
     * 维护周期（number）
     * 负责人（resource，关联员工主数据）
     * 设备状态（select：正常/维修/停用）

   - 设备维护
     * 维护日期（date）
     * 维护类型（select：日常保养/定期维护/故障维修）
     * 维护内容（textarea）
     * 维护人员（resource，关联员工主数据）
     * 维护结果（textarea）
     * 下次维护（date）
     * 维护记录（file）

6. 生产统计分析
   - 生产数据
     * 计划完成率（number，自动计算）
     * 合格率（number，自动计算）
     * 设备利用率（number，自动计算）
     * 人员效率（number，自动计算）
     * 物料损耗率（number，自动计算）
     * 生产成本（number，自动计算）
     * 能源消耗（number，自动计算）
     * 生产周期（number，自动计算）

特殊功能支持：
1. 表单分组展示，使用 Tabs 切换
2. 支持表格数据的动态添加和删除
3. 支持文件上传和预览
4. 支持电子签名
5. 支持资源选择（关联主数据）
6. 支持数字字段的自动计算
7. 支持必填字段实时验证
8. 支持表单打印，生成标准化的 PDF 文档
9. 支持流程确认步骤的状态追踪
10. 支持表单数据的暂存和恢复
11. 支持生产计划自动排程
12. 支持物料需求计算
13. 支持质量数据分析
14. 支持设备维护提醒
15. 支持生产报表导出

业务规则：
1. 使用 orderNumberConfig 生成计划编号
2. 使用 validators 进行字段验证
3. 使用 calculate 进行字段计算
4. 使用 processSteps 控制流程确认
5. 使用 watch 实现字段联动
6. 使用 resource 实现主数据关联
7. 使用 signature 实现电子签名
8. 使用 file/image 实现文件上传
9. 支持生产计划自动排程
10. 支持物料需求计算
11. 支持质量数据分析
12. 支持设备维护提醒
13. 支持生产异常预警
14. 支持生产数据追踪
15. 支持统计报表导出

上述需求是否满足您的需求？如果不满足您可以告诉我您需要什么功能，我随时调整模板内容`

export default manufacturingTemplatePrompt

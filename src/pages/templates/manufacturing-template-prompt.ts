/**
 * 制造业表单模板提示词
 * 包含制造业相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const manufacturingTemplatePrompt = `这是一个适用于制造业的综合性表单模板，涵盖生产计划、物料管理、质量检验、设备管理以及生产统计分析模块，支持动态扩展和业务定制。

### 具体需求如下：

---

#### 1. 生产计划
- **计划信息**
  - 计划编号（text，自动生成）
  - 计划名称（text，必填）
  - 产品名称（resource，关联产品主数据，必填）
  - 计划类型（select：正常生产/返工/试产）
  - 计划数量（number，必填）
  - 开始日期（date，必填）
  - 结束日期（date，必填）
  - 生产线（resource，关联生产线主数据）
  - 责任人（resource，关联员工主数据）
  - 计划状态（select：未开始/进行中/已完成/已取消）
  - 备注说明（textarea）

- **工艺要求**
  - 工艺文件（file，支持多种格式）
  - 技术要求（textarea）
  - 质量标准（textarea）
  - 注意事项（textarea）
  - 特殊要求（textarea）

---

#### 2. 物料管理
- **物料需求表格**
  - 可添加多行记录，包含字段：
    - 物料编码（text，自动生成）
    - 物料名称（resource，关联物料主数据，必填）
    - 规格型号（text，自动关联）
    - 需求数量（number，必填）
    - 单位（select）
    - 库存数量（number，自动获取）
    - 采购数量（number，自动计算：需求数量 - 库存数量）
    - 预计到货日期（date）
    - 实际到货日期（date）
    - 物料状态（select：待采购/已采购/已到货/已检验）
    - 备注（textarea）

---

#### 3. 生产进度
- **生产进度表格**
  - 可添加多行记录，包含字段：
    - 工序名称（text，必填）
    - 计划产量（number，必填）
    - 实际产量（number）
    - 合格数量（number）
    - 不合格数量（number）
    - 开始时间（datetime）
    - 结束时间（datetime）
    - 生产人员（resource，关联员工主数据）
    - 设备编号（resource，关联设备主数据）
    - 工时（number，自动计算：结束时间 - 开始时间）
    - 进度状态（select：未开始/进行中/已完成）

---

#### 4. 质量检验
- **质量检验表格**
  - 可添加多行记录，包含字段：
    - 检验编号（text，自动生成）
    - 检验项目（text，必填）
    - 标准值（number）
    - 允许误差（number）
    - 实测值（number）
    - 检验结果（select：合格/不合格）
    - 检验人（resource，关联员工主数据）
    - 检验时间（datetime）
    - 检验设备（resource，关联设备主数据）
    - 不合格原因（textarea）
    - 处理方式（select：返工/报废/让步接收）

---

#### 5. 设备管理
- **设备信息**
  - 设备编号（text，自动生成）
  - 设备名称（text，必填）
  - 设备类型（select）
  - 规格型号（text）
  - 生产厂家（text）
  - 购置日期（date）
  - 使用年限（number）
  - 维护周期（number，单位：月）
  - 负责人（resource，关联员工主数据）
  - 设备状态（select：正常/维修/停用）

- **设备维护**
  - 维护日期（date）
  - 维护类型（select：日常保养/定期维护/故障维修）
  - 维护内容（textarea）
  - 维护人员（resource，关联员工主数据）
  - 维护结果（textarea）
  - 下次维护日期（date）
  - 维护记录（file，支持多种格式）

---

#### 6. 生产统计
- **统计数据**
  - 自动计算以下指标：
    - 计划完成率（number，%）
    - 合格率（number，%）
    - 设备利用率（number，%）
    - 人员效率（number，%）
    - 物料损耗率（number，%）
    - 生产成本（number，单位：元）
    - 能源消耗（number，单位：kWh）
    - 生产周期（number，单位：天）

---

### 使用说明
- 此模板支持灵活调整字段、表格结构和计算逻辑，适配不同的制造业场景。
- 如需新增功能或优化现有模块，请提供需求说明，我将及时调整模板内容。`

export default manufacturingTemplatePrompt

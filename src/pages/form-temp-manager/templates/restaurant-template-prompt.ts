/**
 * 餐饮服务表单模板提示词
 * 包含餐饮服务相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const restaurantTemplatePrompt = `这是一个用于餐饮服务行业的预订登记、配送信息等的综合性表单。

具体需求如下：

1. 预订信息分组
   - 客户信息
     * 预订编号（text，自动生成）
     * 客户姓名（text，必填）
     * 联系电话（tel，必填）
     * 预订人数（number，必填）
     * 预订日期（date，必填）
     * 预订时间（time，必填）
     * 就餐时长（number，单位：小时）
     * 包间要求（select：大厅/包间）
     * 特殊要求（textarea）
     * 预订状态（select：待确认/已确认/已取消/已完成）

   - 餐位安排
     * 餐厅区域（select：一楼大厅/二楼包间/露台）
     * 包间号（select，条件显示）
     * 桌号（text）
     * 最低消费（number）
     * 订金金额（number）
     * 支付状态（select：未支付/已支付/已退款）
     * 支付方式（select：现金/微信/支付宝/银行卡）
     * 收银员（resource，关联员工主数据）

2. 点餐信息表格
   - 可添加多行记录，包含字段：
     * 菜品名称（resource，关联菜品主数据，必填）
     * 规格（select）
     * 单价（number，自动获取）
     * 数量（number，必填）
     * 小计（number，自动计算）
     * 特殊要求（text）
     * 优先级（select：普通/加急）
     * 状态（select：待制作/制作中/已完成/已上菜）
     * 备注（textarea）

3. 外卖配送
   - 订单信息
     * 订单编号（text，自动生成）
     * 下单时间（datetime，必填）
     * 客户姓名（text，必填）
     * 联系电话（tel，必填）
     * 配送地址（textarea，必填）
     * 预计送达（datetime）
     * 配送方式（select：商家配送/第三方配送）
     * 配送费用（number）
     * 订单备注（textarea）

   - 配送跟踪
     * 配送员（resource，关联配送员主数据）
     * 接单时间（datetime）
     * 出餐时间（datetime）
     * 取餐时间（datetime）
     * 送达时间（datetime）
     * 配送状态（select：待接单/已接单/配送中/已送达）
     * 签收照片（image）
     * 配送评价（rate，1-5星）

4. 会员管理
   - 会员信息
     * 会员编号（text，自动生成）
     * 会员姓名（text，必填）
     * 手机号码（tel，必填）
     * 会员等级（select：普通/银卡/金卡/钻石）
     * 注册日期（date，自动生成）
     * 生日（date）
     * 喜好口味（select，多选）
     * 过敏原（select，多选）
     * 消费记录（number，自动统计）
     * 积分余额（number，自动计算）

   - 会员优惠
     * 优惠类型（select：折扣/满减/赠品）
     * 优惠力度（number）
     * 使用条件（textarea）
     * 有效期（date）
     * 使用状态（select：未使用/已使用/已过期）
     * 备注说明（textarea）

5. 库存管理表格
   - 可添加多行记录，包含字段：
     * 食材编号（text，自动生成）
     * 食材名称（text，必填）
     * 规格单位（select）
     * 库存数量（number，必填）
     * 安全库存（number）
     * 采购价格（number）
     * 供应商（resource，关联供应商主数据）
     * 保质期（date）
     * 存放位置（select：常温/冷藏/冷冻）
     * 库存状态（select：充足/不足/已空）

6. 营业统计
   - 营业数据
     * 统计日期（date）
     * 营业额（number，自动计算）
     * 就餐人数（number，自动统计）
     * 订单数量（number，自动统计）
     * 平均客单价（number，自动计算）
     * 外卖订单（number，自动统计）
     * 会员消费（number，自动统计）
     * 现金收入（number，自动统计）
     * 电子支付（number，自动统计）
     * 营业支出（number，自动统计）

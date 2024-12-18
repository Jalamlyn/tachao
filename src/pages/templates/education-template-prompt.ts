/**
 * 教育培训表单模板提示词
 * 包含教育培训相关表单的标准化需求描述
 * 基于 DynamicForm 组件的实际功能进行优化
 */
export const educationTemplatePrompt = `这是一个用于教育机构招生、考试和培训管理的综合性表单。

具体需求如下：

### 学员信息分组
1. 基本信息
   - 学员姓名（text，必填）
   - 性别（radio：男/女）
   - 出生日期（date）
   - 身份证号（text，必填，支持验证）
   - 联系电话（tel，必填）
   - 电子邮箱（email）
   - 现居地址（textarea）
   - 紧急联系人（text）
   - 紧急联系电话（tel）

2. 教育背景
   - 最高学历（select：高中/专科/本科/硕士/博士）
   - 毕业院校（text）
   - 专业方向（text）
   - 毕业时间（date）
   - 学历证书（file）
   - 其他证书（file，支持多文件）

### 报名管理
1. 课程报名表格
   - 可添加多行记录，包含字段：
     * 课程名称（resource，关联课程主数据，必填）
     * 课程类型（select：线上/线下/混合）
     * 开课时间（datetime，必填）
     * 结课时间（datetime，必填）
     * 授课教师（resource，关联教师主数据）
     * 课程费用（number，自动获取）
     * 优惠方式（select：无优惠/早鸟优惠/团报优惠/其他）
     * 优惠金额（number）
     * 实付金额（number，自动计算）
     * 报名状态（select：待付款/已付款/已确认/已取消）

### 成绩管理
1. 考试成绩表格
   - 可添加多行记录，包含字段：
     * 考试科目（resource，关联课程主数据，必填）
     * 考试时间（datetime，必填）
     * 考试形式（select：笔试/机试/口试/实操）
     * 考试地点（text）
     * 监考教师（resource，关联教师主数据）
     * 考试成绩（number，0-100）
     * 及格线（number，默认60）
     * 是否通过（switch，自动判断）
     * 补考次数（number）
     * 考试备注（textarea）

### 学习跟踪
1. 学习进度跟踪表格
   - 可添加多行记录，包含字段：
     * 课程名称（resource，关联课程主数据）
     * 总课时（number）
     * 已完成课时（number）
     * 进度比例（slider，0-100，自动计算）
     * 学习状态（select：未开始/进行中/已完成/已暂停）
     * 最近学习（datetime）
     * 学习时长（number，单位：小时）
     * 学习记录（textarea）

2. 作业完成记录
   - 可添加多行记录，包含字段：
     * 作业名称（text）
     * 发布时间（datetime）
     * 截止时间（datetime）
     * 完成状态（select：未开始/进行中/已提交/已批改）
     * 作业成绩（number，0-100）
     * 教师评语（textarea）
     * 作业附件（file）

### 证书管理
1. 证书信息
   - 证书名称（text，必填）
   - 证书编号（text，自动生成）
   - 发证日期（date）
   - 有效期限（date）
   - 发证机构（text）
   - 证书等级（select）
   - 证书图片（image）
   - 证书状态（select：有效/即将过期/已过期）

### 满意度评价
1. 课程评价
   - 评价时间（datetime）
   - 课程内容（rate，1-5星）
   - 教师水平（rate，1-5星）
   - 教学设施（rate，1-5星）
   - 服务态度（rate，1-5星）
   - 总体评价（rate，1-5星）
   - 评价内容（textarea）
   - 建议反馈（textarea）

上述表单结构是否满足您的需求？如果不满足，请告诉我需要哪些功能或字段调整，我可以随时优化模板内容。`

export default educationTemplatePrompt

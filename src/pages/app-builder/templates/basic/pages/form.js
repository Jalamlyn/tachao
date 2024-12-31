const { 
  wpm, 
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const { motion } = FramerMotion;
const { Card, CardBody, Input, Button, Select, SelectItem } = NextUI;
const { useState } = React;
const { useNavigate } = ReactRouterDom;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const FormPage = observer(() => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'personal'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "客户名称不能为空";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "联系电话不能为空";
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "请输入有效的手机号码";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await DataStore.addCustomer(formData);
      message.success("客户添加成功！");
      navigate("/customers");
    } catch (error) {
      message.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardBody className="gap-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:account-plus" className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">新增客户</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="客户名称"
                placeholder="请输入客户名称"
                value={formData.name}
                onValueChange={handleChange('name')}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                isRequired
                startContent={
                  <Icon icon="mdi:account" className="w-4 h-4 text-default-400" />
                }
              />

              <Input
                label="联系电话"
                placeholder="请输入手机号码"
                value={formData.phone}
                onValueChange={handleChange('phone')}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                isRequired
                startContent={
                  <Icon icon="mdi:phone" className="w-4 h-4 text-default-400" />
                }
              />

              <Input
                label="电子邮箱"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onValueChange={handleChange('email')}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                startContent={
                  <Icon icon="mdi:email" className="w-4 h-4 text-default-400" />
                }
              />

              <Select
                label="客户类型"
                placeholder="请选择客户类型"
                selectedKeys={[formData.type]}
                onChange={(e) => handleChange('type')(e.target.value)}
                startContent={
                  <Icon icon="mdi:account-group" className="w-4 h-4 text-default-400" />
                }
              >
                <SelectItem key="personal" value="personal">个人客户</SelectItem>
                <SelectItem key="company" value="company">企业客户</SelectItem>
              </Select>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="flat"
                  onClick={() => navigate("/customers")}
                  startContent={<Icon icon="mdi:arrow-left" className="w-4 h-4" />}
                >
                  返回
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={loading}
                  startContent={!loading && <Icon icon="mdi:check" className="w-4 h-4" />}
                >
                  提交
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_form', FormPage);
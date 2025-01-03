、```jsx
<mo-ai-code type="component" name="comp_expense_form">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message,
  cn,
} = context;

const { useState } = React;
const { Input, Button, Select, SelectItem } = NextUI;
const expenseStore = await wpm.import('store_expense');

const ExpenseForm = observer(() => {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    setSaving(true);
    try {
      await expenseStore.saveExpense(data);
      e.target.reset();
      message.success('记账成功');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        isRequired
        type="number"
        name="amount"
        label="金额"
        placeholder="请输入金额"
        value={expenseStore.currentExpense?.amount || ''}
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400">¥</span>
          </div>
        }
      />

      <Select
        isRequired
        name="category"
        label="类别"
        placeholder="请选择类别"
        defaultSelectedKeys={expenseStore.currentExpense?.category ? [expenseStore.currentExpense.category] : []}
      >
        <SelectItem key="food" startContent={<Icon icon="solar:bowl-chopsticks-bold" />}>
          餐饮
        </SelectItem>
        <SelectItem key="shopping" startContent={<Icon icon="solar:shop-bold" />}>
          购物
        </SelectItem>
        <SelectItem key="transport" startContent={<Icon icon="solar:bus-bold" />}>
          交通
        </SelectItem>
        <SelectItem key="entertainment" startContent={<Icon icon="solar:gamepad-bold" />}>
          娱乐
        </SelectItem>
        <SelectItem key="other" startContent={<Icon icon="solar:widget-bold" />}>
          其他
        </SelectItem>
      </Select>

      <Input
        isRequired
        type="date"
        name="date"
        label="日期"
        placeholder="请选择日期"
        value={expenseStore.currentExpense?.date || new Date().toISOString().split('T')[0]}
      />

      <Input
        name="description"
        label="描述"
        placeholder="请输入描述"
        value={expenseStore.currentExpense?.description || ''}
      />

      <Select
        isRequired
        name="paymentMethod"
        label="支付方式"
        placeholder="请选择支付方式"
        defaultSelectedKeys={expenseStore.currentExpense?.paymentMethod ? [expenseStore.currentExpense.paymentMethod] : []}
      >
        <SelectItem key="cash" startContent={<Icon icon="solar:wallet-money-bold" />}>
          现金
        </SelectItem>
        <SelectItem key="alipay" startContent={<Icon icon="solar:smartphone-bold" />}>
          支付宝
        </SelectItem>
        <SelectItem key="wechat" startContent={<Icon icon="solar:chat-round-bold" />}>
          微信
        </SelectItem>
        <SelectItem key="card" startContent={<Icon icon="solar:card-bold" />}>
          银行卡
        </SelectItem>
      </Select>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        isLoading={saving}
      >
        保存记录
      </Button>

      {expenseStore.expenseHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">最近记录</h3>
          <div className="space-y-2">
            {expenseStore.expenseHistory.map((expense, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    icon={
                      expense.category === 'food' ? 'solar:bowl-chopsticks-bold' :
                      expense.category === 'shopping' ? 'solar:shop-bold' :
                      expense.category === 'transport' ? 'solar:bus-bold' :
                      expense.category === 'entertainment' ? 'solar:gamepad-bold' :
                      'solar:widget-bold'
                    }
                    className="text-2xl"
                  />
                  <div>
                    <p className="font-medium">{expense.description || expense.category}</p>
                    <p className="text-small text-default-500">
                      {expense.date} · {expense.paymentMethod}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">¥{expense.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
});

wpm.export('comp_expense_form', ExpenseForm);
</mo-ai-code>
```
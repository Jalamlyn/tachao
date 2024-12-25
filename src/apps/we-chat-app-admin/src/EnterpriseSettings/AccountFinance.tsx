// ... 前面的代码保持不变 ...

const AccountFinance = observer(() => {
  // ... 前面的代码保持不变 ...

  // 添加余额显示组件
  const BalanceDisplay = ({ value, label, tooltip = null }) => {
    const isNegative = parseFloat(value) < 0
    return (
      <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
        <span className='text-default-600'>{label}</span>
        {tooltip ? (
          <Tooltip content={tooltip}>
            <div className='flex items-center gap-2'>
              {isNegative && (
                <Chip color="danger" size="sm" variant="flat">
                  欠费
                </Chip>
              )}
              <span className={`font-medium cursor-help ${isNegative ? 'text-danger' : ''}`}>
                {value}
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className='flex items-center gap-2'>
            {isNegative && (
              <Chip color="danger" size="sm" variant="flat">
                欠费
              </Chip>
            )}
            <span className={`font-medium ${isNegative ? 'text-danger' : ''}`}>
              {value}
            </span>
          </div>
        )}
      </div>
    )
  }

  // ... 其他代码保持不变 ...

  return (
    <div className='grid gap-6 p-4'>
      {/* ... 其他代码保持不变 ... */}
      
      <Card className='w-full'>
        <CardBody>
          <div className='flex items-center gap-2 mb-4'>
            <Icon icon='solar:wallet-money-bold-duotone' className='w-6 h-6 text-primary' />
            <h3 className='text-lg font-medium'>账户信息</h3>
          </div>
          <div className='flex flex-col gap-4'>
            <div>
              <InfoItem
                label='塔币总额'
                value={account?.totalComputePower ? `${(account.totalComputePower / 100).toFixed(2)} 塔币` : "0 塔币"}
                tooltip='账户充值的总塔币数量'
              />
              <InfoItem
                label='已消费'
                value={`${totalCost.toFixed(2)} 塔币`}
                tooltip='所有已使用的塔币总和'
              />
              <BalanceDisplay
                label='实际可用余额'
                value={`${actualBalance.toFixed(2)} 塔币`}
                tooltip='总额减去已消费后的实际可用余额'
              />
              {actualBalance < 0 && (
                <div className='mt-2 p-2 bg-danger-50 rounded-lg'>
                  <p className='text-sm text-danger flex items-center gap-1'>
                    <Icon icon='solar:danger-triangle-bold-duotone' className='w-4 h-4' />
                    <span>
                      当前账户已欠费 {Math.abs(actualBalance).toFixed(2)} 塔币，
                      请及时充值以确保服务正常使用
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                color='primary'
                variant='flat'
                startContent={<Icon icon='solar:card-recive-bold-duotone' />}
                onClick={() => balanceStore.showRechargeModal(false)}
              >
                {actualBalance < 0 ? '立即充值补缴' : '充值购买套餐'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ... 其他代码保持不变 ... */}
    </div>
  )
})

export default AccountFinance
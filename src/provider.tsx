// ... 前面的代码保持不变 ...

// 计算实际可用余额
const calculateActualBalance = async () => {
  try {
    // 获取账户信息
    const accountRes = await getAccount()
    if (!accountRes?.totalComputePower) {
      return 0
    }

    // 先将总额转换为塔币单位
    const totalBalance = accountRes.totalComputePower / 100

    // 获取费用记录
    const costRecords = await getMetadata(["ai-cost-records"])
    const records = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

    // 计算总费用(费用记录中已经是塔币单位)
    const totalCost = records.reduce((sum, record) => {
      // 确保 totalCost 存在且为数字
      const cost = typeof record.totalCost === 'number' ? record.totalCost : 0
      return sum + cost
    }, 0)

    // 计算实际余额 - 移除 Math.max 限制
    const actualBalance = totalBalance - totalCost

    // 记录余额变动日志
    try {
      const balanceLogs = await getMetadata(["balance-logs"])
      const existingLogs = balanceLogs?.data[0]?.value ? JSON.parse(balanceLogs.data[0].value) : []
      
      const newLog = {
        timestamp: new Date().toISOString(),
        totalBalance,
        totalCost,
        actualBalance, // 移除 Math.max 限制
      }

      if (existingLogs.length > 0) {
        const lastLog = existingLogs[existingLogs.length - 1]
        if (lastLog.actualBalance !== newLog.actualBalance) {
          existingLogs.push(newLog)
          await setMetadata("balance-logs", existingLogs)
        }
      } else {
        await setMetadata("balance-logs", [newLog])
      }
    } catch (error) {
      console.error("Error storing balance logs:", error)
    }

    return actualBalance // 直接返回实际余额，包括负数
  } catch (error) {
    console.error("Error calculating actual balance:", error)
    return 0
  }
}

// ... 后面的代码保持不变 ...
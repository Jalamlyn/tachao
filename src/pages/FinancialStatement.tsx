import React from 'react';
import { Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const FinancialStatement: React.FC = () => {
  const summaryData = {
    initialBalance: 1200.00,
    totalIncome: 2995.00,
    totalExpense: 2704.00,
    finalBalance: 1491.00
  };

  const accountData = [
    { name: '现金', income: 791.00, expense: 339.00 },
    { name: '微信', income: 509.00, expense: 700.00 },
    { name: '支付宝', income: 1141.00, expense: 639.00 },
    { name: '银行卡-9810', income: 554.00, expense: 1026.00 }
  ];

  const detailData = [
    { key: '1', date: '2022/2/1', reference: 'XXXXsm1', code: 'XM3', account: '微信', expense: 283.00, balance: 917.00 },
    { key: '2', date: '2022/3/1', reference: 'XXXXsm1', code: 'XM4', account: '现金', income: 791.00, balance: 1708.00 },
    // ... more data
  ];

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '凭证号码', dataIndex: 'reference', key: 'reference' },
    { title: '收支项目', dataIndex: 'code', key: 'code' },
    { title: '收支账户', dataIndex: 'account', key: 'account' },
    { title: '收入金额', dataIndex: 'income', key: 'income' },
    { title: '支出金额', dataIndex: 'expense', key: 'expense' },
    { title: '结余', dataIndex: 'balance', key: 'balance' },
  ];

  return (
    <div className="p-5 bg-gray-100">
      <div className="bg-purple-500 text-white p-3 text-center text-lg mb-5">
        收支明细流水账
      </div>
      
      <div className="grid grid-cols-4 gap-5 mb-5">
        <Card className="bg-purple-500 text-white">
          <h3 className="text-white">期初金额</h3>
          <p className="text-white">¥{summaryData.initialBalance.toFixed(2)}</p>
        </Card>
        <Card className="bg-purple-500 text-white">
          <h3 className="text-white">总收入</h3>
          <p className="text-white">¥{summaryData.totalIncome.toFixed(2)}</p>
        </Card>
        <Card className="bg-purple-500 text-white">
          <h3 className="text-white">总支出</h3>
          <p className="text-white">¥{summaryData.totalExpense.toFixed(2)}</p>
        </Card>
        <Card className="bg-purple-500 text-white">
          <h3 className="text-white">总结余</h3>
          <p className="text-white">¥{summaryData.finalBalance.toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card title="账户收支汇总表">
          <Table
            dataSource={accountData}
            columns={[
              { title: '账户', dataIndex: 'name' },
              { title: '收入金额', dataIndex: 'income' },
              { title: '支出金额', dataIndex: 'expense' }
            ]}
            pagination={false}
          />
        </Card>
        
        <div className="bg-white p-5 rounded-md">
          <BarChart width={500} height={300} data={accountData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" name="收入金额" fill="#8884d8" />
            <Bar dataKey="expense" name="支出金额" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>

      <Card title="收支明细">
        <Table
          dataSource={detailData}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default FinancialStatement;
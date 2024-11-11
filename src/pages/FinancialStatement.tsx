import React from 'react';
import { Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: #f0f2f5;
`;

const Header = styled.div`
  background: #8a7dea;
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryCard = styled(Card)`
  background: ${props => props.color || '#fff'};
  color: ${props => props.textColor || '#000'};
`;

const StatisticsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 4px;
`;

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
    <Container>
      <Header>收支明细流水账</Header>
      
      <SummaryGrid>
        <SummaryCard color="#8a7dea" textColor="white">
          <h3>期初金额</h3>
          <p>¥{summaryData.initialBalance.toFixed(2)}</p>
        </SummaryCard>
        <SummaryCard color="#8a7dea" textColor="white">
          <h3>总收入</h3>
          <p>¥{summaryData.totalIncome.toFixed(2)}</p>
        </SummaryCard>
        <SummaryCard color="#8a7dea" textColor="white">
          <h3>总支出</h3>
          <p>¥{summaryData.totalExpense.toFixed(2)}</p>
        </SummaryCard>
        <SummaryCard color="#8a7dea" textColor="white">
          <h3>总结余</h3>
          <p>¥{summaryData.finalBalance.toFixed(2)}</p>
        </SummaryCard>
      </SummaryGrid>

      <StatisticsSection>
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
        
        <ChartContainer>
          <BarChart width={500} height={300} data={accountData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" name="收入金额" fill="#8884d8" />
            <Bar dataKey="expense" name="支出金额" fill="#82ca9d" />
          </BarChart>
        </ChartContainer>
      </StatisticsSection>

      <Card title="收支明细">
        <Table
          dataSource={detailData}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Container>
  );
};

export default FinancialStatement;
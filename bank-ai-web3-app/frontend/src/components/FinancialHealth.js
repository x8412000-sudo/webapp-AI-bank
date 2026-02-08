import React, { useState } from 'react';
import '../App.css';

const FinancialHealth = () => {
  const [data, setData] = useState({
    income: 5000,
    expenses: {
      rent: 1200,
      food: 600,
      transport: 300,
      utilities: 200,
      entertainment: 400,
      other: 300
    },
    savings: 15000,
    debt: 5000,
    investments: 7500,
    emergencyFund: 5000
  });

  // 计算总支出
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.income - totalExpenses;
  
  // 计算评分
  const calculateScore = () => {
    const savingsRate = (monthlySavings / data.income) * 100;
    const debtRatio = (data.debt / data.income) * 12;
    const emergencyMonths = data.emergencyFund / totalExpenses;
    const investmentRatio = data.investments / data.savings;

    // 各项评分
    const scores = {
      savings: Math.min(Math.max(savingsRate * 2, 0), 100),
      debt: Math.max(100 - (debtRatio * 10), 0),
      emergency: Math.min(emergencyMonths * 20, 100),
      investment: Math.min(investmentRatio * 100, 100)
    };

    // 总分
    const total = Math.round(
      scores.savings * 0.3 +
      scores.debt * 0.25 +
      scores.emergency * 0.2 +
      scores.investment * 0.25
    );

    return { total, scores, metrics: { savingsRate, debtRatio, emergencyMonths, investmentRatio } };
  };

  const { total, scores, metrics } = calculateScore();

  // 更新数据
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const updateExpense = (category, value) => {
    setData(prev => ({
      ...prev,
      expenses: { ...prev.expenses, [category]: parseFloat(value) || 0 }
    }));
  };

  // 获取建议
  const getAdvice = () => {
    const advice = [];
    
    if (scores.savings < 60) {
      advice.push(`Savings rate ${metrics.savingsRate.toFixed(1)}% is low, it is recommended to reach more than 20%`);
    }
    
    if (scores.debt < 70) {
      advice.push(`Debt ratio is high, it is recommended to make a repayment plan`);
    }
    
    if (scores.emergency < 80) {
      advice.push(`Emergency fund can last for ${metrics.emergencyMonths.toFixed(1)} months, it is recommended to reach 3-6 months`);
    }
    
    if (scores.investment < 50) {
      advice.push(`Investment ratio ${(metrics.investmentRatio * 100).toFixed(1)}% can be appropriately increased`);
    }
    
    if (advice.length === 0) {
      advice.push('Financial status is good, keep it up!');
    }
    
    return advice;
  };

  const adviceList = getAdvice();
  const getScoreColor = (score) => {
    return score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement';
  };

  return (
    <div className="financial-health-container">
      <h1 className="financial-header">Financial Health Score</h1>
      
      <div className="financial-layout">
        {/* 左侧：输入 */}
        <div className="financial-section">
          <h3 className="financial-subtitle">Income & Expenses</h3>
          
          <div className="financial-input-group">
            <label className="financial-label">Monthly Income ($)</label>
            <input
              type="number"
              value={data.income}
              onChange={(e) => updateData('income', e.target.value)}
              className="financial-input"
            />
          </div>

          <h4 className="financial-subtitle-sm">Monthly Expenses ($)</h4>
          {Object.entries(data.expenses).map(([key, value]) => (
            <div key={key} className="financial-input-group">
              <label className="financial-label">{{
                rent: 'Rent',
                food: 'Food & Dining',
                transport: 'Transportation',
                utilities: 'Utilities',
                entertainment: 'Entertainment',
                other: 'Other'
              }[key]}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => updateExpense(key, e.target.value)}
                className="financial-input"
              />
            </div>
          ))}

          <h4 className="financial-subtitle-sm">Assets & Liabilities</h4>
          {['savings', 'debt', 'investments', 'emergencyFund'].map(field => (
            <div key={field} className="financial-input-group">
              <label className="financial-label">{{
                savings: 'Total Savings',
                debt: 'Total Debt',
                investments: 'Investment Amount',
                emergencyFund: 'Emergency Fund'
              }[field]} ($)</label>
              <input
                type="number"
                value={data[field]}
                onChange={(e) => updateData(field, e.target.value)}
                className="financial-input"
              />
            </div>
          ))}
        </div>

        {/* 右侧：结果 */}
        <div className="financial-section">
          <div className="financial-score-card">
            <div className="financial-score-circle">
              <div className={`financial-score-number ${getScoreColor(total)}`}>
                {total}
              </div>
            </div>
            <p className="financial-score-text">
              {total >= 80 ? 'Excellent' : total >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>

          <div className="financial-metrics">
            {[
              { label: 'Savings Rate', value: metrics.savingsRate.toFixed(1) + '%', score: Math.round(scores.savings) },
              { label: 'Debt Ratio', value: metrics.debtRatio.toFixed(1), score: Math.round(scores.debt) },
              { label: 'Emergency Fund', value: metrics.emergencyMonths.toFixed(1) + 'm', score: Math.round(scores.emergency) },
              { label: 'Investment Ratio', value: (metrics.investmentRatio * 100).toFixed(1) + '%', score: Math.round(scores.investment) }
            ].map((metric, idx) => (
              <div key={idx} className="financial-metric">
                <div className="financial-metric-label">{metric.label}</div>
                <div className="financial-metric-value">{metric.value}</div>
                <div className="financial-metric-score">Score: {metric.score}</div>
              </div>
            ))}
          </div>

          <div className="financial-advice-section">
            <h3 className="financial-subtitle">Advice</h3>
            <ul className="financial-advice-list">
              {adviceList.map((item, idx) => (
                <li key={idx} className="financial-advice-item">{item}</li>
              ))}
            </ul>
          </div>

          <div className="financial-summary">
            <p>Monthly Savings: <strong>${monthlySavings.toFixed(2)}</strong></p>
            <p>Monthly Expenses: <strong>${totalExpenses.toFixed(2)}</strong></p>
            <p>Savings Rate: <strong>{metrics.savingsRate.toFixed(1)}%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealth;
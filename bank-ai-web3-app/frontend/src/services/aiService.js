import { aiAPI } from './api';

class AIService {
  constructor() {
    this.sessionId = localStorage.getItem('ai_session_id');
  }

  async chat(message) {
    try {
      const response = await aiAPI.chat(message);
      if (response.data.session_id) {
        localStorage.setItem('ai_session_id', response.data.session_id);
        this.sessionId = response.data.session_id;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getInvestmentAdvice(params = {}) {
    try {
      const response = await aiAPI.getInvestmentAdvice(params);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async analyzeSpending() {
    try {
      const response = await aiAPI.analyzeSpending();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async categorizeTransactions(transactions) {
    try {
      const response = await aiAPI.categorizeTransactions(transactions);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async detectFraud(transactionData) {
    try {
      const response = await aiAPI.detectFraud(transactionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getChatSessions() {
    try {
      const response = await aiAPI.getChatSessions();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getChatMessages(sessionId) {
    try {
      const response = await aiAPI.getChatMessages(sessionId);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  submitFeedback(interactionId, rating, comment = '') {
    return aiAPI.submitFeedback(interactionId, rating, comment);
  }

  // Local AI helper functions
  generateQuickResponse(type) {
    const responses = {
      balance: "I can check your account balance. Which account would you like to check?",
      transfer: "To make a transfer, please go to the Transfer section or tell me the details.",
      advice: "I can provide personalized investment advice based on your profile.",
      fraud: "I'll analyze your recent transactions for any suspicious activity.",
      help: "I can help you with: account balance, transfers, investment advice, fraud detection, and general banking questions."
    };
    return responses[type] || "How can I assist you with your banking needs today?";
  }

  formatFinancialNumber(number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  }

  analyzeTransactionPattern(transactions) {
    if (!transactions || transactions.length === 0) {
      return { insights: "No transaction data available." };
    }

    const categories = {};
    let totalSpent = 0;
    let totalReceived = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      const category = tx.category || 'uncategorized';
      
      if (amount < 0) {
        totalSpent += Math.abs(amount);
        categories[category] = (categories[category] || 0) + Math.abs(amount);
      } else {
        totalReceived += amount;
      }
    });

    // Find top spending categories
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalSpent: this.formatFinancialNumber(totalSpent),
      totalReceived: this.formatFinancialNumber(totalReceived),
      topCategories,
      averageMonthlySpend: this.formatFinancialNumber(totalSpent / 3), // Assuming 3 months
      insights: this.generateSpendingInsights(topCategories, totalSpent)
    };
  }

  generateSpendingInsights(topCategories, totalSpent) {
    const insights = [];
    
    if (topCategories.length > 0) {
      insights.push(`Your top spending category is ${topCategories[0][0]} (${this.formatFinancialNumber(topCategories[0][1])}).`);
      
      if (topCategories[0][1] / totalSpent > 0.4) {
        insights.push("Consider reviewing this category as it represents a significant portion of your spending.");
      }
    }

    if (topCategories.length >= 2) {
      insights.push(`You also spend ${this.formatFinancialNumber(topCategories[1][1])} on ${topCategories[1][0]}.`);
    }

    return insights.join(' ');
  }
}

export default new AIService();
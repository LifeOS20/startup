import { FinancialData } from '../stores/lifeOSStore';
import Config from 'react-native-config';

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  current_balance: number;
  available_balance: number;
  iso_currency_code: string;
  unofficial_currency_code?: string;
  institution_id: string;
}

export interface PlaidTransaction {
  id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  unofficial_currency_code?: string;
  category: string[];
  category_id: string;
  check_number?: string;
  date: string;
  datetime?: string;
  authorized_date?: string;
  authorized_datetime?: string;
  location: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    lat?: number;
    lon?: number;
    store_number?: string;
  };
  name: string;
  merchant_name?: string;
  merchant_entity_id?: string;
  logo_url?: string;
  website?: string;
  payment_channel: string;
  pending: boolean;
  pending_transaction_id?: string;
  account_owner?: string;
  transaction_id: string;
  transaction_code?: string;
  payment_processor?: string;
  reference_number?: string;
}

export interface PlaidInstitution {
  id: string;
  name: string;
  logo?: string;
  primary_color?: string;
  url?: string;
  oauth?: boolean;
  products: string[];
  country_codes: string[];
  routing_numbers?: string[];
}

export interface PlaidLinkToken {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidAccessToken {
  access_token: string;
  item_id: string;
  request_id: string;
}

export class PlaidService {
  private clientId: string = 'YOUR_PLAID_CLIENT_ID'; // Replace with your Plaid client ID
  private secret: string = 'YOUR_PLAID_SECRET'; // Replace with your Plaid secret
  private environment: 'sandbox' | 'development' | 'production' = 'sandbox';
  private accessTokens: string[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // In production, these would be stored securely
    this.clientId = Config.PLAID_CLIENT_ID || this.clientId;
    this.secret = Config.PLAID_SECRET || this.secret;
    this.environment = (Config.PLAID_ENV as any) || this.environment;

    this.isInitialized = true;
  }

  private getBaseUrl(): string {
    switch (this.environment) {
      case 'sandbox':
        return 'https://sandbox.plaid.com';
      case 'development':
        return 'https://development.plaid.com';
      case 'production':
        return 'https://production.plaid.com';
      default:
        return 'https://sandbox.plaid.com';
    }
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    if (!this.isInitialized) {
      this.initialize();
    }

    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': this.clientId,
      'PLAID-SECRET': this.secret,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Plaid API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Plaid API request failed:', error);
      throw error;
    }
  }

  async createLinkToken(userId: string): Promise<PlaidLinkToken> {
    const body = {
      user: { client_user_id: userId },
      client_name: 'LifeOS',
      products: ['auth', 'transactions', 'liabilities', 'investments'],
      country_codes: ['US'],
      language: 'en',
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
        credit: {
          account_subtypes: ['credit card'],
        },
        loan: {
          account_subtypes: ['auto', 'student', 'mortgage'],
        },
        investment: {
          account_subtypes: ['all'],
        },
      },
    };

    return this.makeRequest('/link/token/create', body);
  }

  async exchangePublicToken(publicToken: string): Promise<PlaidAccessToken> {
    const body = {
      public_token: publicToken,
    };

    return this.makeRequest('/item/public_token/exchange', body);
  }

  async getAccounts(accessToken: string): Promise<{ accounts: PlaidAccount[] }> {
    const body = {
      access_token: accessToken,
    };

    return this.makeRequest('/accounts/get', body);
  }

  async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    options?: {
      account_ids?: string[];
      count?: number;
      offset?: number;
    }
  ): Promise<{
    accounts: PlaidAccount[];
    transactions: PlaidTransaction[];
    total_transactions: number;
    request_id: string;
  }> {
    const body = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        account_ids: options?.account_ids,
        count: options?.count || 100,
        offset: options?.offset || 0,
        include_personal_finance_category: true,
      },
    };

    return this.makeRequest('/transactions/get', body);
  }

  async getInstitution(institutionId: string): Promise<{ institution: PlaidInstitution }> {
    const body = {
      institution_id: institutionId,
      country_codes: ['US'],
      options: {
        include_optional_metadata: true,
      },
    };

    return this.makeRequest('/institutions/get_by_id', body);
  }

  async getLiabilities(accessToken: string): Promise<any> {
    const body = {
      access_token: accessToken,
    };

    return this.makeRequest('/liabilities/get', body);
  }

  async getInvestments(accessToken: string): Promise<any> {
    const body = {
      access_token: accessToken,
    };

    return this.makeRequest('/investments/holdings/get', body);
  }

  async getInvestmentTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const body = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 100,
        offset: 0,
      },
    };

    return this.makeRequest('/investments/transactions/get', body);
  }

  async getBalance(accessToken: string): Promise<{ accounts: PlaidAccount[] }> {
    const body = {
      access_token: accessToken,
      options: {
        account_ids: [],
      },
    };

    return this.makeRequest('/accounts/balance/get', body);
  }

  async getIdentity(accessToken: string): Promise<any> {
    const body = {
      access_token: accessToken,
    };

    return this.makeRequest('/identity/get', body);
  }

  async getIncome(accessToken: string): Promise<any> {
    const body = {
      access_token: accessToken,
    };

    return this.makeRequest('/income/get', body);
  }

  async getAssetReport(accessTokens: string[], daysRequested: number = 730): Promise<any> {
    const body = {
      access_tokens: accessTokens,
      days_requested: daysRequested,
      options: {
        client_report_id: 'lifeos-asset-report',
        webhook: 'https://your-webhook-url.com/plaid-webhook',
      },
    };

    return this.makeRequest('/asset_report/create', body);
  }

  async getAssetReportPdf(assetReportToken: string): Promise<ArrayBuffer> {
    const body = {
      asset_report_token: assetReportToken,
    };

    const url = `${this.getBaseUrl()}/asset_report/pdf/get`;
    const headers = {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': this.clientId,
      'PLAID-SECRET': this.secret,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to get asset report PDF: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  async syncToLifeOS(userId: string): Promise<FinancialData> {
    try {
      const financialData: FinancialData = {
        income: {
          monthly: 0,
          yearly: 0,
          sources: [],
        },
        expenses: {
          monthly: 0,
          categories: [],
        },
        savings: {
          current: 0,
          target: 0,
          monthlyContribution: 0,
        },
        investments: {
          total: 0,
          breakdown: [],
        },
        debts: [],
        subscriptions: [],
      };

      // Get data from all connected accounts
      for (const accessToken of this.accessTokens) {
        const accounts = await this.getAccounts(accessToken);
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const transactions = await this.getTransactions(accessToken, startDate, endDate);

        // Process accounts
        for (const account of accounts.accounts) {
          if (account.type === 'depository') {
            financialData.savings.current += account.current_balance;
          } else if (account.type === 'credit') {
            financialData.debts.push({
              name: account.name,
              amount: Math.abs(account.current_balance),
              interestRate: 0, // Would need to get from liabilities
              monthlyPayment: 0, // Would need to calculate
            });
          }
        }

        // Process transactions
        const categoryTotals: Record<string, number> = {};
        let totalExpenses = 0;

        for (const transaction of transactions.transactions) {
          if (transaction.amount < 0) {
            totalExpenses += Math.abs(transaction.amount);
            const category = transaction.category?.[0] || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
          }
        }

        financialData.expenses.monthly = totalExpenses;
        financialData.expenses.categories = Object.entries(categoryTotals).map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / totalExpenses) * 100,
        }));
      }

      return financialData;
    } catch (error) {
      console.error('Failed to sync Plaid data to LifeOS:', error);
      throw error;
    }
  }

  async categorizeTransaction(transaction: PlaidTransaction): Promise<string> {
    // This would use AI to categorize transactions more accurately
    const category = transaction.category?.[0] || 'Other';

    // Map Plaid categories to LifeOS categories
    const categoryMap: Record<string, string> = {
      'Food and Drink': 'dining',
      'Transportation': 'transport',
      'Shopping': 'shopping',
      'Bills and Utilities': 'utilities',
      'Entertainment': 'entertainment',
      'Health and Fitness': 'health',
      'Travel': 'travel',
      'Education': 'education',
      'Personal Care': 'personal',
      'Business Services': 'business',
      'Government Services and Taxes': 'taxes',
      'Transfer': 'transfer',
      'Payment': 'payment',
    };

    return categoryMap[category] || 'other';
  }

  async detectSubscriptions(transactions: PlaidTransaction[]): Promise<Array<{
    name: string;
    amount: number;
    frequency: string;
    category: string;
    nextBilling: Date;
  }>> {
    const subscriptions: Array<{
      name: string;
      amount: number;
      frequency: string;
      category: string;
      nextBilling: Date;
    }> = [];

    // Group transactions by merchant
    const merchantGroups: Record<string, PlaidTransaction[]> = {};

    for (const transaction of transactions) {
      const merchant = transaction.merchant_name || transaction.name;
      if (!merchantGroups[merchant]) {
        merchantGroups[merchant] = [];
      }
      merchantGroups[merchant].push(transaction);
    }

    // Analyze each merchant for subscription patterns
    for (const [merchant, merchantTransactions] of Object.entries(merchantGroups)) {
      if (merchantTransactions.length >= 2) {
        const amounts = merchantTransactions.map(t => Math.abs(t.amount));
        const dates = merchantTransactions.map(t => new Date(t.date));

        // Check if amounts are consistent (within 10%)
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const isConsistent = amounts.every(amount =>
          Math.abs(amount - avgAmount) / avgAmount < 0.1
        );

        if (isConsistent) {
          // Determine frequency
          const timeDiff = dates[1].getTime() - dates[0].getTime();
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

          let frequency = 'monthly';
          if (daysDiff <= 7) frequency = 'weekly';
          else if (daysDiff <= 14) frequency = 'bi-weekly';
          else if (daysDiff >= 60) frequency = 'quarterly';

          const lastTransaction = merchantTransactions[merchantTransactions.length - 1];
          const nextBilling = new Date(lastTransaction.date);

          switch (frequency) {
            case 'weekly':
              nextBilling.setDate(nextBilling.getDate() + 7);
              break;
            case 'bi-weekly':
              nextBilling.setDate(nextBilling.getDate() + 14);
              break;
            case 'monthly':
              nextBilling.setMonth(nextBilling.getMonth() + 1);
              break;
            case 'quarterly':
              nextBilling.setMonth(nextBilling.getMonth() + 3);
              break;
          }

          const category = await this.categorizeTransaction(lastTransaction);
          subscriptions.push({
            name: merchant,
            amount: avgAmount,
            frequency,
            category,
            nextBilling,
          });
        }
      }
    }

    return subscriptions;
  }

  async getSpendingInsights(transactions: PlaidTransaction[]): Promise<Array<{
    type: string;
    title: string;
    message: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
  }>> {
    const insights: Array<{
      type: string;
      title: string;
      message: string;
      actionable: boolean;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Analyze spending patterns
    const categoryTotals: Record<string, number> = {};
    const monthlyTotals: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.amount < 0) {
        const category = transaction.category?.[0] || 'Other';
        const month = transaction.date.substring(0, 7); // YYYY-MM

        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + Math.abs(transaction.amount);
      }
    }

    // High spending category alert
    const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    for (const [category, amount] of Object.entries(categoryTotals)) {
      const percentage = (amount / totalSpending) * 100;
      if (percentage > 30) {
        insights.push({
          type: 'spending_alert',
          title: 'High Spending Category',
          message: `${category} accounts for ${percentage.toFixed(1)}% of your spending this month.`,
          actionable: true,
          priority: 'medium',
        });
      }
    }

    // Spending trend analysis
    const months = Object.keys(monthlyTotals).sort();
    if (months.length >= 2) {
      const recentMonths = months.slice(-2);
      const currentMonth = monthlyTotals[recentMonths[1]];
      const previousMonth = monthlyTotals[recentMonths[0]];
      const change = ((currentMonth - previousMonth) / previousMonth) * 100;

      if (change > 20) {
        insights.push({
          type: 'spending_trend',
          title: 'Spending Increase',
          message: `Your spending increased by ${change.toFixed(1)}% compared to last month.`,
          actionable: true,
          priority: 'high',
        });
      } else if (change < -20) {
        insights.push({
          type: 'spending_trend',
          title: 'Spending Decrease',
          message: `Great job! Your spending decreased by ${Math.abs(change).toFixed(1)}% compared to last month.`,
          actionable: false,
          priority: 'low',
        });
      }
    }

    return insights;
  }

  addAccessToken(accessToken: string): void {
    if (!this.accessTokens.includes(accessToken)) {
      this.accessTokens.push(accessToken);
    }
  }

  removeAccessToken(accessToken: string): void {
    this.accessTokens = this.accessTokens.filter(token => token !== accessToken);
  }

  getConnectedAccounts(): number {
    return this.accessTokens.length;
  }
}

// Export singleton instance
export const plaidService = new PlaidService(); 
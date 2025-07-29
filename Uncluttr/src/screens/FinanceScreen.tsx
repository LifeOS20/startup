import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { lifeOSAI } from '../lib/ai-service';

const FinanceScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { financialProfile } = useLifeOSStore();

  // Fetch AI-powered financial insights
  const fetchFinancialInsights = useCallback(async () => {
    if (!financialProfile) return;
    
    setLoadingInsights(true);
    try {
      const aiInsights = await lifeOSAI.generateFinancialInsights(financialProfile.data);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Failed to fetch financial insights:', error);
      Alert.alert('Error', 'Failed to load AI-powered financial insights');
    } finally {
      setLoadingInsights(false);
    }
  }, [financialProfile]);

  // Load insights when component mounts or financial data changes
  useEffect(() => {
    fetchFinancialInsights();
  }, [fetchFinancialInsights]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh financial data and insights
      // In a real app, you would fetch updated financial data here
      await fetchFinancialInsights();
    } catch (error) {
      console.error('Failed to refresh financial data:', error);
      Alert.alert('Error', 'Failed to refresh financial data');
    } finally {
      setRefreshing(false);
    }
  };

  if (!financialProfile) {
    return <LoadingSpinner message="Loading financial data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Dashboard</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
          onPress={() => setActiveTab('budget')}
        >
          <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>Insights</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            {/* Financial Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Monthly Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={styles.summaryValue}>
                    ${financialProfile.data.income.monthly.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={styles.summaryValue}>
                    ${financialProfile.data.expenses.monthly.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Savings</Text>
                  <Text style={styles.summaryValue}>
                    ${financialProfile.data.savings.monthlyContribution.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net</Text>
                  <Text style={[styles.summaryValue, {
                    color: financialProfile.data.income.monthly - financialProfile.data.expenses.monthly > 0 ? '#28a745' : '#dc3545'
                  }]}>
                    ${(financialProfile.data.income.monthly - financialProfile.data.expenses.monthly).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Expense Categories */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Expense Breakdown</Text>
              {financialProfile.data.expenses.categories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>${category.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[styles.progressBar, { width: `${category.percentage}%` }]}
                    />
                  </View>
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
              ))}
            </View>

            {/* Savings */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Savings</Text>
              <View style={styles.savingsContent}>
                <View style={styles.savingsHeader}>
                  <Text style={styles.savingsLabel}>Current</Text>
                  <Text style={styles.savingsValue}>
                    ${financialProfile.data.savings.current.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.savingsHeader}>
                  <Text style={styles.savingsLabel}>Target</Text>
                  <Text style={styles.savingsValue}>
                    ${financialProfile.data.savings.target.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View 
                    style={[styles.progressBar, { 
                      width: `${Math.min(100, (financialProfile.data.savings.current / financialProfile.data.savings.target) * 100)}%` 
                    }]}
                  />
                </View>
                <Text style={styles.savingsPercentage}>
                  {Math.round((financialProfile.data.savings.current / financialProfile.data.savings.target) * 100)}% of target
                </Text>
              </View>
            </View>

            {/* Subscriptions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Subscriptions</Text>
              {financialProfile.data.subscriptions.map((subscription, index) => (
                <View key={index} style={styles.subscriptionItem}>
                  <View style={styles.subscriptionHeader}>
                    <Text style={styles.subscriptionName}>{subscription.name}</Text>
                    <Text style={styles.subscriptionAmount}>
                      ${subscription.amount.toLocaleString()}/{subscription.frequency}
                    </Text>
                  </View>
                  <Text style={styles.subscriptionCategory}>{subscription.category}</Text>
                  <Text style={styles.subscriptionDate}>
                    Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* AI-Powered Insights Card */}
            <View style={styles.card}>
              <View style={styles.insightHeaderContainer}>
                <Text style={styles.cardTitle}>AI Financial Insights</Text>
                <TouchableOpacity onPress={fetchFinancialInsights} disabled={loadingInsights}>
                  <Text style={styles.refreshButton}>Refresh</Text>
                </TouchableOpacity>
              </View>
              
              {loadingInsights ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Analyzing your finances...</Text>
                </View>
              ) : insights ? (
                <View>
                  {insights.recommendations?.map((recommendation: string, index: number) => (
                    <View key={index} style={styles.insightItem}>
                      <Text style={styles.insightText}>• {recommendation}</Text>
                    </View>
                  ))}
                  {insights.nextActions?.length > 0 && (
                    <View style={styles.nextActionsContainer}>
                      <Text style={styles.nextActionsTitle}>Suggested Actions:</Text>
                      {insights.nextActions.map((action: string, index: number) => (
                        <TouchableOpacity key={index} style={styles.actionButton}>
                          <Text style={styles.actionButtonText}>{action}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.noInsightsText}>Unable to load insights. Tap refresh to try again.</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'budget' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Budget details coming soon</Text>
          </View>
        )}

        {activeTab === 'goals' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Financial goals coming soon</Text>
          </View>
        )}

        {activeTab === 'insights' && (
          <View style={styles.insightsContainer}>
            {loadingInsights ? (
              <LoadingSpinner message="Analyzing your financial data..." />
            ) : insights ? (
              <View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightCardTitle}>Spending Analysis</Text>
                  <Text style={styles.insightCardSubtitle}>Risk Level: {insights.riskLevel || 'Low'}</Text>
                  
                  <View style={styles.insightSection}>
                    <Text style={styles.insightSectionTitle}>Key Insights:</Text>
                    {insights.insights?.map((insight: string, index: number) => (
                      <Text key={index} style={styles.insightText}>• {insight}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.insightSection}>
                    <Text style={styles.insightSectionTitle}>Recommendations:</Text>
                    {insights.recommendations?.map((recommendation: string, index: number) => (
                      <Text key={index} style={styles.insightText}>• {recommendation}</Text>
                    ))}
                  </View>
                  
                  {insights.nextActions?.length > 0 && (
                    <View style={styles.nextActionsContainer}>
                      <Text style={styles.nextActionsTitle}>Next Steps:</Text>
                      {insights.nextActions.map((action: string, index: number) => (
                        <TouchableOpacity key={index} style={styles.actionButton}>
                          <Text style={styles.actionButtonText}>{action}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.refreshInsightsButton} 
                  onPress={fetchFinancialInsights}
                >
                  <Text style={styles.refreshInsightsButtonText}>Refresh Analysis</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noInsightsContainer}>
                <Text style={styles.noInsightsText}>Unable to load financial insights.</Text>
                <TouchableOpacity 
                  style={styles.refreshInsightsButton} 
                  onPress={fetchFinancialInsights}
                >
                  <Text style={styles.refreshInsightsButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  summaryItem: {
    width: '50%',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#212529',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  savingsContent: {
    marginTop: 8,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#212529',
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  savingsPercentage: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  subscriptionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  subscriptionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  subscriptionCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  tabContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  // New styles for AI insights
  insightHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  nextActionsContainer: {
    marginTop: 16,
  },
  nextActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  noInsightsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  // Insights tab styles
  insightsContainer: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  insightCardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  insightSection: {
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  refreshInsightsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshInsightsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noInsightsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },});

export default FinanceScreen;
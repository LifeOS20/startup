import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { FinancialProfile } from '../stores/lifeOSStore';

interface FinanceOverviewCardProps {
  financialProfile: FinancialProfile | null;
  onPress: () => void;
  onConnect: () => void;
}

const FinanceOverviewCard: React.FC<FinanceOverviewCardProps> = ({
  financialProfile,
  onPress,
  onConnect,
}) => {
  const isConnected = !!financialProfile;
  const savings = financialProfile?.data?.savings?.current ?? 0;
  const monthlyIncome = financialProfile?.data?.income?.monthly ?? 0;
  const monthlyExpenses = financialProfile?.data?.expenses?.monthly ?? 0;
  const investmentTotal = financialProfile?.data?.investments?.total ?? 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>💰 Finance</Text>
      <Text style={styles.subtitle}>{isConnected ? 'Connected' : 'Not connected'}</Text>
      {isConnected && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${savings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${monthlyIncome.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Monthly Income</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${monthlyExpenses.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Monthly Expenses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${investmentTotal.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Investments</Text>
          </View>
        </View>
      )}
      {!isConnected && (
        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectText}>Connect Bank</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  connectButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  connectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FinanceOverviewCard; 
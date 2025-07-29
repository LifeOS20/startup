import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuickStatsCardProps {
  healthProfile: any;
  financialProfile: any;
  schedule: any[];
  notifications: any[];
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  healthProfile,
  financialProfile,
  schedule,
  notifications,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Quick Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{schedule.length}</Text>
          <Text style={styles.statLabel}>Events Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {healthProfile?.metrics?.steps || 0}
          </Text>
          <Text style={styles.statLabel}>Steps</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${financialProfile?.data?.savings?.current || 0}
          </Text>
          <Text style={styles.statLabel}>Savings</Text>
        </View>
      </View>
    </View>
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
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
});

export default QuickStatsCard; 
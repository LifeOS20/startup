import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const SecurityDashboardScreen: React.FC = () => {
  const { securityLogs, dataAccessLogs, isLoading } = useLifeOSStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading security data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Security Logs</Text>
      <FlatList
        data={securityLogs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logTimestamp}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.logDetails}>{JSON.stringify(item.details)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No security logs found.</Text>}
        contentContainerStyle={securityLogs.length === 0 ? styles.emptyContainer : undefined}
      />
      <Text style={styles.title}>Data Access Logs</Text>
      <FlatList
        data={dataAccessLogs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logAction}>{item.agent} - {item.dataType} ({item.accessType})</Text>
            <Text style={styles.logTimestamp}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.logDetails}>{item.purpose}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No data access logs found.</Text>}
        contentContainerStyle={dataAccessLogs.length === 0 ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 12,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  logTimestamp: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  logDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default SecurityDashboardScreen; 
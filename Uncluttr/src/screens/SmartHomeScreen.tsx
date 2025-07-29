import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const SmartHomeScreen: React.FC = () => {
  const { smartHomeData, isLoading } = useLifeOSStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading smart home data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Smart Home Devices</Text>
      <FlatList
        data={smartHomeData?.devices || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceType}>{item.type}</Text>
            <Text style={styles.deviceStatus}>
              {item.status === 'online' ? '🟢 Online' : item.status === 'offline' ? '🔴 Offline' : '⚠️ Error'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No smart home devices found.</Text>}
        contentContainerStyle={(!smartHomeData || smartHomeData.devices.length === 0) ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

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
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  deviceType: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 14,
    marginTop: 4,
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

export default SmartHomeScreen; 
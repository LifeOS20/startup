import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ScheduleScreen: React.FC = () => {
  const { schedule, isLoading } = useLifeOSStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading your schedule..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Schedule</Text>
      <FlatList
        data={schedule}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventTime}>{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
            <Text style={styles.eventType}>{item.type}</Text>
            <Text style={styles.eventStatus}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No events scheduled.</Text>}
        contentContainerStyle={schedule.length === 0 ? styles.emptyContainer : undefined}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => {/* Navigate to add event */}}>
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  eventTime: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  eventStatus: {
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
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen; 
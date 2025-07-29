import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const FamilyScreen: React.FC = () => {
  const { familyData, isLoading } = useLifeOSStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading family data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Family Members</Text>
      <FlatList
        data={familyData?.members || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberRelationship}>{item.relationship}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No family members found.</Text>}
        contentContainerStyle={(!familyData || familyData.members.length === 0) ? styles.emptyContainer : undefined}
      />
      <Text style={styles.title}>Upcoming Family Events</Text>
      <FlatList
        data={familyData?.events || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
            <Text style={styles.eventType}>{item.type}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events.</Text>}
        contentContainerStyle={(!familyData || familyData.events.length === 0) ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
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
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  memberRelationship: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  eventDate: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  eventType: {
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

export default FamilyScreen; 
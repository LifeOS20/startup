import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { FamilyData } from '../stores/lifeOSStore';

interface FamilyOverviewCardProps {
  familyData: FamilyData | null;
  onPress: () => void;
}

const FamilyOverviewCard: React.FC<FamilyOverviewCardProps> = ({
  familyData,
  onPress,
}) => {
  const isConnected = !!familyData;
  const memberCount = familyData?.members?.length ?? 0;
  const upcomingEvents = familyData?.events?.filter(e => new Date(e.date) > new Date()).length ?? 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>👨‍👩‍👧‍👦 Family</Text>
      <Text style={styles.subtitle}>{isConnected ? 'Connected' : 'Not connected'}</Text>
      {isConnected && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>
        </View>
      )}
      {!isConnected && (
        <Text style={styles.connectHint}>Connect your family group to get started.</Text>
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
  connectHint: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FamilyOverviewCard; 
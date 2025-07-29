import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ScheduleItem } from '../stores/lifeOSStore';

interface ScheduleOverviewCardProps {
  schedule: ScheduleItem[];
  onPress: () => void;
  onConnect: () => void;
}

const ScheduleOverviewCard: React.FC<ScheduleOverviewCardProps> = ({
  schedule,
  onPress,
  onConnect,
}) => {
  const today = new Date();
  const todayEvents = schedule.filter(item => {
    const start = new Date(item.startTime);
    return (
      start.getDate() === today.getDate() &&
      start.getMonth() === today.getMonth() &&
      start.getFullYear() === today.getFullYear()
    );
  });
  const isConnected = schedule.length > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>📅 Schedule</Text>
      <Text style={styles.subtitle}>{isConnected ? 'Connected' : 'Not connected'}</Text>
      {isConnected && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayEvents.length}</Text>
            <Text style={styles.statLabel}>Events Today</Text>
          </View>
          {todayEvents.slice(0, 2).map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>{formatTime(event.startTime)} - {formatTime(event.endTime)}</Text>
            </View>
          ))}
        </View>
      )}
      {!isConnected && (
        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectText}>Connect Calendar</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 8,
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
  eventItem: {
    marginTop: 4,
    padding: 6,
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  eventTime: {
    fontSize: 12,
    color: '#6c757d',
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

export default ScheduleOverviewCard; 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Notification } from '../stores/lifeOSStore';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'info': return 'ℹ️';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'success': return '✅';
    default: return '🔔';
  }
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
  return (
    <TouchableOpacity style={[styles.container, notification.read && styles.read]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon(notification.type)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.meta}>{formatTime(notification.timestamp)} · {notification.category}</Text>
        {notification.actionUrl && (
          <TouchableOpacity style={styles.actionButton} onPress={() => { if (notification.actionUrl) { /* handle deep link or navigation */ } }}>
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  read: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 4,
  },
  meta: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 4,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NotificationCard; 
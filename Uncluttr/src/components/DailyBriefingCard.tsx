import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DailyBriefingCardProps {
  briefing: string;
  onRefresh: () => void;
}

const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({ briefing, onRefresh }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Daily Briefing</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.briefing}>
        {briefing || 'Your AI assistant is preparing your daily briefing...'}
      </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 16,
  },
  briefing: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});

export default DailyBriefingCard; 
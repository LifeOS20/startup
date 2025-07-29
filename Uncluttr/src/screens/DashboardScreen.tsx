import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLifeOSStore } from '../stores/lifeOSStore';
import { useAuthStore } from '../stores/authStore';
import { appInitializer } from '../services/AppInitializer';

// Import components (will be created)
import DailyBriefingCard from '../components/DailyBriefingCard';
import QuickStatsCard from '../components/QuickStatsCard';
import HealthOverviewCard from '../components/HealthOverviewCard';
import FinanceOverviewCard from '../components/FinanceOverviewCard';
import ScheduleOverviewCard from '../components/ScheduleOverviewCard';
import SmartHomeOverviewCard from '../components/SmartHomeOverviewCard';
import FamilyOverviewCard from '../components/FamilyOverviewCard';
import NotificationCard from '../components/NotificationCard';
import LoadingSpinner from '../components/LoadingSpinner';
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    user,
    dailyBriefing,
    healthProfile,
    financialProfile,
    schedule,
    smartHomeData,
    familyData,
    notifications,
    activeAgents,
    syncStatus,
    lastSync,
  } = useLifeOSStore();

  const { user: authUser } = useAuthStore();

  useEffect(() => {
    // Load initial data if not already loaded
    if (!dailyBriefing && !isLoading) {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Perform full sync to get latest data
      await appInitializer.performFullSync();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectIntegration = async (integration: string) => {
    try {
      let success = false;
      
      switch (integration) {
        case 'google-calendar':
          success = await appInitializer.connectGoogleCalendar();
          break;
        case 'plaid':
          success = await appInitializer.connectPlaid();
          break;
        case 'health':
          success = await appInitializer.requestHealthPermissions();
          break;
        default:
          break;
      }

      if (success) {
        Alert.alert('Success', `${integration} connected successfully!`);
        await loadDashboardData();
      } else {
        Alert.alert('Error', `Failed to connect ${integration}. Please try again.`);
      }
    } catch (error) {
      console.error(`Failed to connect ${integration}:`, error);
      Alert.alert('Error', `Failed to connect ${integration}. Please try again.`);
    }
  };

  const handleNavigateToScreen = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const handleViewSecurityDashboard = () => {
    navigation.navigate('SecurityDashboard' as never);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your LifeOS dashboard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {getGreeting()}, {authUser?.name || 'User'}!
            </Text>
            <Text style={styles.subtitle}>Your personal CEO dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.securityButton}
            onPress={handleViewSecurityDashboard}
          >
            <Text style={styles.securityButtonText}>🔒</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        {syncStatus !== 'idle' && (
          <View style={styles.syncStatus}>
            <Text style={styles.syncStatusText}>
              {syncStatus === 'syncing' ? '🔄 Syncing...' : 
               syncStatus === 'completed' ? '✅ Synced' : 
               '❌ Sync failed'}
            </Text>
            {lastSync && (
              <Text style={styles.lastSyncText}>
                Last sync: {formatTime(lastSync)}
              </Text>
            )}
          </View>
        )}

        {/* Daily Briefing */}
        <DailyBriefingCard
          briefing={dailyBriefing}
          onRefresh={loadDashboardData}
        />

        {/* Quick Stats */}
        <QuickStatsCard
          healthProfile={healthProfile}
          financialProfile={financialProfile}
          schedule={schedule}
          notifications={notifications}
        />

        {/* Health Overview */}
        <HealthOverviewCard
          healthProfile={healthProfile}
          onPress={() => handleNavigateToScreen('Health')}
          onConnect={() => handleConnectIntegration('health')}
        />

        {/* Finance Overview */}
        <FinanceOverviewCard
          financialProfile={financialProfile}
          onPress={() => handleNavigateToScreen('Finance')}
          onConnect={() => handleConnectIntegration('plaid')}
        />

        {/* Schedule Overview */}
        <ScheduleOverviewCard
          schedule={schedule}
          onPress={() => handleNavigateToScreen('Schedule')}
          onConnect={() => handleConnectIntegration('google-calendar')}
        />

        {/* Smart Home Overview */}
        <SmartHomeOverviewCard
          smartHomeData={smartHomeData}
          onPress={() => handleNavigateToScreen('SmartHome')}
        />

        {/* Family Overview */}
        <FamilyOverviewCard
          familyData={familyData}
          onPress={() => handleNavigateToScreen('Family')}
        />

        {/* AI Agents Status */}
        {activeAgents.length > 0 && (
          <View style={styles.agentsSection}>
            <Text style={styles.sectionTitle}>🤖 AI Agents</Text>
            <View style={styles.agentsGrid}>
              {activeAgents.map((agent) => (
                <View key={agent.id} style={styles.agentCard}>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <Text style={styles.agentStatus}>
                    {agent.status === 'active' ? '🟢' : '🔴'} {agent.status}
                  </Text>
                  <Text style={styles.agentRole}>{agent.role}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>🔔 Recent Notifications</Text>
            {notifications.slice(0, 3).map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => {
                  // Handle notification press
                  useLifeOSStore.getState().markNotificationRead(notification.id);
                }}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigateToScreen('Schedule')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Add Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigateToScreen('Health')}
            >
              <Text style={styles.quickActionIcon}>💧</Text>
              <Text style={styles.quickActionText}>Log Water</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigateToScreen('Finance')}
            >
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigateToScreen('Family')}
            >
              <Text style={styles.quickActionIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.quickActionText}>Family Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  securityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  securityButtonText: {
    fontSize: 18,
  },
  syncStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
  },
  syncStatusText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 10,
    color: '#1976d2',
  },
  agentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  agentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  agentCard: {
    flex: 1,
    minWidth: 150,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  agentStatus: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  agentRole: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  notificationsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 80,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#212529',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DashboardScreen; 
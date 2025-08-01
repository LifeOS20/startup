import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleCalendarService } from '../services/GoogleCalendarService';
import AISchedulingService from '../services/AISchedulingService';
import { CalendarOptimizationService } from '../services/CalendarOptimizationService';
import TravelIntegrationService from '../services/TravelIntegrationService';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  status?: string;
}

interface OptimizationSuggestion {
  id: string;
  type: 'reschedule' | 'buffer' | 'energy_alignment' | 'focus_protection' | 'travel_adjustment';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  reasoning: string;
  impact: string;
  autoApprove: boolean;
}

interface BurnoutRisk {
  risk: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: string[];
  recommendations: string[];
}

export default function ScheduleScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'insights' | 'optimize'>('schedule');
  const [isConnected, setIsConnected] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState({
    totalOptimizations: 0,
    appliedOptimizations: 0,
    timesSaved: 0,
    burnoutPrevented: 0,
    focusTimeProtected: 0
  });

  const calendarService = new GoogleCalendarService();
  const aiService = new AISchedulingService();
  const optimizationService = new CalendarOptimizationService();
  const travelService = new TravelIntegrationService();

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsLoading(true);

      // Check if user has connected Google Calendar
      const isCalendarConnected = await AsyncStorage.getItem('google_calendar_connected');
      setIsConnected(isCalendarConnected === 'true');

      if (isCalendarConnected === 'true') {
        await calendarService.initialize();
        // Note: AISchedulingService and TravelIntegrationService don't require initialization
        await optimizationService.initialize();

        await loadScheduleData();
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert('Error', 'Failed to initialize scheduling services');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScheduleData = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [
        calendarEventsResponse,
        pendingOptimizations,
        burnoutData,
        stats
      ] = await Promise.all([
        calendarService.getEvents('primary', today, nextWeek),
        optimizationService.getPendingOptimizations(),
        calendarService.detectBurnoutRisk(),
        optimizationService.getOptimizationStats()
      ]);

      // Extract events from the response
      const calendarEvents = calendarEventsResponse.items || [];
      setEvents(calendarEvents);
      setOptimizations(pendingOptimizations);
      setBurnoutRisk(burnoutData);
      setOptimizationStats(stats);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadScheduleData();
    setIsRefreshing(false);
  }, []);

  const runFullOptimization = async () => {
    try {
      setIsLoading(true);
      Alert.alert('🤖 AI Optimization', 'Running comprehensive calendar analysis...');

      const newOptimizations = await optimizationService.runFullOptimization();
      setOptimizations(newOptimizations);

      if (newOptimizations.length > 0) {
        Alert.alert(
          '✨ Optimization Complete',
          `Found ${newOptimizations.length} ways to improve your schedule!`,
          [{ text: 'Review', onPress: () => setSelectedTab('optimize') }]
        );
      } else {
        Alert.alert('🎯 Perfect Schedule', 'Your calendar is already optimally organized!');
      }
    } catch (error) {
      console.error('Error running optimization:', error);
      Alert.alert('Error', 'Failed to run optimization analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const applyOptimization = async (optimizationId: string) => {
    try {
      const success = await optimizationService.applyOptimization(optimizationId);
      if (success) {
        Alert.alert('✅ Applied', 'Optimization has been applied to your calendar');
        await loadScheduleData();
      } else {
        Alert.alert('Error', 'Failed to apply optimization');
      }
    } catch (error) {
      console.error('Error applying optimization:', error);
      Alert.alert('Error', 'Failed to apply optimization');
    }
  };

  const rejectOptimization = async (optimizationId: string) => {
    try {
      await optimizationService.rejectOptimization(optimizationId);
      await loadScheduleData();
    } catch (error) {
      console.error('Error rejecting optimization:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      Alert.alert(
        '🔗 Connect Google Calendar',
        'This will enable AI-powered scheduling optimization',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect', onPress: async () => {
              // Implementation would depend on your Google Sign-in setup
              await AsyncStorage.setItem('google_calendar_connected', 'true');
              setIsConnected(true);
              await initializeServices();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>📅</Text>
      </View>
      <Text style={styles.emptyTitle}>Connect Your Calendar</Text>
      <Text style={styles.emptyDescription}>
        Enable AI-powered scheduling with smart optimization, burnout prevention, and proactive calendar management
      </Text>
      <TouchableOpacity style={styles.connectButton} onPress={connectGoogleCalendar}>
        <Text style={styles.connectButtonText}>Connect Google Calendar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEventItem = ({ item }: { item: CalendarEvent }) => {
    const startTime = new Date(item.start.dateTime);
    const endTime = new Date(item.end.dateTime);
    const isToday = startTime.toDateString() === new Date().toDateString();
    const isUpcoming = startTime > new Date();

    return (
      <View style={[styles.eventCard, isToday && styles.todayEvent]}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.summary}</Text>
          {isUpcoming && <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>Upcoming</Text>
          </View>}
        </View>

        <View style={styles.eventDetails}>
          <Text style={styles.eventTime}>
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.location && (
            <Text style={styles.eventLocation}>📍 {item.location}</Text>
          )}
          {item.attendees && item.attendees.length > 0 && (
            <Text style={styles.eventAttendees}>
              👥 {item.attendees.length} attendee{item.attendees.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    );
  };

  const renderOptimizationItem = ({ item }: { item: OptimizationSuggestion }) => {
    const priorityColors = {
      high: '#FF6B6B',
      medium: '#4ECDC4',
      low: '#45B7D1'
    };

    return (
      <View style={styles.optimizationCard}>
        <View style={styles.optimizationHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
          <Text style={styles.optimizationType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        </View>

        <Text style={styles.optimizationSuggestion}>{item.suggestion}</Text>
        <Text style={styles.optimizationReasoning}>{item.reasoning}</Text>
        <Text style={styles.optimizationImpact}>💡 {item.impact}</Text>

        <View style={styles.optimizationActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => rejectOptimization(item.id)}
          >
            <Text style={styles.rejectButtonText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.applyButton]}
            onPress={() => applyOptimization(item.id)}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBurnoutRisk = () => {
    if (!burnoutRisk) return null;

    const riskColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      critical: '#F44336'
    };

    const riskEmojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    return (
      <View style={[styles.burnoutCard, { borderLeftColor: riskColors[burnoutRisk.risk] }]}>
        <View style={styles.burnoutHeader}>
          <Text style={styles.burnoutEmoji}>{riskEmojis[burnoutRisk.risk]}</Text>
          <Text style={styles.burnoutTitle}>Burnout Risk: {burnoutRisk.risk.toUpperCase()}</Text>
          <Text style={styles.burnoutScore}>{burnoutRisk.score}%</Text>
        </View>

        {burnoutRisk.factors.length > 0 && (
          <View style={styles.burnoutSection}>
            <Text style={styles.burnoutSectionTitle}>Risk Factors:</Text>
            {burnoutRisk.factors.map((factor, index) => (
              <Text key={index} style={styles.burnoutFactor}>• {factor}</Text>
            ))}
          </View>
        )}

        {burnoutRisk.recommendations.length > 0 && (
          <View style={styles.burnoutSection}>
            <Text style={styles.burnoutSectionTitle}>Recommendations:</Text>
            {burnoutRisk.recommendations.map((rec, index) => (
              <Text key={index} style={styles.burnoutRecommendation}>✓ {rec}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'schedule':
        return (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );

      case 'insights':
        return (
          <ScrollView
            style={styles.insightsContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {renderBurnoutRisk()}

            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📊 Optimization Impact</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{optimizationStats.appliedOptimizations}</Text>
                  <Text style={styles.statLabel}>Optimizations Applied</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{optimizationStats.timesSaved}m</Text>
                  <Text style={styles.statLabel}>Time Saved</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{optimizationStats.focusTimeProtected}h</Text>
                  <Text style={styles.statLabel}>Focus Time Protected</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{optimizationStats.burnoutPrevented}</Text>
                  <Text style={styles.statLabel}>Burnout Incidents Prevented</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 'optimize':
        return (
          <View style={styles.optimizeContainer}>
            <View style={styles.optimizeHeader}>
              <TouchableOpacity style={styles.optimizeButton} onPress={runFullOptimization}>
                <Text style={styles.optimizeButtonText}>🤖 Run AI Optimization</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={optimizations}
              renderItem={renderOptimizationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyOptimizations}>
                  <Text style={styles.emptyOptimizationsText}>🎯</Text>
                  <Text style={styles.emptyOptimizationsTitle}>No Optimizations Available</Text>
                  <Text style={styles.emptyOptimizationsDesc}>
                    Your schedule is perfectly optimized! Run a new analysis to check for improvements.
                  </Text>
                </View>
              )}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading AI Schedule Assistant...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.container}>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Calendar Optimization</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'schedule', label: 'Events', icon: '📅' },
          { key: 'insights', label: 'Insights', icon: '📊' },
          { key: 'optimize', label: 'Optimize', icon: '🤖' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, selectedTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4
  },
  activeTab: {
    backgroundColor: '#007AFF'
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666'
  },
  activeTabLabel: {
    color: '#FFFFFF'
  },
  listContainer: {
    padding: 20
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  todayEvent: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8
  },
  upcomingBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  eventDetails: {
    marginBottom: 8
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4
  },
  eventLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2
  },
  eventAttendees: {
    fontSize: 14,
    color: '#666666'
  },
  eventDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20
  },
  optimizeContainer: {
    flex: 1
  },
  optimizeHeader: {
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  optimizeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  optimizationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  optimizationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666'
  },
  optimizationSuggestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  optimizationReasoning: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8
  },
  optimizationImpact: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 16
  },
  optimizationActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  rejectButton: {
    backgroundColor: '#F5F5F5'
  },
  applyButton: {
    backgroundColor: '#4CAF50'
  },
  rejectButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600'
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyOptimizations: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyOptimizationsText: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyOptimizationsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  emptyOptimizationsDesc: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40
  },
  insightsContainer: {
    flex: 1,
    padding: 20
  },
  burnoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  burnoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  burnoutEmoji: {
    fontSize: 24,
    marginRight: 12
  },
  burnoutTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  burnoutScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5722'
  },
  burnoutSection: {
    marginBottom: 12
  },
  burnoutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  burnoutFactor: {
    fontSize: 14,
    color: '#FF5722',
    marginBottom: 4
  },
  burnoutRecommendation: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  emptyIconText: {
    fontSize: 32
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center'
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
}); 
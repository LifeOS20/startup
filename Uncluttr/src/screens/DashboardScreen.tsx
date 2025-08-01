import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/DatabaseService';

interface ConnectedService {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  data?: any;
}

interface DashboardState {
  services: ConnectedService[];
  lastUpdated: Date | null;
}

const DashboardScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    services: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good Evening');
    } else {
      setGreeting('Good Night');
    }
  };

  const checkConnectedServices = async (): Promise<ConnectedService[]> => {
    const services: ConnectedService[] = [];

    // Check each service individually without causing errors
    // Only add services that are actually connected and have real data

    // For now, return empty array until services are properly connected
    // This prevents any mock/predefined data from showing

    return services;
  };

  const loadDashboardData = async () => {
    if (!refreshing) setLoading(true);

    try {
      const connectedServices = await checkConnectedServices();

      setDashboardState({
        services: connectedServices,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await databaseService.getCurrentUser();
        if (user) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
    updateGreeting();
    loadDashboardData();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <View style={styles.iconCircle} />
      </View>
      <Text style={styles.emptyTitle}>Welcome to your Life Dashboard</Text>
      <Text style={styles.emptySubtitle}>
        Connect your services to see personalized insights and data from your daily life.
      </Text>
      <View style={styles.servicesList}>
        <Text style={styles.servicesTitle}>Available Integrations:</Text>
        <View style={styles.serviceItem}>
          <View style={styles.serviceDot} />
          <Text style={styles.serviceText}>Calendar & Schedule</Text>
        </View>
        <View style={styles.serviceItem}>
          <View style={styles.serviceDot} />
          <Text style={styles.serviceText}>Health & Fitness</Text>
        </View>
        <View style={styles.serviceItem}>
          <View style={styles.serviceDot} />
          <Text style={styles.serviceText}>Financial Accounts</Text>
        </View>
        <View style={styles.serviceItem}>
          <View style={styles.serviceDot} />
          <Text style={styles.serviceText}>Smart Home</Text>
        </View>
      </View>
    </View>
  );

  const ConnectedServiceCard = ({ service }: { service: ConnectedService }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <View style={styles.connectedIndicator} />
      </View>
      {/* Service-specific data will be rendered here when connected */}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Setting up your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasConnectedServices = dashboardState.services.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{userName || 'Welcome'}</Text>
        </View>
        {hasConnectedServices && (
          <TouchableOpacity onPress={refreshData} disabled={refreshing} style={styles.refreshButton}>
            <Text style={styles.refreshText}>
              {refreshing ? '···' : '↻'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        <View style={styles.content}>
          {hasConnectedServices ? (
            <>
              {/* Connected Services */}
              <View style={styles.servicesSection}>
                <Text style={styles.sectionTitle}>Your Connected Life</Text>
                {dashboardState.services.map((service) => (
                  <ConnectedServiceCard key={service.id} service={service} />
                ))}
              </View>

              {/* Last Updated */}
              {dashboardState.lastUpdated && (
                <View style={styles.lastUpdated}>
                  <Text style={styles.lastUpdatedText}>
                    Last updated: {dashboardState.lastUpdated.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refreshText: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  servicesList: {
    width: '100%',
    maxWidth: 280,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  serviceText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Connected Services
  servicesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  connectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  // Last Updated
  lastUpdated: {
    alignItems: 'center',
    marginTop: 20,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '400',
  },
});

export default DashboardScreen;
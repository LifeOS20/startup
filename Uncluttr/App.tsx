import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import HealthScreen from './src/screens/HealthScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import FamilyScreen from './src/screens/FamilyScreen';
import SmartHomeScreen from './src/screens/SmartHomeScreen';
import SecurityDashboardScreen from './src/screens/SecurityDashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';

// Import services and components
import { databaseService, User } from './src/services/DatabaseService';
import LoadingScreen from './src/components/LoadingScreen';
import TabBarIcon from './src/components/TabBarIcon';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

// Modern tab navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="More" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Authentication state hook
const useAppState = () => {
  const [appState, setAppState] = useState<{
    isLoading: boolean;
    showOnboarding: boolean;
    isAuthenticated: boolean;
    user: User | null;
    hasCompletedOnboarding: boolean;
  }>({
    isLoading: true,
    showOnboarding: true, // Default to showing onboarding
    isAuthenticated: false,
    user: null,
    hasCompletedOnboarding: false,
  });

  useEffect(() => {
    const checkAppState = async () => {
      try {
        console.log('🚀 Starting app state check...');

        // FORCE RESET: Clear all storage for debugging
        await AsyncStorage.clear();
        console.log('🧹 Cleared all AsyncStorage');

        // Initialize database first
        await databaseService.initialize();
        console.log('✅ Database initialized');

        // Since we cleared storage, this should be null
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('🔍 hasSeenOnboarding from storage:', hasSeenOnboarding);

        // This should also be null since we cleared everything
        const user = await databaseService.getCurrentUser();
        console.log('👤 Current user:', user ? `${user.email} (ID: ${user.id})` : 'None');

        const hasOnboarded = user ? await databaseService.hasCompletedOnboarding(user.id) : false;
        console.log('🎯 User has completed onboarding:', hasOnboarded);

        // Force show onboarding since we cleared everything
        const shouldShowOnboarding = !hasSeenOnboarding; // Should be true since null
        console.log('📱 Should show onboarding:', shouldShowOnboarding);

        const finalState = {
          isLoading: false,
          showOnboarding: true, // FORCE onboarding for now
          isAuthenticated: false, // FORCE not authenticated
          user: null,
          hasCompletedOnboarding: false,
        };

        console.log('🏁 Final app state (FORCED):', finalState);
        setAppState(finalState);

      } catch (error) {
        console.error('❌ App state check failed:', error);
        // On error, always show onboarding to ensure proper flow
        const errorState = {
          isLoading: false,
          showOnboarding: true,
          isAuthenticated: false,
          user: null,
          hasCompletedOnboarding: false,
        };
        console.log('🔄 Setting error state:', errorState);
        setAppState(errorState);
      }
    };

    checkAppState();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setAppState(prev => ({ ...prev, showOnboarding: false }));
  };

  const refreshAuthState = async () => {
    setAppState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay to show loading

    try {
      const user = await databaseService.getCurrentUser();
      const hasOnboarded = user ? await databaseService.hasCompletedOnboarding(user.id) : false;

      setAppState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: !!user,
        user,
        hasCompletedOnboarding: hasOnboarded,
      }));
    } catch (error) {
      console.error('Auth state refresh failed:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        hasCompletedOnboarding: false,
      }));
    }
  };

  return { ...appState, completeOnboarding, refreshAuthState };
};

// Main App Component
const App: React.FC = () => {
  const {
    isLoading,
    showOnboarding,
    isAuthenticated,
    hasCompletedOnboarding,
    completeOnboarding,
    refreshAuthState
  } = useAppState();

  useEffect(() => {
    // Initialize database service on app start
    databaseService.initialize().catch((error: any) => {
      console.error('Database service initialization failed:', error);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
            translucent={false}
          />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                presentation: 'card',
                gestureEnabled: true,
              }}
            >
              {showOnboarding ? (
                <>
                  <Stack.Screen
                    name="Onboarding"
                    options={{ gestureEnabled: false }}
                  >
                    {(props) => <OnboardingScreen {...props} onComplete={completeOnboarding} />}
                  </Stack.Screen>
                </>
              ) : !isAuthenticated ? (
                <>
                  <Stack.Screen
                    name="Auth"
                    options={{ animationTypeForReplace: 'pop' }}
                  >
                    {(props) => <AuthScreen {...props} onAuthSuccess={refreshAuthState} />}
                  </Stack.Screen>
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ gestureEnabled: false }}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

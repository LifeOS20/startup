import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { aiService } from '../services/AIService';

const HealthScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { healthProfile, updateHealthMetrics, setBurnoutWarning, addWellnessRecommendation } = useLifeOSStore();

  // Load AI insights on initial render
  useEffect(() => {
    if (healthProfile && !healthProfile.burnoutWarning) {
      generateAIInsights();
    }
  }, []);

  const generateAIInsights = async () => {
    if (!healthProfile) return;
    
    setLoadingInsights(true);
    try {
      // Generate burnout warning
      const burnoutData = await aiService.detectBurnout({
        sleep: healthProfile.metrics.sleep,
        activity: healthProfile.metrics.activity,
        mood: healthProfile.metrics.mood,
        stress: { level: healthProfile.metrics.mood.stress }
      });
      
      // Update burnout warning in store
      setBurnoutWarning(burnoutData);
      
      // Generate wellness recommendations
      const recommendations = await aiService.generateWellnessRecommendations({
        metrics: healthProfile.metrics,
        goals: healthProfile.goals,
        recentActivity: {
          steps: healthProfile.metrics.activity.steps,
          workouts: healthProfile.metrics.activity.workouts,
          sleep: healthProfile.metrics.sleep.hours
        }
      });
      
      // Clear existing recommendations and add new ones
      healthProfile.wellnessRecommendations = [];
      recommendations.forEach(rec => {
        addWellnessRecommendation(rec);
      });
      
      Alert.alert('Success', 'Health insights updated!');
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      Alert.alert('Error', 'Failed to generate health insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh health data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch updated health data here
      
      // Generate new AI insights
      await generateAIInsights();
    } catch (error) {
      console.error('Failed to refresh health data:', error);
      Alert.alert('Error', 'Failed to refresh health data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddWater = () => {
    if (healthProfile) {
      const currentWater = healthProfile.metrics.hydration.waterIntake;
      updateHealthMetrics({
        hydration: {
          ...healthProfile.metrics.hydration,
          waterIntake: currentWater + 250, // Add 250ml
        },
      });
      Alert.alert('Success', '250ml of water added!');
    }
  };

  if (!healthProfile) {
    return <LoadingSpinner message="Loading health data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health & Wellness</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={generateAIInsights}
          disabled={loadingInsights}
        >
          {loadingInsights ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh Insights</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
          onPress={() => setActiveTab('sleep')}
        >
          <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>Sleep</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.activeTabText]}>Nutrition</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            {/* Current Mood */}
            <View style={styles.moodCard}>
              <Text style={styles.cardTitle}>Current Mood</Text>
              <View style={styles.moodContent}>
                <Text style={styles.moodEmoji}>
                  {getMoodEmoji(healthProfile.metrics.mood.current)}
                </Text>
                <View>
                  <Text style={styles.moodText}>{healthProfile.metrics.mood.current}</Text>
                  <Text style={styles.moodSubtext}>
                    Energy: {healthProfile.metrics.mood.energy}/10
                  </Text>
                  <Text style={styles.moodSubtext}>
                    Stress: {healthProfile.metrics.mood.stress}/10
                  </Text>
                </View>
              </View>
            </View>

            {/* Hydration */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Hydration</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddWater}>
                  <Text style={styles.addButtonText}>+ Add Water</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.hydrationContent}>
                <View style={styles.progressContainer}>
                  <View 
                    style={[styles.progressBar, { width: `${Math.min(100, (healthProfile.metrics.hydration.waterIntake / healthProfile.metrics.hydration.target) * 100)}%` }]}
                  />
                </View>
                <Text style={styles.hydrationText}>
                  {healthProfile.metrics.hydration.waterIntake}ml / {healthProfile.metrics.hydration.target}ml
                </Text>
              </View>
            </View>

            {/* Activity Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Activity</Text>
              <View style={styles.activityGrid}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>{healthProfile.metrics.activity.steps}</Text>
                  <Text style={styles.activityLabel}>Steps</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>{healthProfile.metrics.activity.calories}</Text>
                  <Text style={styles.activityLabel}>Calories</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>{healthProfile.metrics.activity.activeMinutes}</Text>
                  <Text style={styles.activityLabel}>Active Min</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>{healthProfile.metrics.activity.workouts}</Text>
                  <Text style={styles.activityLabel}>Workouts</Text>
                </View>
              </View>
            </View>

            {/* Sleep Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Last Night's Sleep</Text>
              <View style={styles.sleepContent}>
                <Text style={styles.sleepHours}>{healthProfile.metrics.sleep.hours}h</Text>
                <View style={styles.sleepDetails}>
                  <Text style={styles.sleepQuality}>Quality: {healthProfile.metrics.sleep.quality}</Text>
                  <Text style={styles.sleepPhases}>Deep Sleep: {healthProfile.metrics.sleep.deepSleep}h</Text>
                  <Text style={styles.sleepPhases}>REM Sleep: {healthProfile.metrics.sleep.remSleep}h</Text>
                </View>
              </View>
            </View>

            {/* Burnout Warning */}
            {healthProfile.burnoutWarning && (
              <View style={[styles.card, styles.warningCard]}>
                <Text style={styles.warningTitle}>⚠️ Burnout Warning</Text>
                <Text style={styles.warningLevel}>
                  Level: {healthProfile.burnoutWarning.level.toUpperCase()}
                </Text>
                <Text style={styles.warningMessage}>
                  {healthProfile.burnoutWarning.message}
                </Text>
                <View style={styles.suggestedActions}>
                  <Text style={styles.suggestedActionsTitle}>Suggested Actions:</Text>
                  {healthProfile.burnoutWarning.suggestedActions.map((action, index) => (
                    <Text key={index} style={styles.actionItem}>• {action}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Wellness Recommendations */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>AI Wellness Recommendations</Text>
                {loadingInsights && <ActivityIndicator size="small" color="#007AFF" />}
              </View>
              {healthProfile.wellnessRecommendations.length > 0 ? (
                healthProfile.wellnessRecommendations.map((recommendation, index) => (
                  <Text key={index} style={styles.recommendationItem}>• {recommendation}</Text>
                ))
              ) : (
                <Text style={styles.noRecommendations}>No recommendations available. Tap "Refresh Insights" to generate.</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Activity tracking details coming soon</Text>
          </View>
        )}

        {activeTab === 'sleep' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Sleep analysis details coming soon</Text>
          </View>
        )}

        {activeTab === 'nutrition' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Nutrition tracking details coming soon</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getMoodEmoji = (mood: string): string => {
  switch (mood.toLowerCase()) {
    case 'happy': return '😊';
    case 'energetic': return '⚡';
    case 'calm': return '😌';
    case 'tired': return '😴';
    case 'stressed': return '😰';
    case 'anxious': return '😟';
    case 'sad': return '😔';
    default: return '😐';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  refreshButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  moodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  moodSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  hydrationContent: {
    marginTop: 8,
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  hydrationText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'right',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  activityItem: {
    width: '50%',
    paddingVertical: 8,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
  },
  activityLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  sleepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sleepHours: {
    fontSize: 36,
    fontWeight: '600',
    color: '#212529',
    marginRight: 16,
  },
  sleepDetails: {
    flex: 1,
  },
  sleepQuality: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  sleepPhases: {
    fontSize: 14,
    color: '#6c757d',
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningLevel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#856404',
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
  suggestedActions: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  suggestedActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  actionItem: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  recommendationItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  noRecommendations: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default HealthScreen;
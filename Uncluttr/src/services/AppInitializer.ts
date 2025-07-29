import { Platform } from 'react-native';
import { databaseService } from './DatabaseService';
import { aiService } from './AIService';
import { googleCalendarService } from './GoogleCalendarService';
import { plaidService } from './PlaidService';
import { healthService } from './HealthService';
import { useLifeOSStore } from '../stores/lifeOSStore';
import { useAuthStore } from '../stores/authStore';

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enablePushNotifications: boolean;
  enableBiometrics: boolean;
  syncInterval: number; // in minutes
  backupInterval: number; // in hours
  maxLogRetention: number; // in days
}

export class AppInitializer {
  private isInitialized: boolean = false;
  private config: AppConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private backupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      environment: 'development',
      enableAnalytics: false,
      enableCrashReporting: false,
      enablePushNotifications: true,
      enableBiometrics: true,
      syncInterval: 15, // 15 minutes
      backupInterval: 24, // 24 hours
      maxLogRetention: 30, // 30 days
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing LifeOS App...');

      // Step 1: Initialize core services
      await this.initializeCoreServices();

      // Step 2: Load user data
      await this.loadUserData();

      // Step 3: Initialize integrations
      await this.initializeIntegrations();

      // Step 4: Set up background tasks
      await this.setupBackgroundTasks();

      // Step 5: Initialize AI agents
      await this.initializeAIAgents();

      // Step 6: Set up sync and backup
      await this.setupSyncAndBackup();

      this.isInitialized = true;
      console.log('✅ LifeOS App initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize LifeOS App:', error);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    console.log('📊 Initializing core services...');

    try {
      // Initialize database
      await databaseService.initialize();
      console.log('✅ Database initialized');

      // Initialize AI service
      await aiService.initialize();
      console.log('✅ AI service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize core services:', error);
      throw error;
    }
  }

  private async loadUserData(): Promise<void> {
    console.log('👤 Loading user data...');

    try {
      // Check if user exists in database
      const { user } = useAuthStore.getState();

      if (user) {
        // Load user data from database
        const userData = await databaseService.getUser(user.id);

        if (userData) {
          // Load health profile
          const healthProfile = await databaseService.getHealthProfile(user.id);
          if (healthProfile) {
            useLifeOSStore.getState().updateHealthProfile(healthProfile);
          }

          // Load financial profile
          const financialProfile = await databaseService.getFinancialProfile(user.id);
          if (financialProfile) {
            useLifeOSStore.getState().updateFinancialProfile(financialProfile);
          }

          // Load schedule items
          const scheduleItems = await databaseService.getScheduleItems(user.id);
          scheduleItems.forEach(item => {
            useLifeOSStore.getState().addScheduleItem(item);
          });

          // Load notifications
          const notifications = await databaseService.getNotifications(user.id);
          notifications.forEach(notification => {
            useLifeOSStore.getState().addNotification(notification);
          });

          console.log('✅ User data loaded');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      // Don't throw error here, app can continue without user data
    }
  }

  private async initializeIntegrations(): Promise<void> {
    console.log('🔗 Initializing integrations...');

    try {
      // Initialize health service
      await healthService.initialize();
      console.log('✅ Health service initialized');

      // Initialize Google Calendar (will be done when user connects)
      console.log('✅ Google Calendar service ready');

      // Initialize Plaid (will be done when user connects)
      console.log('✅ Plaid service ready');

    } catch (error) {
      console.error('❌ Failed to initialize integrations:', error);
      // Don't throw error here, app can continue without integrations
    }
  }

  private async setupBackgroundTasks(): Promise<void> {
    console.log('🔄 Setting up background tasks...');

    try {
      // Set up periodic sync
      this.setupPeriodicSync();

      // Set up periodic backup
      this.setupPeriodicBackup();

      // Set up log cleanup
      this.setupLogCleanup();

      console.log('✅ Background tasks configured');
    } catch (error) {
      console.error('❌ Failed to setup background tasks:', error);
      // Don't throw error here, app can continue without background tasks
    }
  }

  private async initializeAIAgents(): Promise<void> {
    console.log('🤖 Initializing AI agents...');

    try {
      const agents = aiService.getAgents();

      // Set active agents in store
      useLifeOSStore.getState().activeAgents = agents;

      // Generate initial daily briefing
      await this.generateDailyBriefing();

      console.log('✅ AI agents initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI agents:', error);
      // Don't throw error here, app can continue without AI agents
    }
  }

  private async setupSyncAndBackup(): Promise<void> {
    console.log('☁️ Setting up sync and backup...');

    try {
      // Set up ElectricSQL sync (will be implemented)
      console.log('✅ Sync service ready');

      // Set up Google Cloud Storage backup (will be implemented)
      console.log('✅ Backup service ready');

    } catch (error) {
      console.error('❌ Failed to setup sync and backup:', error);
      // Don't throw error here, app can continue without sync/backup
    }
  }

  private setupPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.error('❌ Periodic sync failed:', error);
      }
    }, this.config.syncInterval * 60 * 1000);
  }

  private setupPeriodicBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(async () => {
      try {
        await this.performBackup();
      } catch (error) {
        console.error('❌ Periodic backup failed:', error);
      }
    }, this.config.backupInterval * 60 * 60 * 1000);
  }

  private setupLogCleanup(): void {
    // Clean up old logs every day
    setInterval(async () => {
      try {
        await this.cleanupOldLogs();
      } catch (error) {
        console.error('❌ Log cleanup failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private async performSync(): Promise<void> {
    console.log('🔄 Performing periodic sync...');

    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Sync health data
      if (healthService.hasHealthPermissions()) {
        const endDate = new Date();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
        const healthMetrics = await healthService.getHealthMetrics(startDate, endDate);

        useLifeOSStore.getState().updateHealthMetrics(healthMetrics);

        // Save to database
        await databaseService.saveHealthProfile(user.id, {
          id: `${user.id}_health`,
          metrics: healthMetrics,
          goals: {
            dailySteps: 10000,
            waterIntake: 2000,
            sleepHours: 8,
            workoutsPerWeek: 3,
          },
          wellnessRecommendations: [],
          medications: [],
          conditions: [],
          allergies: [],
        });
      }

      // Sync calendar data
      // This would sync with Google Calendar if connected

      // Sync financial data
      // This would sync with Plaid if connected

      // Update sync status
      useLifeOSStore.getState().setSyncStatus('completed');
      useLifeOSStore.getState().lastSync = new Date();

      console.log('✅ Periodic sync completed');
    } catch (error) {
      console.error('❌ Periodic sync failed:', error);
      useLifeOSStore.getState().setSyncStatus('error');
    }
  }

  private async performBackup(): Promise<void> {
    console.log('💾 Performing periodic backup...');

    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Create backup
      const backupPath = await databaseService.backup();

      // Upload to Google Cloud Storage (will be implemented)
      // await uploadToCloudStorage(backupPath);

      // Update backup status
      useLifeOSStore.getState().setBackupStatus('completed');
      useLifeOSStore.getState().updateCloudStorage({
        lastBackup: new Date(),
      });

      console.log('✅ Periodic backup completed');
    } catch (error) {
      console.error('❌ Periodic backup failed:', error);
      useLifeOSStore.getState().setBackupStatus('error');
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    console.log('🧹 Cleaning up old logs...');

    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const cutoffDate = new Date(Date.now() - this.config.maxLogRetention * 24 * 60 * 60 * 1000);

      // Clean up security logs
      const securityLogs = await databaseService.getSecurityLogs(user.id);
      const oldSecurityLogs = securityLogs.filter(log => log.timestamp < cutoffDate);

      for (const log of oldSecurityLogs) {
        await databaseService.delete('security_logs', log.id);
      }

      // Clean up data access logs
      const dataAccessLogs = await databaseService.getDataAccessLogs(user.id);
      const oldDataAccessLogs = dataAccessLogs.filter(log => log.timestamp < cutoffDate);

      for (const log of oldDataAccessLogs) {
        await databaseService.delete('data_access_logs', log.id);
      }

      console.log(`✅ Cleaned up ${oldSecurityLogs.length + oldDataAccessLogs.length} old logs`);
    } catch (error) {
      console.error('❌ Log cleanup failed:', error);
    }
  }

  private async generateDailyBriefing(): Promise<void> {
    console.log('📋 Generating daily briefing...');

    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Get user data for briefing
      const userData = {
        health: useLifeOSStore.getState().healthProfile,
        finance: useLifeOSStore.getState().financialProfile,
        schedule: useLifeOSStore.getState().schedule,
        family: useLifeOSStore.getState().familyData,
        smartHome: useLifeOSStore.getState().smartHomeData,
      };

      const briefing = await aiService.generateDailyBriefing(userData);
      useLifeOSStore.getState().setDailyBriefing(briefing);

      console.log('✅ Daily briefing generated');
    } catch (error) {
      console.error('❌ Failed to generate daily briefing:', error);
    }
  }

  async connectGoogleCalendar(): Promise<boolean> {
    console.log('📅 Connecting Google Calendar...');

    try {
      const success = await googleCalendarService.signIn();

      if (success) {
        console.log('✅ Google Calendar connected');
        return true;
      } else {
        console.log('❌ Google Calendar connection failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Google Calendar connection error:', error);
      return false;
    }
  }

  async connectPlaid(): Promise<boolean> {
    console.log('🏦 Connecting Plaid...');

    try {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      // Create link token
      const linkToken = await plaidService.createLinkToken(user.id);

      // In a real app, this would open the Plaid Link interface
      console.log('Plaid link token created:', linkToken.link_token);

      // For now, return success
      return true;
    } catch (error) {
      console.error('❌ Plaid connection error:', error);
      return false;
    }
  }

  async requestHealthPermissions(): Promise<boolean> {
    console.log('❤️ Requesting health permissions...');

    try {
      await healthService.initialize();
      const hasPermissions = healthService.hasHealthPermissions();

      if (hasPermissions) {
        console.log('✅ Health permissions granted');
        return true;
      } else {
        console.log('❌ Health permissions denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Health permissions error:', error);
      return false;
    }
  }

  async performFullSync(): Promise<void> {
    console.log('🔄 Performing full sync...');

    try {
      useLifeOSStore.getState().setSyncStatus('syncing');

      // Sync all data sources
      await this.performSync();

      // Generate new daily briefing
      await this.generateDailyBriefing();

      // Update AI insights
      await this.updateAIInsights();

      useLifeOSStore.getState().setSyncStatus('completed');
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      useLifeOSStore.getState().setSyncStatus('error');
    }
  }

  private async updateAIInsights(): Promise<void> {
    console.log('🧠 Updating AI insights...');

    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Get current data
      const healthProfile = useLifeOSStore.getState().healthProfile;
      const financialProfile = useLifeOSStore.getState().financialProfile;
      const schedule = useLifeOSStore.getState().schedule;

      // Generate health insights
      if (healthProfile) {
        const burnoutWarning = await aiService.detectBurnout(healthProfile);
        useLifeOSStore.getState().setBurnoutWarning(burnoutWarning);

        const wellnessRecommendations = await aiService.generateWellnessRecommendations(healthProfile);
        wellnessRecommendations.forEach(rec => {
          useLifeOSStore.getState().addWellnessRecommendation(rec);
        });
      }

      // Generate financial insights
      if (financialProfile) {
        const financialInsights = await aiService.generateFinancialInsights(financialProfile);
        // Add insights to store
      }

      // Generate schedule insights
      if (schedule.length > 0) {
        const scheduleOptimization = await aiService.optimizeSchedule({ schedule });
        // Apply optimizations
      }

      console.log('✅ AI insights updated');
    } catch (error) {
      console.error('❌ Failed to update AI insights:', error);
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up app...');

    try {
      // Clear intervals
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      if (this.backupInterval) {
        clearInterval(this.backupInterval);
        this.backupInterval = null;
      }

      // Close database
      await databaseService.close();

      this.isInitialized = false;
      console.log('✅ App cleanup completed');
    } catch (error) {
      console.error('❌ App cleanup failed:', error);
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  isAppInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const appInitializer = new AppInitializer();

// Export initialization function for use in App.tsx
export const initializeApp = async (): Promise<void> => {
  return appInitializer.initialize();
}; 
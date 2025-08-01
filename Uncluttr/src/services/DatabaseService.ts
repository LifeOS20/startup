import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// Enable debugging in development
SQLite.DEBUG(true);
SQLite.enablePromise(true);

export interface DatabaseConfig {
  name: string;
  location: string;
  encryptionKey: string;
}

// User interface for authentication
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  preferences: any;
  isOnboarded: boolean;
  createdAt: number;
  lastActive: number;
}

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export class DatabaseService {
  private database: any = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Use react-native-sqlite-storage instead of sqlite-2
      if (!this.database) {
        this.database = await new Promise((resolve, reject) => {
          SQLite.openDatabase(
            {
              name: this.config.name,
              location: 'default',
            },
            (db: any) => {
              console.log('✅ Database opened successfully');
              resolve(db);
            },
            (error: any) => {
              console.error('❌ Database open failed:', error);
              reject(error);
            }
          );
        });
      }

      // Verify database is properly initialized before proceeding
      if (!this.database) {
        throw new Error('Failed to initialize database object');
      }

      // Create tables
      await this.createTables();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        preferences TEXT NOT NULL,
        is_onboarded INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_active INTEGER NOT NULL
      )`,

      // User sessions table for authentication
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Health profiles table
      `CREATE TABLE IF NOT EXISTS health_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        metrics TEXT NOT NULL,
        goals TEXT NOT NULL,
        wellness_recommendations TEXT,
        burnout_warning TEXT,
        medications TEXT,
        conditions TEXT,
        allergies TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Financial profiles table
      `CREATE TABLE IF NOT EXISTS financial_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        data TEXT NOT NULL,
        goals TEXT NOT NULL,
        insights TEXT,
        budget TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Schedule items table
      `CREATE TABLE IF NOT EXISTS schedule_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        location TEXT,
        attendees TEXT,
        reminders TEXT,
        ai_optimized INTEGER NOT NULL,
        energy_level TEXT NOT NULL,
        tags TEXT,
        recurring TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Smart home devices table
      `CREATE TABLE IF NOT EXISTS smart_home_devices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        room TEXT NOT NULL,
        status TEXT NOT NULL,
        state TEXT NOT NULL,
        capabilities TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Automation rules table
      `CREATE TABLE IF NOT EXISTS automation_rules (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        trigger TEXT NOT NULL,
        actions TEXT NOT NULL,
        enabled INTEGER NOT NULL,
        last_triggered INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Family members table
      `CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        avatar TEXT,
        contact TEXT NOT NULL,
        health TEXT NOT NULL,
        preferences TEXT NOT NULL,
        location TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Family events table
      `CREATE TABLE IF NOT EXISTS family_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date INTEGER NOT NULL,
        type TEXT NOT NULL,
        attendees TEXT NOT NULL,
        location TEXT,
        reminders TEXT,
        gifts TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // AI insights table
      `CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL,
        action TEXT,
        actionable INTEGER NOT NULL,
        impact TEXT NOT NULL,
        insights TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        confidence REAL NOT NULL,
        next_actions TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // AI decisions table
      `CREATE TABLE IF NOT EXISTS ai_decisions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        confidence REAL NOT NULL,
        rationale TEXT NOT NULL,
        options TEXT NOT NULL,
        selected_option TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        executed INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        category TEXT NOT NULL,
        read INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        action_url TEXT,
        data TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Security logs table
      `CREATE TABLE IF NOT EXISTS security_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        user_agent TEXT NOT NULL,
        details TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Data access logs table
      `CREATE TABLE IF NOT EXISTS data_access_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        agent TEXT NOT NULL,
        data_type TEXT NOT NULL,
        access_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        purpose TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Sync status table
      `CREATE TABLE IF NOT EXISTS sync_status (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        last_sync INTEGER,
        sync_status TEXT NOT NULL,
        backup_status TEXT NOT NULL,
        cloud_storage_used INTEGER NOT NULL,
        cloud_storage_total INTEGER NOT NULL,
        last_backup INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
    ];

    for (const table of tables) {
      await this.database!.executeSql(table);
    }
  }

  // Generic CRUD operations
  async insert(table: string, data: Record<string, any>): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    await this.database.executeSql(query, values);
  }

  async update(table: string, id: string, data: Record<string, any>): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    await this.database.executeSql(query, values);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `DELETE FROM ${table} WHERE id = ?`;

    await this.database.executeSql(query, [id]);
  }

  async findById(table: string, id: string): Promise<any> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const [results] = await this.database.executeSql(query, [id]);

    return results.rows.item(0) || null;
  }

  async findByUserId(table: string, userId: string): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`;
    const [results] = await this.database.executeSql(query, [userId]);

    const items: any[] = [];
    if (results.rows && typeof results.rows.item === 'function') {
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
    } else {
      throw new Error('Database results.rows.item is not a function or rows is undefined');
    }

    return items;
  }

  async findAll(table: string): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${table} ORDER BY created_at DESC`;
    const [results] = await this.database.executeSql(query);

    const items: any[] = [];
    if (results.rows && typeof results.rows.item === 'function') {
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
    } else {
      throw new Error('Database results.rows.item is not a function or rows is undefined');
    }

    return items;
  }

  // Specific operations for LifeOS data
  async saveUser(user: any): Promise<void> {
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      preferences: JSON.stringify(user.preferences),
      created_at: user.createdAt.getTime(),
      last_active: user.lastActive.getTime(),
    };

    await this.insert('users', userData);
  }

  async getUser(userId: string): Promise<any> {
    const user = await this.findById('users', userId);
    if (user) {
      return {
        ...user,
        preferences: JSON.parse(user.preferences),
        createdAt: new Date(user.created_at),
        lastActive: new Date(user.last_active),
      };
    }
    return null;
  }

  async saveHealthProfile(userId: string, profile: any): Promise<void> {
    const profileData = {
      id: profile.id || `${userId}_health`,
      user_id: userId,
      metrics: JSON.stringify(profile.metrics),
      goals: JSON.stringify(profile.goals),
      wellness_recommendations: JSON.stringify(profile.wellnessRecommendations),
      burnout_warning: profile.burnoutWarning ? JSON.stringify(profile.burnoutWarning) : null,
      medications: JSON.stringify(profile.medications),
      conditions: JSON.stringify(profile.conditions),
      allergies: JSON.stringify(profile.allergies),
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    await this.insert('health_profiles', profileData);
  }

  async getHealthProfile(userId: string): Promise<any> {
    const profile = await this.findByUserId('health_profiles', userId);
    if (profile.length > 0) {
      const data = profile[0];
      return {
        id: data.id,
        metrics: JSON.parse(data.metrics),
        goals: JSON.parse(data.goals),
        wellnessRecommendations: JSON.parse(data.wellness_recommendations),
        burnoutWarning: data.burnout_warning ? JSON.parse(data.burnout_warning) : undefined,
        medications: JSON.parse(data.medications),
        conditions: JSON.parse(data.conditions),
        allergies: JSON.parse(data.allergies),
      };
    }
    return null;
  }

  async saveFinancialProfile(userId: string, profile: any): Promise<void> {
    const profileData = {
      id: profile.id || `${userId}_finance`,
      user_id: userId,
      data: JSON.stringify(profile.data),
      goals: JSON.stringify(profile.goals),
      insights: JSON.stringify(profile.insights),
      budget: JSON.stringify(profile.budget),
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    await this.insert('financial_profiles', profileData);
  }

  async getFinancialProfile(userId: string): Promise<any> {
    const profile = await this.findByUserId('financial_profiles', userId);
    if (profile.length > 0) {
      const data = profile[0];
      return {
        id: data.id,
        data: JSON.parse(data.data),
        goals: JSON.parse(data.goals),
        insights: JSON.parse(data.insights),
        budget: JSON.parse(data.budget),
      };
    }
    return null;
  }

  async saveScheduleItem(userId: string, item: any): Promise<void> {
    const itemData = {
      id: item.id,
      user_id: userId,
      title: item.title,
      description: item.description || null,
      start_time: item.startTime.getTime(),
      end_time: item.endTime.getTime(),
      type: item.type,
      priority: item.priority,
      status: item.status,
      location: item.location || null,
      attendees: item.attendees ? JSON.stringify(item.attendees) : null,
      reminders: JSON.stringify(item.reminders),
      ai_optimized: item.aiOptimized ? 1 : 0,
      energy_level: item.energyLevel,
      tags: JSON.stringify(item.tags),
      recurring: item.recurring ? JSON.stringify(item.recurring) : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    await this.insert('schedule_items', itemData);
  }

  async getScheduleItems(userId: string): Promise<any[]> {
    const items = await this.findByUserId('schedule_items', userId);
    return items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startTime: new Date(item.start_time),
      endTime: new Date(item.end_time),
      type: item.type,
      priority: item.priority,
      status: item.status,
      location: item.location,
      attendees: item.attendees ? JSON.parse(item.attendees) : [],
      reminders: JSON.parse(item.reminders),
      aiOptimized: Boolean(item.ai_optimized),
      energyLevel: item.energy_level,
      tags: JSON.parse(item.tags),
      recurring: item.recurring ? JSON.parse(item.recurring) : undefined,
    }));
  }

  async saveNotification(userId: string, notification: any): Promise<void> {
    const notificationData = {
      id: notification.id,
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      read: notification.read ? 1 : 0,
      timestamp: notification.timestamp.getTime(),
      action_url: notification.actionUrl || null,
      data: notification.data ? JSON.stringify(notification.data) : null,
    };

    await this.insert('notifications', notificationData);
  }

  async getNotifications(userId: string): Promise<any[]> {
    const notifications = await this.findByUserId('notifications', userId);
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      read: Boolean(notification.read),
      timestamp: new Date(notification.timestamp),
      actionUrl: notification.action_url,
      data: notification.data ? JSON.parse(notification.data) : undefined,
    }));
  }

  async addSecurityLog(userId: string, log: any): Promise<void> {
    const logData = {
      id: log.id || `${Date.now()}_${Math.random()}`,
      user_id: userId,
      action: log.action,
      timestamp: log.timestamp.getTime(),
      user_agent: log.userAgent || 'LifeOS App',
      details: JSON.stringify(log.details),
    };

    await this.insert('security_logs', logData);
  }

  async getSecurityLogs(userId: string): Promise<any[]> {
    const logs = await this.findByUserId('security_logs', userId);
    return logs.map(log => ({
      id: log.id,
      action: log.action,
      timestamp: new Date(log.timestamp),
      userAgent: log.user_agent,
      details: JSON.parse(log.details),
    }));
  }

  async addDataAccessLog(userId: string, log: any): Promise<void> {
    const logData = {
      id: log.id || `${Date.now()}_${Math.random()}`,
      user_id: userId,
      agent: log.agent,
      data_type: log.dataType,
      access_type: log.accessType,
      timestamp: log.timestamp.getTime(),
      purpose: log.purpose,
    };

    await this.insert('data_access_logs', logData);
  }

  async getDataAccessLogs(userId: string): Promise<any[]> {
    const logs = await this.findByUserId('data_access_logs', userId);
    return logs.map(log => ({
      id: log.id,
      agent: log.agent,
      dataType: log.data_type,
      accessType: log.access_type,
      timestamp: new Date(log.timestamp),
      purpose: log.purpose,
    }));
  }

  // ===== AUTHENTICATION METHODS =====

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password + 'lifeos_salt').toString();
  }

  private generateToken(): string {
    // Use react-native-get-random-values instead of Node.js crypto
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Ensure database is initialized
      if (!this.database) {
        await this.initialize();
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      const hashedPassword = this.hashPassword(password);
      const userId = Date.now().toString();
      const now = Date.now();

      const userData = {
        id: userId,
        name,
        email,
        password_hash: hashedPassword,
        avatar: null,
        preferences: JSON.stringify({}),
        is_onboarded: 0,
        created_at: now,
        last_active: now,
      };

      await this.insert('users', userData);

      // Create user session
      const token = this.generateToken();
      const sessionData = {
        id: `session_${Date.now()}`,
        user_id: userId,
        token,
        expires_at: now + (30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: now,
      };

      await this.insert('user_sessions', sessionData);

      const user: User = {
        id: parseInt(userId),
        name,
        email,
        preferences: {},
        isOnboarded: false,
        createdAt: now,
        lastActive: now,
      };

      // Store auth state
      await this.storeAuthState({
        isAuthenticated: true,
        user,
        token,
      });

      console.log('✅ User registered successfully:', email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  async signInUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Ensure database is initialized
      if (!this.database) {
        await this.initialize();
      }

      const userData = await this.getUserByEmail(email);
      if (!userData) {
        return { success: false, error: 'User not found' };
      }

      const hashedPassword = this.hashPassword(password);
      if (userData.password_hash !== hashedPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Create new session
      const token = this.generateToken();
      const now = Date.now();
      const sessionData = {
        id: `session_${now}`,
        user_id: userData.id,
        token,
        expires_at: now + (30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: now,
      };

      await this.insert('user_sessions', sessionData);

      // Update last active
      await this.update('users', userData.id, { last_active: now });

      const user: User = {
        id: parseInt(userData.id),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        preferences: JSON.parse(userData.preferences || '{}'),
        isOnboarded: userData.is_onboarded === 1,
        createdAt: userData.created_at,
        lastActive: now,
      };

      // Store auth state
      await this.storeAuthState({
        isAuthenticated: true,
        user,
        token,
      });

      console.log('✅ User signed in successfully:', email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      return { success: false, error: 'Failed to sign in. Please try again.' };
    }
  }

  async signOut(): Promise<void> {
    try {
      const authState = await this.getStoredAuthState();
      if (authState?.token) {
        // Invalidate session in database
        await this.database?.executeSql(
          'DELETE FROM user_sessions WHERE token = ?',
          [authState.token]
        );
      }

      // Clear stored auth state
      await AsyncStorage.multiRemove(['auth_state', 'user_token', 'user_data']);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  }

  async logout(): Promise<void> {
    return this.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const authState = await this.getStoredAuthState();
      if (!authState?.isAuthenticated || !authState.token) {
        return null;
      }

      // Validate session
      const isValidSession = await this.validateSession(authState.token);
      if (!isValidSession) {
        await this.signOut(); // Clear invalid session
        return null;
      }

      return authState.user;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  async completeOnboarding(userId: number): Promise<void> {
    try {
      await this.update('users', userId.toString(), { is_onboarded: 1 });

      // Update stored auth state
      const authState = await this.getStoredAuthState();
      if (authState?.user) {
        authState.user.isOnboarded = true;
        await this.storeAuthState(authState);
      }

      console.log('✅ Onboarding completed for user:', userId);
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      throw error;
    }
  }

  async hasCompletedOnboarding(userId: number): Promise<boolean> {
    try {
      const user = await this.findById('users', userId.toString());
      return user ? user.is_onboarded === 1 : false;
    } catch (error) {
      console.error('❌ Failed to check onboarding status:', error);
      return false;
    }
  }

  private async getUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await this.database?.executeSql(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );

      if (result && result[0].rows.length > 0) {
        return result[0].rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get user by email:', error);
      return null;
    }
  }

  private async validateSession(token: string): Promise<boolean> {
    try {
      const result = await this.database?.executeSql(
        'SELECT * FROM user_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
        [token, Date.now()]
      );

      return result && result[0].rows.length > 0;
    } catch (error) {
      console.error('❌ Failed to validate session:', error);
      return false;
    }
  }

  private async storeAuthState(authState: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_state', JSON.stringify(authState));
      await AsyncStorage.setItem('user_token', authState.token || '');
      await AsyncStorage.setItem('user_data', JSON.stringify(authState.user));
    } catch (error) {
      console.error('❌ Failed to store auth state:', error);
    }
  }

  private async getStoredAuthState(): Promise<AuthState | null> {
    try {
      const authStateString = await AsyncStorage.getItem('auth_state');
      if (authStateString) {
        return JSON.parse(authStateString);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get stored auth state:', error);
      return null;
    }
  }

  // ===== END AUTHENTICATION METHODS =====

  async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }

  async backup(): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    // Create a backup of the database
    const backupPath = `${this.config.location}/lifeos_backup_${Date.now()}.db`;

    // This would be implemented with actual backup logic
    // For now, return the backup path
    return backupPath;
  }

  async restore(backupPath: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    // Close current database
    await this.close();

    // Restore from backup
    // This would be implemented with actual restore logic
    await this.initialize();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService({
  name: 'lifeos.db',
  location: Platform.OS === 'ios' ? 'Library' : 'default',
  encryptionKey: 'your-secure-encryption-key-here', // This should be stored securely
});
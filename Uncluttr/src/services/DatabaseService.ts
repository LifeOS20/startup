import SQLite from 'react-native-sqlite-2';
import { Platform } from 'react-native';

// Enable debugging in development

export interface DatabaseConfig {
  name: string;
  location: string;
  encryptionKey: string;
}

export class DatabaseService {
  private database: any = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      const databaseOptions = {
        name: this.config.name,
        location: this.config.location,
        createFromLocation: '~lifeos.db',
      };

      this.database = await SQLite.openDatabase(this.config.name);

      // Set encryption key
      await this.database.executeSql(
        `PRAGMA key = '${this.config.encryptionKey}'`
      );

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
        avatar TEXT,
        preferences TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_active INTEGER NOT NULL
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
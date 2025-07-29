import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    privacyLevel: 'high' | 'medium' | 'low';
  };
  createdAt: Date;
  lastActive: Date;
}

export interface HealthMetrics {
  hydration: {
    waterIntake: number;
    target: number;
    caffeinatedDrinks: number;
  };
  activity: {
    steps: number;
    calories: number;
    activeMinutes: number;
    workouts: number;
  };
  sleep: {
    hours: number;
    quality: string;
    deepSleep: number;
    remSleep: number;
  };
  heartRate: {
    current: number;
    resting: number;
    max: number;
  };
  mood: {
    current: string;
    energy: number;
    stress: number;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface HealthProfile {
  metrics: HealthMetrics;
  goals: {
    dailySteps: number;
    waterIntake: number;
    sleepHours: number;
    workoutsPerWeek: number;
  };
  wellnessRecommendations: string[];
  burnoutWarning?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestedActions: string[];
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string;
  }>;
  conditions: string[];
  allergies: string[];
}

export interface FinancialData {
  income: {
    monthly: number;
    yearly: number;
    sources: Array<{
      name: string;
      amount: number;
      frequency: string;
    }>;
  };
  expenses: {
    monthly: number;
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
  };
  savings: {
    current: number;
    target: number;
    monthlyContribution: number;
  };
  investments: {
    total: number;
    breakdown: Array<{
      type: string;
      amount: number;
      percentage: number;
    }>;
  };
  debts: Array<{
    name: string;
    amount: number;
    interestRate: number;
    monthlyPayment: number;
  }>;
  subscriptions: Array<{
    name: string;
    amount: number;
    frequency: string;
    category: string;
    nextBilling: Date;
  }>;
}

export interface FinancialProfile {
  data: FinancialData;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: Date;
    category: 'savings' | 'investment' | 'debt' | 'income';
  }>;
  insights: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
  }>;
  budget: {
    monthly: number;
    categories: Array<{
      name: string;
      limit: number;
      spent: number;
    }>;
  };
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'work' | 'personal' | 'health' | 'finance' | 'family' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: string;
  attendees?: string[];
  reminders: Array<{
    time: Date;
    type: 'notification' | 'email' | 'sms';
  }>;
  aiOptimized: boolean;
  energyLevel: 'low' | 'medium' | 'high';
  tags: string[];
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
}

export interface SmartHomeDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'camera' | 'lock' | 'sensor' | 'switch' | 'speaker' | 'appliance';
  room: string;
  status: 'online' | 'offline' | 'error';
  state: {
    power: boolean;
    brightness?: number;
    temperature?: number;
    humidity?: number;
    motion?: boolean;
    locked?: boolean;
  };
  capabilities: string[];
  lastUpdated: Date;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'motion' | 'temperature' | 'presence' | 'schedule';
    conditions: Array<{
      device: string;
      property: string;
      operator: 'equals' | 'greater' | 'less' | 'contains';
      value: any;
    }>;
  };
  actions: Array<{
    device: string;
    action: string;
    parameters: Record<string, any>;
  }>;
  enabled: boolean;
  lastTriggered?: Date;
}

export interface SmartHomeData {
  devices: SmartHomeDevice[];
  rooms: Array<{
    id: string;
    name: string;
    devices: string[];
  }>;
  automations: AutomationRule[];
  energyUsage: {
    current: number;
    daily: number;
    monthly: number;
    devices: Array<{
      device: string;
      usage: number;
    }>;
  };
  security: {
    armed: boolean;
    mode: 'home' | 'away' | 'night' | 'off';
    cameras: Array<{
      id: string;
      name: string;
      recording: boolean;
      motion: boolean;
    }>;
    events: Array<{
      id: string;
      type: string;
      device: string;
      timestamp: Date;
      description: string;
    }>;
  };
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  contact: {
    phone: string;
    email: string;
    emergency: boolean;
  };
  health: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
  preferences: {
    communication: 'call' | 'text' | 'email' | 'in-person';
    privacy: 'high' | 'medium' | 'low';
    notifications: boolean;
  };
  schedule: ScheduleItem[];
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
}

export interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'holiday' | 'gathering' | 'other';
  attendees: string[];
  location?: string;
  reminders: Date[];
  gifts?: Array<{
    for: string;
    item: string;
    purchased: boolean;
    price?: number;
  }>;
}

export interface FamilyData {
  members: FamilyMember[];
  events: FamilyEvent[];
  sharedCalendar: ScheduleItem[];
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
    date: Date;
    category: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    assignedTo: string;
    dueDate: Date;
    completed: boolean;
    category: string;
  }>;
  communication: Array<{
    id: string;
    from: string;
    to: string;
    type: 'message' | 'call' | 'video';
    timestamp: Date;
    content?: string;
    duration?: number;
  }>;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  lastAction?: string;
  lastActionTime?: Date;
  capabilities: string[];
  performance: {
    accuracy: number;
    responseTime: number;
    userSatisfaction: number;
  };
}

export interface AIAnalysis {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  actionable: boolean;
  impact: string;
  insights: string[];
  recommendations: string[];
  riskLevel: string;
  confidence: number;
  nextActions: string[];
  timestamp: Date;
}

export interface AIDecision {
  id: string;
  decision: string;
  confidence: number;
  rationale: string;
  options: string[];
  selectedOption: string;
  timestamp: Date;
  executed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'health' | 'finance' | 'schedule' | 'family' | 'smart-home' | 'security' | 'ai';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface LifeOSState {
  // User and Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Navigation
  currentView: 'dashboard' | 'health' | 'finance' | 'schedule' | 'family' | 'smart-home' | 'security';
  sidebarOpen: boolean;
  
  // Core Data
  healthProfile: HealthProfile | null;
  financialProfile: FinancialProfile | null;
  schedule: ScheduleItem[];
  smartHomeData: SmartHomeData | null;
  familyData: FamilyData | null;
  
  // AI and Analytics
  dailyBriefing: string;
  aiInsights: AIAnalysis[];
  aiDecisions: AIDecision[];
  activeAgents: AIAgent[];
  notifications: Notification[];
  
  // Security and Privacy
  securityLogs: Array<{
    id: string;
    action: string;
    timestamp: Date;
    user: string;
    details: Record<string, any>;
  }>;
  dataAccessLogs: Array<{
    id: string;
    agent: string;
    dataType: string;
    accessType: 'read' | 'write' | 'delete';
    timestamp: Date;
    purpose: string;
  }>;
  
  // Sync and Backup
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'completed';
  backupStatus: 'idle' | 'backing-up' | 'error' | 'completed';
  cloudStorage: {
    used: number;
    total: number;
    lastBackup: Date | null;
  };
}

export interface LifeOSActions {
  // Authentication
  setUser: (user: User) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Navigation
  setCurrentView: (view: LifeOSState['currentView']) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Health
  updateHealthProfile: (profile: Partial<HealthProfile>) => void;
  updateHealthMetrics: (metrics: Partial<HealthMetrics>) => void;
  addWellnessRecommendation: (recommendation: string) => void;
  setBurnoutWarning: (warning: HealthProfile['burnoutWarning']) => void;
  
  // Finance
  updateFinancialProfile: (profile: Partial<FinancialProfile>) => void;
  addFinancialGoal: (goal: FinancialProfile['goals'][0]) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialProfile['goals'][0]>) => void;
  addFinancialInsight: (insight: FinancialProfile['insights'][0]) => void;
  
  // Schedule
  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  optimizeSchedule: () => Promise<void>;
  
  // Smart Home
  updateSmartHomeData: (data: Partial<SmartHomeData>) => void;
  updateSmartHomeDevice: (id: string, updates: Partial<SmartHomeDevice>) => void;
  addAutomationRule: (rule: AutomationRule) => void;
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) => void;
  
  // Family
  updateFamilyData: (data: Partial<FamilyData>) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  addFamilyEvent: (event: FamilyEvent) => void;
  
  // AI
  setDailyBriefing: (briefing: string) => void;
  addAIAnalysis: (analysis: AIAnalysis) => void;
  addAIDecision: (decision: AIDecision) => void;
  updateAIAgent: (id: string, updates: Partial<AIAgent>) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Security
  addSecurityLog: (log: Omit<LifeOSState['securityLogs'][0], 'id' | 'timestamp'>) => void;
  addDataAccessLog: (log: Omit<LifeOSState['dataAccessLogs'][0], 'id' | 'timestamp'>) => void;
  
  // Sync and Backup
  setSyncStatus: (status: LifeOSState['syncStatus']) => void;
  setBackupStatus: (status: LifeOSState['backupStatus']) => void;
  updateCloudStorage: (storage: Partial<LifeOSState['cloudStorage']>) => void;
  
  // Store Management
  initializeStore: () => Promise<void>;
  resetStore: () => void;
}

export const useLifeOSStore = create<LifeOSState & LifeOSActions>()(
  immer((set, get) => ({
    // Initial State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    currentView: 'dashboard',
    sidebarOpen: false,
    
    // Core Data
    healthProfile: null,
    financialProfile: null,
    schedule: [],
    smartHomeData: null,
    familyData: null,
    
    // AI and Analytics
    dailyBriefing: '',
    aiInsights: [],
    aiDecisions: [],
    activeAgents: [],
    notifications: [],
    
    // Security and Privacy
    securityLogs: [],
    dataAccessLogs: [],
    
    // Sync and Backup
    lastSync: null,
    syncStatus: 'idle',
    backupStatus: 'idle',
    cloudStorage: {
      used: 0,
      total: 1024 * 1024 * 1024, // 1GB
      lastBackup: null,
    },
    
    // Actions
    setUser: (user) => set((state) => { state.user = user; }),
    setAuthenticated: (authenticated) => set((state) => { state.isAuthenticated = authenticated; }),
    setLoading: (loading) => set((state) => { state.isLoading = loading; }),
    setError: (error) => set((state) => { state.error = error; }),
    
    setCurrentView: (view) => set((state) => { state.currentView = view; }),
    setSidebarOpen: (open) => set((state) => { state.sidebarOpen = open; }),
    
    updateHealthProfile: (profile) => set((state) => {
      if (state.healthProfile) {
        state.healthProfile = { ...state.healthProfile, ...profile };
      } else {
        state.healthProfile = profile as HealthProfile;
      }
    }),
    
    updateHealthMetrics: (metrics) => set((state) => {
      if (state.healthProfile?.metrics) {
        state.healthProfile.metrics = { ...state.healthProfile.metrics, ...metrics };
      }
    }),
    
    addWellnessRecommendation: (recommendation) => set((state) => {
      if (state.healthProfile) {
        state.healthProfile.wellnessRecommendations.push(recommendation);
      }
    }),
    
    setBurnoutWarning: (warning) => set((state) => {
      if (state.healthProfile) {
        state.healthProfile.burnoutWarning = warning;
      }
    }),
    
    updateFinancialProfile: (profile) => set((state) => {
      if (state.financialProfile) {
        state.financialProfile = { ...state.financialProfile, ...profile };
      } else {
        state.financialProfile = profile as FinancialProfile;
      }
    }),
    
    addFinancialGoal: (goal) => set((state) => {
      if (state.financialProfile) {
        state.financialProfile.goals.push(goal);
      }
    }),
    
    updateFinancialGoal: (id, updates) => set((state) => {
      if (state.financialProfile) {
        const goalIndex = state.financialProfile.goals.findIndex((g: FinancialProfile['goals'][0]) => g.id === id);
        if (goalIndex !== -1) {
          state.financialProfile.goals[goalIndex] = { ...state.financialProfile.goals[goalIndex], ...updates };
        }
      }
    }),
    
    addFinancialInsight: (insight) => set((state) => {
      if (state.financialProfile) {
        state.financialProfile.insights.push(insight);
      }
    }),
    
    addScheduleItem: (item) => set((state) => {
      state.schedule.push(item);
    }),
    
    updateScheduleItem: (id, updates) => set((state) => {
      const itemIndex = state.schedule.findIndex((item: ScheduleItem) => item.id === id);
      if (itemIndex !== -1) {
        state.schedule[itemIndex] = { ...state.schedule[itemIndex], ...updates };
      }
    }),
    
    deleteScheduleItem: (id) => set((state) => {
      const itemIndex = state.schedule.findIndex((item: ScheduleItem) => item.id === id);
      if (itemIndex !== -1) {
        state.schedule.splice(itemIndex, 1);
      }
    }),
    
    optimizeSchedule: async () => {
      // This will be implemented with AI service
      console.log('Optimizing schedule...');
    },
    
    updateSmartHomeData: (data) => set((state) => {
      if (state.smartHomeData) {
        state.smartHomeData = { ...state.smartHomeData, ...data };
      } else {
        state.smartHomeData = data as SmartHomeData;
      }
    }),
    
    updateSmartHomeDevice: (id, updates) => set((state) => {
      if (state.smartHomeData) {
        const deviceIndex = state.smartHomeData.devices.findIndex((d: SmartHomeDevice) => d.id === id);
        if (deviceIndex !== -1) {
          state.smartHomeData.devices[deviceIndex] = { ...state.smartHomeData.devices[deviceIndex], ...updates };
        }
      }
    }),
    
    addAutomationRule: (rule) => set((state) => {
      if (state.smartHomeData) {
        state.smartHomeData.automations.push(rule);
      }
    }),
    
    updateAutomationRule: (id, updates) => set((state) => {
      if (state.smartHomeData) {
        const ruleIndex = state.smartHomeData.automations.findIndex((r: AutomationRule) => r.id === id);
        if (ruleIndex !== -1) {
          state.smartHomeData.automations[ruleIndex] = { ...state.smartHomeData.automations[ruleIndex], ...updates };
        }
      }
    }),
    
    updateFamilyData: (data) => set((state) => {
      if (state.familyData) {
        state.familyData = { ...state.familyData, ...data };
      } else {
        state.familyData = data as FamilyData;
      }
    }),
    
    addFamilyMember: (member) => set((state) => {
      if (state.familyData) {
        state.familyData.members.push(member);
      }
    }),
    
    updateFamilyMember: (id, updates) => set((state) => {
      if (state.familyData) {
        const memberIndex = state.familyData.members.findIndex((m: FamilyMember) => m.id === id);
        if (memberIndex !== -1) {
          state.familyData.members[memberIndex] = { ...state.familyData.members[memberIndex], ...updates };
        }
      }
    }),
    
    addFamilyEvent: (event) => set((state) => {
      if (state.familyData) {
        state.familyData.events.push(event);
      }
    }),
    
    setDailyBriefing: (briefing) => set((state) => { state.dailyBriefing = briefing; }),
    
    addAIAnalysis: (analysis) => set((state) => {
      state.aiInsights.push(analysis);
    }),
    
    addAIDecision: (decision) => set((state) => {
      state.aiDecisions.push(decision);
    }),
    
    updateAIAgent: (id, updates) => set((state) => {
      const agentIndex = state.activeAgents.findIndex((a: AIAgent) => a.id === id);
      if (agentIndex !== -1) {
        state.activeAgents[agentIndex] = { ...state.activeAgents[agentIndex], ...updates };
      }
    }),
    
    addNotification: (notification) => set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      state.notifications.unshift(newNotification);
    }),
    
    markNotificationRead: (id) => set((state) => {
      const notification = state.notifications.find((n: Notification) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    }),
    
    clearNotifications: () => set((state) => {
      state.notifications = [];
    }),
    
    addSecurityLog: (log) => set((state) => {
      const newLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      state.securityLogs.unshift(newLog);
    }),
    
    addDataAccessLog: (log) => set((state) => {
      const newLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      state.dataAccessLogs.unshift(newLog);
    }),
    
    setSyncStatus: (status) => set((state) => { state.syncStatus = status; }),
    setBackupStatus: (status) => set((state) => { state.backupStatus = status; }),
    
    updateCloudStorage: (storage) => set((state) => {
      state.cloudStorage = { ...state.cloudStorage, ...storage };
    }),
    
    initializeStore: async () => {
      set((state) => { state.isLoading = true; });
      try {
        // Initialize with data from local storage/database
        // This will be implemented with the database service
        console.log('Initializing LifeOS store...');
      } catch (error) {
        console.error('Failed to initialize store:', error);
        set((state) => { state.error = 'Failed to initialize store'; });
      } finally {
        set((state) => { state.isLoading = false; });
      }
    },
    
    resetStore: () => set((state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.healthProfile = null;
      state.financialProfile = null;
      state.schedule = [];
      state.smartHomeData = null;
      state.familyData = null;
      state.dailyBriefing = '';
      state.aiInsights = [];
      state.aiDecisions = [];
      state.activeAgents = [];
      state.notifications = [];
      state.securityLogs = [];
      state.dataAccessLogs = [];
    }),
  }))
); 
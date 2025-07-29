import { Platform, NativeModules } from 'react-native';
import { AIAnalysis, AIDecision, AIAgent } from '../stores/lifeOSStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/ai';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour cache expiry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Model paths for local inference
const MODEL_PATHS = {
  whisper: Platform.OS === 'ios' ? 'whisper-base.mlmodel' : 'whisper-base.tflite',
  phi3: Platform.OS === 'ios' ? 'phi3-mini.mlmodel' : 'phi3-mini.tflite',
  embeddings: Platform.OS === 'ios' ? 'sentence-transformer.mlmodel' : 'sentence-transformer.tflite',
};

// Interface for native AI processing
interface NativeAIModule {
  initializeWhisper(): Promise<boolean>;
  transcribeAudio(audioPath: string): Promise<string>;
  initializePhi3(): Promise<boolean>;
  generateText(prompt: string, maxLength: number): Promise<string>;
  initializeTFLite(): Promise<boolean>;
  runInference(modelPath: string, input: any): Promise<any>;
  getDeviceCapabilities(): Promise<{
    hasNeuralEngine: boolean;
    hasGPU: boolean;
    memoryGB: number;
    processorType: string;
  }>;
}

// Production implementation of NativeAIModule
const NativeAI: NativeAIModule = {
  initializeWhisper: async () => {
    console.log('Initializing Whisper model...');
    try {
      // Check if model exists locally
      const modelPath = `${RNFS.DocumentDirectoryPath}/models/${MODEL_PATHS.whisper}`;
      const modelExists = await RNFS.exists(modelPath);

      if (!modelExists) {
        console.log('Downloading Whisper model...');
        // Download model from your CDN or model repository
        const downloadUrl = `${process.env.REACT_APP_MODEL_CDN_URL}/whisper/${MODEL_PATHS.whisper}`;
        await RNFS.downloadFile({
          fromUrl: downloadUrl,
          toFile: modelPath,
          progressDivider: 10,
          begin: (res) => console.log('Download started:', res.jobId),
          progress: (res) => console.log('Download progress:', (res.bytesWritten / res.contentLength * 100).toFixed(2) + '%'),
        }).promise;
      }

      // Initialize the model using native modules
      if (Platform.OS === 'ios') {
        // Use Core ML for iOS
        const { WhisperModule } = NativeModules;
        return await WhisperModule.initializeModel(modelPath);
      } else {
        // Use TensorFlow Lite for Android
        const { TFLiteModule } = NativeModules;
        return await TFLiteModule.initializeWhisper(modelPath);
      }
    } catch (error) {
      console.error('Failed to initialize Whisper:', error);
      return false;
    }
  },

  transcribeAudio: async (audioPath: string) => {
    console.log('Transcribing audio:', audioPath);
    try {
      // First try local inference if model is available
      if (Platform.OS === 'ios') {
        const { WhisperModule } = NativeModules;
        const result = await WhisperModule.transcribe(audioPath);
        if (result && result.text) {
          return result.text;
        }
      } else {
        const { TFLiteModule } = NativeModules;
        const result = await TFLiteModule.transcribeAudio(audioPath);
        if (result && result.text) {
          return result.text;
        }
      }

      // Fallback to backend API if local inference fails
      const formData = new FormData();
      formData.append('audio', {
        uri: audioPath,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);

      const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for audio processing
      });

      return response.data.transcription;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  },

  initializePhi3: async () => {
    console.log('Initializing Phi-3-mini model...');
    try {
      const modelPath = `${RNFS.DocumentDirectoryPath}/models/${MODEL_PATHS.phi3}`;
      const modelExists = await RNFS.exists(modelPath);

      if (!modelExists) {
        console.log('Downloading Phi-3 model...');
        const downloadUrl = `${process.env.REACT_APP_MODEL_CDN_URL}/phi3/${MODEL_PATHS.phi3}`;
        await RNFS.downloadFile({
          fromUrl: downloadUrl,
          toFile: modelPath,
          progressDivider: 10,
          begin: (res) => console.log('Phi-3 download started:', res.jobId),
          progress: (res) => console.log('Phi-3 download progress:', (res.bytesWritten / res.contentLength * 100).toFixed(2) + '%'),
        }).promise;
      }

      if (Platform.OS === 'ios') {
        const { Phi3Module } = NativeModules;
        return await Phi3Module.initializeModel(modelPath);
      } else {
        const { TFLiteModule } = NativeModules;
        return await TFLiteModule.initializePhi3(modelPath);
      }
    } catch (error) {
      console.error('Failed to initialize Phi-3:', error);
      return false;
    }
  },

  generateText: async (prompt: string, maxLength: number) => {
    console.log('Generating text with prompt:', prompt.substring(0, 100) + '...');
    try {
      // Try local inference first
      if (Platform.OS === 'ios') {
        const { Phi3Module } = NativeModules;
        const result = await Phi3Module.generateText(prompt, maxLength);
        if (result && result.text) {
          return result.text;
        }
      } else {
        const { TFLiteModule } = NativeModules;
        const result = await TFLiteModule.generateText(prompt, maxLength);
        if (result && result.text) {
          return result.text;
        }
      }

      // Fallback to backend API
      const response = await axios.post(`${API_BASE_URL}/generate-text`, {
        prompt,
        maxTokens: maxLength,
        temperature: 0.7,
        model: 'phi3-mini',
      }, {
        timeout: 60000, // 60 second timeout for text generation
      });

      return response.data.text;
    } catch (error) {
      console.error('Text generation failed:', error);
      throw error;
    }
  },

  initializeTFLite: async () => {
    console.log('Initializing TensorFlow Lite runtime...');
    try {
      if (Platform.OS === 'android') {
        const { TFLiteModule } = NativeModules;
        return await TFLiteModule.initialize();
      }
      // iOS uses Core ML, so TFLite initialization is not needed
      return true;
    } catch (error) {
      console.error('Failed to initialize TFLite:', error);
      return false;
    }
  },

  runInference: async (modelPath: string, input: any) => {
    console.log('Running inference on model:', modelPath);
    try {
      if (Platform.OS === 'ios') {
        const { CoreMLModule } = NativeModules;
        return await CoreMLModule.runInference(modelPath, input);
      } else {
        const { TFLiteModule } = NativeModules;
        return await TFLiteModule.runInference(modelPath, input);
      }
    } catch (error) {
      console.error('Local inference failed, trying backend:', error);
      // Fallback to backend API
      const response = await axios.post(`${API_BASE_URL}/inference`, {
        modelPath,
        input,
      });

      return response.data.result;
    }
  },

  getDeviceCapabilities: async () => {
    try {
      const deviceInfo = {
        hasNeuralEngine: false,
        hasGPU: false,
        memoryGB: 4,
        processorType: 'unknown',
      };

      if (Platform.OS === 'ios') {
        const systemVersion = await DeviceInfo.getSystemVersion();
        const deviceType = await DeviceInfo.getDeviceType();
        const model = await DeviceInfo.getModel();

        // Check for Neural Engine (A12 and later)
        const hasNeuralEngine = model.includes('iPhone') && (
          model.includes('11') || model.includes('12') ||
          model.includes('13') || model.includes('14') || model.includes('15')
        );

        deviceInfo.hasNeuralEngine = hasNeuralEngine;
        deviceInfo.hasGPU = true; // All modern iOS devices have GPU
        deviceInfo.processorType = hasNeuralEngine ? 'A12+' : 'A11-';

        // Estimate memory based on device type
        if (model.includes('Pro')) {
          deviceInfo.memoryGB = 6;
        } else if (model.includes('Plus') || model.includes('Max')) {
          deviceInfo.memoryGB = 4;
        } else {
          deviceInfo.memoryGB = 3;
        }
      } else {
        // Android device capabilities
        const totalMemory = await DeviceInfo.getTotalMemory();
        deviceInfo.memoryGB = Math.round(totalMemory / (1024 * 1024 * 1024));
        deviceInfo.hasGPU = true; // Assume modern Android devices have GPU
        deviceInfo.processorType = await DeviceInfo.getSystemName();
      }

      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device capabilities:', error);
      return {
        hasNeuralEngine: Platform.OS === 'ios',
        hasGPU: true,
        memoryGB: 4,
        processorType: Platform.OS === 'ios' ? 'A15' : 'Snapdragon 8',
      };
    }
  },
};

export interface AIAgentConfig {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  modelPath?: string;
  promptTemplate: string;
  maxTokens: number;
  temperature: number;
}

export interface AITask {
  id: string;
  type: 'analysis' | 'decision' | 'generation' | 'optimization';
  prompt: string;
  context: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  timestamp: Date;
}

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class AIService {
  private agents: Map<string, AIAgentConfig> = new Map();
  private isInitialized: boolean = false;
  private taskQueue: AITask[] = [];
  private isProcessing: boolean = false;
  private cache: Map<string, CacheItem<any>> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Health Agent
    this.agents.set('health', {
      id: 'health',
      name: 'Health Agent',
      role: 'Analyze health data and provide wellness recommendations',
      capabilities: ['mood_analysis', 'burnout_detection', 'wellness_recommendations'],
      promptTemplate: `You are a health and wellness AI agent. Analyze the following health data and provide insights:

Health Metrics: {healthMetrics}
Recent Activity: {recentActivity}
Sleep Data: {sleepData}
Mood Data: {moodData}

Provide:
1. Wellness recommendations
2. Burnout risk assessment
3. Suggested actions
4. Health insights

Be concise, actionable, and privacy-focused.`,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Finance Agent
    this.agents.set('finance', {
      id: 'finance',
      name: 'Finance Agent',
      role: 'Analyze financial data and provide insights',
      capabilities: ['expense_analysis', 'savings_optimization', 'investment_advice'],
      promptTemplate: `You are a financial AI agent. Analyze the following financial data and provide insights:

Income: {income}
Expenses: {expenses}
Savings: {savings}
Investments: {investments}
Goals: {goals}

Provide:
1. Financial insights
2. Savings recommendations
3. Budget optimization
4. Investment suggestions

Be practical, conservative, and focused on long-term financial health.`,
      maxTokens: 600,
      temperature: 0.6,
    });

    // Schedule Agent
    this.agents.set('schedule', {
      id: 'schedule',
      name: 'Schedule Agent',
      role: 'Optimize schedule and manage time',
      capabilities: ['schedule_optimization', 'conflict_resolution', 'productivity_analysis'],
      promptTemplate: `You are a schedule optimization AI agent. Analyze the following schedule and provide recommendations:

Current Schedule: {schedule}
Energy Levels: {energyLevels}
Priorities: {priorities}
Constraints: {constraints}

Provide:
1. Schedule optimization suggestions
2. Conflict resolution
3. Productivity improvements
4. Time management tips

Focus on work-life balance and energy optimization.`,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Smart Home Agent
    this.agents.set('smart_home', {
      id: 'smart_home',
      name: 'Smart Home Agent',
      role: 'Optimize smart home automation and energy usage',
      capabilities: ['automation_optimization', 'energy_analysis', 'security_monitoring'],
      promptTemplate: `You are a smart home AI agent. Analyze the following smart home data and provide recommendations:

Devices: {devices}
Automations: {automations}
Energy Usage: {energyUsage}
Security Status: {securityStatus}

Provide:
1. Automation improvements
2. Energy optimization
3. Security recommendations
4. Device management tips

Focus on efficiency, security, and user comfort.`,
      maxTokens: 400,
      temperature: 0.6,
    });

    // Family Agent
    this.agents.set('family', {
      id: 'family',
      name: 'Family Agent',
      role: 'Manage family relationships and events',
      capabilities: ['event_planning', 'relationship_management', 'gift_recommendations'],
      promptTemplate: `You are a family management AI agent. Analyze the following family data and provide recommendations:

Family Members: {familyMembers}
Upcoming Events: {upcomingEvents}
Relationships: {relationships}
Preferences: {preferences}

Provide:
1. Event planning suggestions
2. Relationship insights
3. Gift recommendations
4. Family activity ideas

Focus on strengthening relationships and creating meaningful experiences.`,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Security Agent
    this.agents.set('security', {
      id: 'security',
      name: 'Security Agent',
      role: 'Monitor security and privacy',
      capabilities: ['security_monitoring', 'privacy_analysis', 'threat_detection'],
      promptTemplate: `You are a security and privacy AI agent. Analyze the following security data and provide recommendations:

Security Logs: {securityLogs}
Access Patterns: {accessPatterns}
Privacy Settings: {privacySettings}
Potential Threats: {potentialThreats}

Provide:
1. Security insights
2. Privacy recommendations
3. Threat assessments
4. Protection measures

Focus on proactive protection and privacy preservation.`,
      maxTokens: 500,
      temperature: 0.6,
    });
  }

  // Cache management methods
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      // Try to get from memory cache first
      const cachedItem = this.cache.get(key);
      if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
        return cachedItem.data as T;
      }

      // Try to get from persistent storage
      const storedItem = await AsyncStorage.getItem(`ai_cache_${key}`);
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem) as CacheItem<T>;
        if (Date.now() - parsedItem.timestamp < CACHE_EXPIRY) {
          // Update memory cache
          this.cache.set(key, parsedItem);
          return parsedItem.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };

      // Update memory cache
      this.cache.set(key, cacheItem);

      // Update persistent storage
      await AsyncStorage.setItem(`ai_cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  // Retry mechanism for API calls
  private async withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing AI Service...');

      // Check device capabilities
      const capabilities = await NativeAI.getDeviceCapabilities();
      console.log('Device capabilities:', capabilities);

      // Initialize AI models
      await Promise.all([
        NativeAI.initializeWhisper(),
        NativeAI.initializePhi3(),
        NativeAI.initializeTFLite(),
      ]);

      this.isInitialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `transcribe_${audioPath}`;
    const cachedResult = await this.getFromCache<string>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await this.withRetry(() => NativeAI.transcribeAudio(audioPath));
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  }

  async generateDailyBriefing(userData: any): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    // Daily briefings shouldn't be cached as they're time-sensitive
    try {
      // Use the backend API directly for complex tasks
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/daily-briefing`, userData)
      );
      return response.data.briefing;
    } catch (error) {
      console.error('Daily briefing generation failed:', error);
      // Fallback to local generation if backend fails
      const prompt = `Generate a daily briefing for the user based on the following data:

Health: ${JSON.stringify(userData.health || {})}
Finance: ${JSON.stringify(userData.finance || {})}
Schedule: ${JSON.stringify(userData.schedule || {})}
Family: ${JSON.stringify(userData.family || {})}
Smart Home: ${JSON.stringify(userData.smartHome || {})}

Provide a concise, actionable daily briefing that includes:
1. Key insights from each life domain
2. Priority actions for the day
3. Important reminders
4. Wellness check-in

Keep it personal, motivating, and focused on the user's goals.`;

      return await NativeAI.generateText(prompt, 800);
    }
  }

  async detectBurnout(healthData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `burnout_${JSON.stringify(healthData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/burnout`, { healthData })
      );
      const result = response.data;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Burnout detection failed:', error);
      // Fallback to local processing
      const prompt = `Analyze the following health data for burnout indicators:

Sleep: ${JSON.stringify(healthData.sleep || {})}
Activity: ${JSON.stringify(healthData.activity || {})}
Mood: ${JSON.stringify(healthData.mood || {})}
Stress: ${JSON.stringify(healthData.stress || {})}

Assess burnout risk and provide:
1. Burnout level (low/medium/high/critical)
2. Warning message
3. Suggested actions
4. Confidence score

Format as JSON with keys: level, message, suggestedActions, confidence`;

      const response = await NativeAI.generateText(prompt, 400);
      try {
        const result = JSON.parse(response);
        await this.setCache(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('Failed to parse burnout response:', parseError);
        return {
          level: 'low',
          message: 'Unable to assess burnout risk at this time.',
          suggestedActions: ['Take a break', 'Practice self-care'],
          confidence: 0.5,
        };
      }
    }
  }

  async generateWellnessRecommendations(healthData: any): Promise<string[]> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `wellness_${JSON.stringify(healthData)}`;
    const cachedResult = await this.getFromCache<string[]>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/wellness`, { healthData })
      );
      const result = response.data;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Wellness recommendations generation failed:', error);
      // Fallback to local processing
      const prompt = `Based on the following health data, provide 3-5 personalized wellness recommendations:

Health Metrics: ${JSON.stringify(healthData.metrics || {})}
Goals: ${JSON.stringify(healthData.goals || {})}
Recent Activity: ${JSON.stringify(healthData.recentActivity || {})}

Provide actionable, specific recommendations that the user can implement today.`;

      const response = await NativeAI.generateText(prompt, 300);
      const recommendations = response.split('\n').filter(line => line.trim().length > 0);
      await this.setCache(cacheKey, recommendations);
      return recommendations;
    }
  }

  async optimizeSchedule(scheduleData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `schedule_${JSON.stringify(scheduleData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/schedule-optimize`, {
          scheduleData,
          userPreferences: scheduleData.preferences || {}
        })
      );
      const result = response.data;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      // Fallback to local processing
      const prompt = `Optimize the following schedule for better productivity and work-life balance:

Current Schedule: ${JSON.stringify(scheduleData.schedule || {})}
Energy Levels: ${JSON.stringify(scheduleData.energyLevels || {})}
Priorities: ${JSON.stringify(scheduleData.priorities || {})}
Constraints: ${JSON.stringify(scheduleData.constraints || {})}

Provide optimization suggestions that consider:
1. Energy optimization
2. Priority alignment
3. Work-life balance
4. Time efficiency

Format as JSON with keys: suggestions, optimizedSchedule, conflicts, improvements`;

      const response = await NativeAI.generateText(prompt, 600);
      try {
        const result = JSON.parse(response);
        await this.setCache(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('Failed to parse schedule optimization response:', parseError);
        return {
          suggestions: ['Consider moving high-priority tasks to peak energy hours'],
          optimizedSchedule: scheduleData.schedule,
          conflicts: [],
          improvements: ['Better time management'],
        };
      }
    }
  }

  async generateFinancialInsights(financialData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `finance_${JSON.stringify(financialData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/finance-insights`, { financeData: financialData })
      );
      const result = response.data;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Financial insights generation failed:', error);
      // Fallback to local processing
      const prompt = `Analyze the following financial data and provide insights:

Financial Data: ${JSON.stringify(financialData.data || {})}
Goals: ${JSON.stringify(financialData.goals || {})}
Budget: ${JSON.stringify(financialData.budget || {})}

Provide:
1. Key insights
2. Savings opportunities
3. Budget recommendations
4. Investment suggestions

Format as JSON with keys: insights, opportunities, recommendations, riskLevel`;

      const response = await NativeAI.generateText(prompt, 500);
      try {
        const result = JSON.parse(response);
        await this.setCache(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('Failed to parse financial insights response:', parseError);
        return {
          insights: ['Track your spending patterns'],
          opportunities: ['Consider automated savings'],
          recommendations: ['Review monthly subscriptions'],
          riskLevel: 'low',
        };
      }
    }
  }

  async optimizeSmartHome(smartHomeData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `smarthome_${JSON.stringify(smartHomeData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/smart-home-optimize`, { smartHomeData })
      );
      const result = response.data;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Smart home optimization failed:', error);
      // Fallback to local processing
      const prompt = `Optimize the following smart home setup:

Devices: ${JSON.stringify(smartHomeData.devices || {})}
Automations: ${JSON.stringify(smartHomeData.automations || {})}
Energy Usage: ${JSON.stringify(smartHomeData.energyUsage || {})}

Provide optimization suggestions for:
1. Energy efficiency
2. Automation improvements
3. Security enhancements
4. User convenience

Format as JSON with keys: energyOptimizations, automationSuggestions, securityImprovements, convenienceEnhancements`;

      const response = await NativeAI.generateText(prompt, 400);
      try {
        const result = JSON.parse(response);
        await this.setCache(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('Failed to parse smart home optimization response:', parseError);
        return {
          energyOptimizations: ['Use smart thermostats efficiently'],
          automationSuggestions: ['Create morning and evening routines'],
          securityImprovements: ['Enable motion detection'],
          convenienceEnhancements: ['Voice control integration'],
        };
      }
    }
  }

  async reduceDecisionFatigue(context: any): Promise<string[]> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `decision_${JSON.stringify(context)}`;
    const cachedResult = await this.getFromCache<string[]>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/decision-fatigue`, {
          context: JSON.stringify(context),
          options: context.options || []
        })
      );
      const result = response.data.recommendation || [];
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Decision fatigue reduction failed:', error);
      // Fallback to local processing
      const prompt = `Help reduce decision fatigue by providing simple, actionable suggestions for:

Context: ${JSON.stringify(context)}

Provide 3-5 simple decisions or actions that can be automated or simplified to reduce mental load.`;

      const response = await NativeAI.generateText(prompt, 300);
      const suggestions = response.split('\n').filter(line => line.trim().length > 0);
      await this.setCache(cacheKey, suggestions);
      return suggestions;
    }
  }

  // RAG implementation
  async retrieveRelevantKnowledge(query: string, context: any): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    const cacheKey = `rag_${query}_${JSON.stringify(context)}`;
    const cachedResult = await this.getFromCache<string>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // Use the backend RAG API
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/rag-query`, { query, context: JSON.stringify(context) })
      );

      // The backend should return relevant documents and a synthesized response
      const documents = response.data;
      let result = '';

      if (documents && documents.length > 0) {
        // Synthesize the documents into a coherent response
        const docsContent = documents.map((doc: any) => doc.content).join('\n\n');
        const synthesisPrompt = `Based on the following information, provide a comprehensive answer to the query: "${query}"\n\nInformation:\n${docsContent}`;

        result = await NativeAI.generateText(synthesisPrompt, 500);
      } else {
        result = 'No relevant information found for your query.';
      }

      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Knowledge retrieval failed:', error);
      // Fallback to direct query answering
      const prompt = `Based on the following context, provide relevant knowledge for the query:\n\nQuery: ${query}\nContext: ${JSON.stringify(context)}\n\nProvide a concise, relevant response that addresses the query using the available context.`;

      const result = await NativeAI.generateText(prompt, 400);
      await this.setCache(cacheKey, result);
      return result;
    }
  }

  async collaborativeAnalysis(agents: string[], data: any): Promise<AIAnalysis> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Use the backend API for collaborative analysis
      const response = await this.withRetry(() =>
        axios.post(`${API_BASE_URL}/collaborative-analysis`, {
          agents,
          userData: data
        })
      );

      return {
        id: `collaborative_${Date.now()}`,
        type: 'collaborative',
        title: 'Multi-Agent Analysis',
        description: response.data.join('\n\n'),
        priority: 'high',
        actionable: true,
        impact: 'High - Cross-domain optimization',
        insights: response.data.map((analysis: any) => analysis.insights).flat(),
        recommendations: response.data.map((analysis: any) => analysis.recommendations).flat(),
        riskLevel: 'low',
        confidence: 0.85,
        nextActions: response.data.map((analysis: any) => analysis.nextActions).flat(),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Collaborative analysis failed:', error);

      // Fallback to local processing
      const agentConfigs = agents.map(id => this.agents.get(id)).filter(Boolean);

      const prompt = `Multiple AI agents are collaborating to analyze the following data:\n\nData: ${JSON.stringify(data)}\nAgents: ${agentConfigs.map(a => a?.name).join(', ')}\n\nProvide a comprehensive analysis that combines insights from all agents, considering:\n1. Cross-domain insights\n2. Potential conflicts\n3. Integrated recommendations\n4. Priority actions\n\nFormat as a comprehensive analysis with actionable insights.`;

      const response = await NativeAI.generateText(prompt, 800);

      return {
        id: `collaborative_${Date.now()}`,
        type: 'collaborative',
        title: 'Multi-Agent Analysis',
        description: response,
        priority: 'high',
        actionable: true,
        impact: 'High - Cross-domain optimization',
        insights: [response],
        recommendations: ['Implement cross-domain optimizations'],
        riskLevel: 'low',
        confidence: 0.85,
        nextActions: ['Review recommendations', 'Implement high-priority actions'],
        timestamp: new Date(),
      };
    }
  }

  async addTask(task: AITask): Promise<void> {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    if (!this.isProcessing) {
      this.processTaskQueue();
    }
  }

  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      try {
        await this.processTask(task);
      } catch (error) {
        console.error(`Failed to process task ${task.id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  private async processTask(task: AITask): Promise<void> {
    console.log(`Processing AI task: ${task.type} - ${task.id}`);

    try {
      switch (task.type) {
        case 'analysis':
          // Process analysis task
          await axios.post(`${API_BASE_URL}/task/analysis`, task);
          break;
        case 'decision':
          // Process decision task
          await axios.post(`${API_BASE_URL}/task/decision`, task);
          break;
        case 'generation':
          // Process generation task
          await axios.post(`${API_BASE_URL}/task/generation`, task);
          break;
        case 'optimization':
          // Process optimization task
          await axios.post(`${API_BASE_URL}/task/optimization`, task);
          break;
      }
    } catch (error) {
      console.error(`Task processing error for ${task.id}:`, error);
      // Fallback to local processing if backend fails
      const prompt = `Process the following AI task:\n\nType: ${task.type}\nPrompt: ${task.prompt}\nContext: ${JSON.stringify(task.context)}\nPriority: ${task.priority}\n\nProvide a detailed response addressing the task requirements.`;

      await NativeAI.generateText(prompt, 500);
    }
  }

  getAgents(): AIAgent[] {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: 'active',
      capabilities: agent.capabilities,
      performance: {
        accuracy: 0.85,
        responseTime: 1000,
        userSatisfaction: 0.8,
      },
    }));
  }

  async getAgentStatus(agentId: string): Promise<AIAgent | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: 'active',
      capabilities: agent.capabilities,
      performance: {
        accuracy: 0.85,
        responseTime: 1000,
        userSatisfaction: 0.8,
      },
    };
  }

  async generateText(prompt: string, maxTokens: number): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    try {
      return await this.withRetry(() => NativeAI.generateText(prompt, maxTokens));
    } catch (error) {
      console.error('Text generation failed:', error);
      return '';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
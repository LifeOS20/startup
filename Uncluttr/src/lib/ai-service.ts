import { Platform, NativeModules } from 'react-native';
import { AIAnalysis, AIDecision, AIAgent } from '../stores/lifeOSStore';
import { aiService } from '../services/AIService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';

// Configuration constants
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.lifeos.ai/v1';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour cache expiry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * LifeOS AI Service - Production Implementation
 * 
 * This service provides AI capabilities for the LifeOS application, including:
 * - Natural language processing
 * - Personalized recommendations
 * - Predictive analytics
 * - Decision support
 * - Multi-agent collaboration
 */
class LifeOSAIService {
  private isInitialized: boolean = false;
  private cache: Map<string, CacheItem<any>> = new Map();
  private apiKey: string | null = null;
  
  /**
   * Initialize the AI service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing LifeOS AI Service...');
      
      // Load API key from secure storage
      this.apiKey = await this.getSecureApiKey();
      
      // Initialize the underlying AI service
      await aiService.initialize();
      
      this.isInitialized = true;
      console.log('LifeOS AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LifeOS AI Service:', error);
      throw error;
    }
  }
  
  /**
   * Get API key from secure storage
   */
  private async getSecureApiKey(): Promise<string | null> {
    try {
      // In a production app, use a secure storage solution
      // This is a simplified implementation
      const apiKey = await AsyncStorage.getItem('lifeos_ai_api_key');
      return apiKey;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }
  
  /**
   * Cache management - Get item from cache
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      // Try to get from memory cache first
      const cachedItem = this.cache.get(key);
      if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
        return cachedItem.data as T;
      }

      // Try to get from persistent storage
      const storedItem = await AsyncStorage.getItem(`lifeos_ai_cache_${key}`);
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

  /**
   * Cache management - Set item in cache
   */
  private async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };

      // Update memory cache
      this.cache.set(key, cacheItem);

      // Update persistent storage
      await AsyncStorage.setItem(`lifeos_ai_cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }
  
  /**
   * Retry mechanism for API calls
   */
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
  
  /**
   * Generate daily briefing for the user
   */
  async generateDailyBriefing(userData: any): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      return await aiService.generateDailyBriefing(userData);
    } catch (error) {
      console.error('Daily briefing generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Detect burnout risk based on health data
   */
  async detectBurnout(healthData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `burnout_${JSON.stringify(healthData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.detectBurnout(healthData);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Burnout detection failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate wellness recommendations based on health data
   */
  async generateWellnessRecommendations(healthData: any): Promise<string[]> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `wellness_${JSON.stringify(healthData)}`;
    const cachedResult = await this.getFromCache<string[]>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.generateWellnessRecommendations(healthData);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Wellness recommendations generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Optimize user's schedule for better productivity
   */
  async optimizeSchedule(scheduleData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `schedule_${JSON.stringify(scheduleData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.optimizeSchedule(scheduleData);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate financial insights based on financial data
   */
  async generateFinancialInsights(financialData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `finance_${JSON.stringify(financialData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.generateFinancialInsights(financialData);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Financial insights generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Optimize smart home setup for energy efficiency
   */
  async optimizeSmartHome(smartHomeData: any): Promise<any> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `smarthome_${JSON.stringify(smartHomeData)}`;
    const cachedResult = await this.getFromCache<any>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.optimizeSmartHome(smartHomeData);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Smart home optimization failed:', error);
      throw error;
    }
  }
  
  /**
   * Reduce decision fatigue by providing recommendations
   */
  async reduceDecisionFatigue(context: any): Promise<string[]> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `decision_${JSON.stringify(context)}`;
    const cachedResult = await this.getFromCache<string[]>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.reduceDecisionFatigue(context);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Decision fatigue reduction failed:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve relevant knowledge using RAG (Retrieval-Augmented Generation)
   */
  async retrieveRelevantKnowledge(query: string, context: any): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    const cacheKey = `rag_${query}_${JSON.stringify(context)}`;
    const cachedResult = await this.getFromCache<string>(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      const result = await aiService.retrieveRelevantKnowledge(query, context);
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Knowledge retrieval failed:', error);
      throw error;
    }
  }
  
  /**
   * Perform collaborative analysis using multiple AI agents
   */
  async collaborativeAnalysis(agents: string[], data: any): Promise<AIAnalysis> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      return await aiService.collaborativeAnalysis(agents, data);
    } catch (error) {
      console.error('Collaborative analysis failed:', error);
      throw error;
    }
  }
  
  /**
   * Get list of available AI agents
   */
  getAgents(): AIAgent[] {
    return aiService.getAgents();
  }
  
  /**
   * Get status of a specific AI agent
   */
  async getAgentStatus(agentId: string): Promise<AIAgent | null> {
    return await aiService.getAgentStatus(agentId);
  }
  
  /**
   * Generate text using AI
   */
  async generateText(prompt: string, maxTokens: number): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      return await aiService.generateText(prompt, maxTokens);
    } catch (error) {
      console.error('Text generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioPath: string): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      return await aiService.transcribeAudio(audioPath);
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const lifeOSAIInstance = new LifeOSAIService();

// Export the singleton instance
export const lifeOSAI = lifeOSAIInstance;

// For backward compatibility, also export the underlying aiService
export { aiService };
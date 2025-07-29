const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { PromptTemplate } = require('@langchain/core/prompts');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('@langchain/core/documents');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI with proper error handling
const openai = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Initialize embeddings for RAG
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

// Initialize vector store (Chroma)
let vectorStore = null;

// Initialize vector database
async function initializeVectorStore() {
  try {
    if (!vectorStore) {
      vectorStore = await Chroma.fromExistingCollection(embeddings, {
        collectionName: 'lifeos-knowledge',
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
      console.log('Vector store initialized successfully');
    }
    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
    // Create new collection if it doesn't exist
    try {
      vectorStore = await Chroma.fromDocuments([], embeddings, {
        collectionName: 'lifeos-knowledge',
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
      console.log('Created new vector store collection');
      return vectorStore;
    } catch (createError) {
      console.error('Failed to create vector store:', createError);
      return null;
    }
  }
}

// Enhanced response parsing with proper JSON handling
function parseStructuredResponse(response, fallbackData = {}) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to parse the entire response as JSON
    return JSON.parse(response);
  } catch (error) {
    console.warn('Failed to parse structured response, using fallback:', error);
    return fallbackData;
  }
}

// Daily Briefing with enhanced personalization
async function generateDailyBriefing(userData) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      You are a personal AI assistant for LifeOS. Generate a comprehensive daily briefing based on the user's data.
      
      User Data:
      - Health: {healthData}
      - Finance: {financeData}
      - Schedule: {scheduleData}
      - Smart Home: {smartHomeData}
      - Previous Day Summary: {previousDay}
      
      Generate a personalized daily briefing that includes:
      1. Good morning greeting with current date and weather consideration
      2. Key insights and trends from all life domains
      3. Priority tasks and deadlines for today
      4. Health and wellness recommendations based on recent patterns
      5. Financial insights and alerts (if any)
      6. Smart home status and optimizations
      7. Personalized motivational message aligned with user's goals
      
      Make it conversational, actionable, and motivating. Keep it concise but comprehensive.
      Focus on what matters most today and provide clear next steps.
    `);
    
    const chain = RunnableSequence.from([
      prompt,
      openai,
      new StringOutputParser(),
    ]);
    
    const result = await chain.invoke({
      healthData: JSON.stringify(userData.health || {}),
      financeData: JSON.stringify(userData.finance || {}),
      scheduleData: JSON.stringify(userData.schedule || {}),
      smartHomeData: JSON.stringify(userData.smartHome || {}),
      previousDay: JSON.stringify(userData.previousDay || {}),
    });
    
    return result;
  } catch (error) {
    console.error('Daily briefing generation failed:', error);
    throw new Error('Failed to generate daily briefing');
  }
}

// Enhanced Burnout Detection with proper analysis
async function detectBurnout(healthData) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze the following health and wellness data for signs of burnout or overwhelm.
      Use evidence-based indicators and provide a comprehensive assessment.
      
      Health Data: {healthData}
      
      Analyze the following metrics:
      1. Sleep patterns (quality, duration, consistency)
      2. Physical activity levels and trends
      3. Mood indicators and emotional patterns
      4. Stress levels and triggers
      5. Work-life balance indicators
      6. Energy levels throughout the day
      
      Provide a comprehensive analysis in the following JSON format:
      {
        "riskLevel": "low|medium|high|critical",
        "confidence": 0.85,
        "keyIndicators": ["specific indicators found"],
        "warningMessage": "clear, empathetic message",
        "recommendations": ["specific, actionable recommendations"],
        "immediateActions": ["urgent steps if risk is high"],
        "monitoringPoints": ["what to watch for"],
        "positiveAspects": ["what's going well"]
      }
    `);
    
    const chain = RunnableSequence.from([
      prompt,
      openai,
      new StringOutputParser(),
    ]);
    
    const result = await chain.invoke({ healthData: JSON.stringify(healthData) });
    
    return parseStructuredResponse(result, {
      riskLevel: 'medium',
      confidence: 0.5,
      keyIndicators: ['Unable to analyze data'],
      warningMessage: 'Analysis temporarily unavailable',
      recommendations: ['Take regular breaks', 'Practice self-care'],
      immediateActions: [],
      monitoringPoints: ['Monitor stress levels'],
      positiveAspects: ['Seeking wellness insights']
    });
  } catch (error) {
    console.error('Burnout detection failed:', error);
    throw new Error('Failed to analyze burnout risk');
  }
}

// Production RAG implementation with vector database
async function retrieveRelevantKnowledge(query, context) {
  try {
    const store = await initializeVectorStore();
    if (!store) {
      throw new Error('Vector store not available');
    }
    
    // Enhance query with context
    const enhancedQuery = `${query} Context: ${JSON.stringify(context)}`;
    
    // Retrieve relevant documents
    const relevantDocs = await store.similaritySearch(enhancedQuery, 5);
    
    if (relevantDocs.length === 0) {
      // If no documents found, try a broader search
      const broaderDocs = await store.similaritySearch(query, 3);
      if (broaderDocs.length === 0) {
        return [{
          id: Date.now().toString(),
          content: 'No specific knowledge found for this query. Consider adding more context or rephrasing your question.',
          metadata: {
            type: 'fallback',
            timestamp: new Date().toISOString(),
            source: 'system',
            relevanceScore: 0.1
          }
        }];
      }
      relevantDocs.push(...broaderDocs);
    }
    
    // Format documents for response
    return relevantDocs.map((doc, index) => ({
      id: `doc_${Date.now()}_${index}`,
      content: doc.pageContent,
      metadata: {
        ...doc.metadata,
        timestamp: new Date().toISOString(),
        relevanceScore: 1 - (index * 0.1), // Simple relevance scoring
      }
    }));
  } catch (error) {
    console.error('Knowledge retrieval failed:', error);
    // Return contextual fallback
    return [{
      id: Date.now().toString(),
      content: `Based on the context provided: ${JSON.stringify(context)}, here are some general insights that might be helpful.`,
      metadata: {
        type: 'contextual-fallback',
        timestamp: new Date().toISOString(),
        source: 'system-context',
        relevanceScore: 0.3
      }
    }];
  }
}

// Production multi-agent collaboration
async function collaborativeAnalysis(userData) {
  try {
    // Run multiple specialized analyses in parallel
    const [healthAnalysis, financeAnalysis, scheduleAnalysis, smartHomeAnalysis] = await Promise.allSettled([
      detectBurnout(userData.health || {}),
      generateFinancialInsights(userData.finance || {}),
      optimizeSchedule(userData.schedule || {}, userData.preferences || {}),
      optimizeSmartHome(userData.smartHome || {})
    ]);
    
    // Collect successful analyses
    const analyses = [];
    
    if (healthAnalysis.status === 'fulfilled') {
      analyses.push({
        agent: 'health',
        type: 'wellness',
        ...healthAnalysis.value
      });
    }
    
    if (financeAnalysis.status === 'fulfilled') {
      analyses.push({
        agent: 'finance',
        type: 'finance',
        ...financeAnalysis.value
      });
    }
    
    if (scheduleAnalysis.status === 'fulfilled') {
      analyses.push({
        agent: 'schedule',
        type: 'productivity',
        ...scheduleAnalysis.value
      });
    }
    
    if (smartHomeAnalysis.status === 'fulfilled') {
      analyses.push({
        agent: 'smart_home',
        type: 'automation',
        ...smartHomeAnalysis.value
      });
    }
    
    // Synthesize cross-domain insights
    const synthesisPrompt = PromptTemplate.fromTemplate(`
      Analyze the following multi-agent insights and provide a comprehensive synthesis:
      
      Agent Analyses: {analyses}
      
      Provide a synthesis that identifies:
      1. Cross-domain patterns and correlations
      2. Conflicting recommendations and how to resolve them
      3. Synergistic opportunities across life domains
      4. Priority ranking of all recommendations
      5. Integrated action plan
      
      Format as JSON:
      {
        "crossDomainInsights": ["key patterns across domains"],
        "conflicts": ["conflicting recommendations and resolutions"],
        "synergies": ["opportunities for integrated improvements"],
        "prioritizedActions": ["ranked list of actions"],
        "integratedPlan": "comprehensive action plan",
        "confidence": 0.85
      }
    `);
    
    const synthesisChain = RunnableSequence.from([
      synthesisPrompt,
      openai,
      new StringOutputParser(),
    ]);
    
    const synthesis = await synthesisChain.invoke({
      analyses: JSON.stringify(analyses)
    });
    
    const parsedSynthesis = parseStructuredResponse(synthesis, {
      crossDomainInsights: ['Multiple life domains analyzed'],
      conflicts: [],
      synergies: ['Integrated approach recommended'],
      prioritizedActions: ['Review individual domain recommendations'],
      integratedPlan: 'Focus on high-impact actions across all domains',
      confidence: 0.7
    });
    
    return {
      individualAnalyses: analyses,
      synthesis: parsedSynthesis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Collaborative analysis failed:', error);
    throw new Error('Failed to perform collaborative analysis');
  }
}
async function generateWellnessRecommendations(healthData) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze the following health data and provide actionable, evidence-based wellness recommendations. Consider sleep, activity, nutrition, stress, and hydration. Output a JSON array of recommendations, each with a title and a short explanation.
      Health Data: {healthData}
      Example Output: [{"title": "Increase Hydration", "explanation": "Your water intake is below target."}]
    `);
    const chain = RunnableSequence.from([prompt, openai, new StringOutputParser()]);
    const result = await chain.invoke({ healthData: JSON.stringify(healthData) });
    return parseStructuredResponse(result, [{ title: "Stay active", explanation: "Keep moving daily." }]);
  } catch (error) {
    console.error('Wellness recommendation failed:', error);
    throw new Error('Failed to generate wellness recommendations');
  }
}

// Schedule Optimization
async function optimizeSchedule(scheduleData, userPreferences) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Optimize the user's schedule for productivity, well-being, and work-life balance. Consider user preferences and constraints. Output a JSON array of optimized schedule items with suggested changes.
      Schedule Data: {scheduleData}
      User Preferences: {userPreferences}
    `);
    const chain = RunnableSequence.from([prompt, openai, new StringOutputParser()]);
    const result = await chain.invoke({ scheduleData: JSON.stringify(scheduleData), userPreferences: JSON.stringify(userPreferences) });
    return parseStructuredResponse(result, scheduleData);
  } catch (error) {
    console.error('Schedule optimization failed:', error);
    throw new Error('Failed to optimize schedule');
  }
}

// Financial Insights
async function generateFinancialInsights(financeData) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze the user's financial data and provide actionable insights, trends, and alerts. Output a JSON object with insights, alerts, and recommendations.
      Finance Data: {financeData}
      Example Output: {"insights": "Your savings rate increased.", "alerts": ["High spending on dining"], "recommendations": ["Increase investment contributions"]}
    `);
    const chain = RunnableSequence.from([prompt, openai, new StringOutputParser()]);
    const result = await chain.invoke({ financeData: JSON.stringify(financeData) });
    return parseStructuredResponse(result, { insights: "No insights available.", alerts: [], recommendations: [] });
  } catch (error) {
    console.error('Financial insights failed:', error);
    throw new Error('Failed to generate financial insights');
  }
}

// Smart Home Optimization
async function optimizeSmartHome(smartHomeData) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze smart home device data and suggest optimizations for energy efficiency, comfort, and security. Output a JSON array of suggestions with explanations.
      Smart Home Data: {smartHomeData}
      Example Output: [{"suggestion": "Lower thermostat at night", "explanation": "Reduces energy usage."}]
    `);
    const chain = RunnableSequence.from([prompt, openai, new StringOutputParser()]);
    const result = await chain.invoke({ smartHomeData: JSON.stringify(smartHomeData) });
    return parseStructuredResponse(result, [{ suggestion: "No suggestions available.", explanation: "Insufficient data." }]);
  } catch (error) {
    console.error('Smart home optimization failed:', error);
    throw new Error('Failed to optimize smart home');
  }
}

// Decision Fatigue Reduction
async function reduceDecisionFatigue(context, options) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Given the user's context and available options, recommend ways to reduce decision fatigue. Suggest automation, prioritization, or delegation strategies. Output a JSON object with strategies and explanations.
      Context: {context}
      Options: {options}
      Example Output: {"strategies": ["Automate recurring tasks", "Prioritize urgent decisions"], "explanations": ["Automation frees mental bandwidth.", "Prioritization reduces overwhelm."]}
    `);
    const chain = RunnableSequence.from([prompt, openai, new StringOutputParser()]);
    const result = await chain.invoke({ context: JSON.stringify(context), options: JSON.stringify(options) });
    return parseStructuredResponse(result, { strategies: [], explanations: [] });
  } catch (error) {
    console.error('Decision fatigue reduction failed:', error);
    throw new Error('Failed to reduce decision fatigue');
  }
}

module.exports = {
  generateDailyBriefing,
  detectBurnout,
  generateWellnessRecommendations,
  optimizeSchedule,
  generateFinancialInsights,
  optimizeSmartHome,
  reduceDecisionFatigue,
  retrieveRelevantKnowledge,
  collaborativeAnalysis,
  initializeVectorStore,
};
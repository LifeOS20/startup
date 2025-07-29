const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const aiService = require('./ai-service');
const apiRoutes = require('./routes/api');

// Add API routes
app.use('/api', apiRoutes);

app.post('/api/ai/daily-briefing', async (req, res) => {
  try {
    const userData = req.body;
    const result = await aiService.generateDailyBriefing(userData);
    res.json({ briefing: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate daily briefing' });
  }
});

app.post('/api/ai/burnout', async (req, res) => {
  try {
    const { healthData } = req.body;
    const result = await aiService.detectBurnout(healthData);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to detect burnout' });
  }
});

app.post('/api/ai/wellness', async (req, res) => {
  try {
    const { healthData } = req.body;
    const result = await aiService.generateWellnessRecommendations(healthData);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate wellness recommendations' });
  }
});

app.post('/api/ai/schedule-optimize', async (req, res) => {
  try {
    const { scheduleData, userPreferences } = req.body;
    const result = await aiService.optimizeSchedule(scheduleData, userPreferences);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to optimize schedule' });
  }
});

app.post('/api/ai/finance-insights', async (req, res) => {
  try {
    const { financeData } = req.body;
    const result = await aiService.generateFinancialInsights(financeData);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate financial insights' });
  }
});

app.post('/api/ai/smart-home-optimize', async (req, res) => {
  try {
    const { smartHomeData } = req.body;
    const result = await aiService.optimizeSmartHome(smartHomeData);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to optimize smart home' });
  }
});

app.post('/api/ai/decision-fatigue', async (req, res) => {
  try {
    const { context, options } = req.body;
    const result = await aiService.reduceDecisionFatigue(context, options);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reduce decision fatigue' });
  }
});

app.post('/api/ai/rag-query', async (req, res) => {
  try {
    const { query, context } = req.body;
    const result = await aiService.retrieveRelevantKnowledge(query, context);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve knowledge' });
  }
});

app.post('/api/ai/collaborative-analysis', async (req, res) => {
  try {
    const userData = req.body;
    const result = await aiService.collaborativeAnalysis(userData);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform collaborative analysis' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI backend server running on port ${PORT}`);
});
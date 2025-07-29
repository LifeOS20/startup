const express = require('express');
const router = express.Router();
const aiService = require('../ai-service');

// Health
router.post('/ai/wellness', async (req, res) => {
  try {
    const { healthData } = req.body;
    const result = await aiService.generateWellnessRecommendations(healthData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule
router.post('/ai/schedule-optimize', async (req, res) => {
  try {
    const { scheduleData, userPreferences } = req.body;
    const result = await aiService.optimizeSchedule(scheduleData, userPreferences);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Finance
router.post('/ai/finance-insights', async (req, res) => {
  try {
    const { financeData } = req.body;
    const result = await aiService.generateFinancialInsights(financeData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart Home
router.post('/ai/smart-home-optimize', async (req, res) => {
  try {
    const { smartHomeData } = req.body;
    const result = await aiService.optimizeSmartHome(smartHomeData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decision Fatigue
router.post('/ai/decision-fatigue', async (req, res) => {
  try {
    const { context, options } = req.body;
    const result = await aiService.reduceDecisionFatigue(context, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
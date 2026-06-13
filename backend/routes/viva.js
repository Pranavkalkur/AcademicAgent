import express from 'express';
import VivaSession from '../models/VivaSession.js';
import MasteryProfile from '../models/MasteryProfile.js';
import ModelRouter from '../services/ModelRouter.js';
import TwinBuilder from '../services/TwinBuilder.js';
import QuestionBank from '../services/QuestionBank.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/question', authMiddleware, express.json(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { topic, aliases } = req.body;
    if (!topic) return res.status(400).json({ success: false, error: 'Topic is required' });

    const questionTemplate = await QuestionBank.getQuestionForTopic(topic, aliases, userId, workspaceId);
    
    // Mark as asked right away to avoid duplicate hits if user refreshes
    await QuestionBank.markQuestionAsked(userId, workspaceId, questionTemplate._id);

    res.json({
      success: true,
      data: {
        id: questionTemplate._id,
        topic: questionTemplate.topic,
        text: questionTemplate.question,
        expectedConcepts: JSON.stringify(questionTemplate.expectedConcepts)
      }
    });
  } catch (error) {
    console.error('[Viva Question Route] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/evaluate', authMiddleware, express.json(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { 
      topic,
      question,
      transcript,
      latencySeconds,
      silenceRatio,
      expectedConcepts,
      selfConfidence
    } = req.body;

    if (!transcript) {
      return res.status(400).json({ success: false, error: 'No transcript provided' });
    }

    // 1. Parse Expected Concepts
    let conceptsList = [];
    try {
      const rawConcepts = expectedConcepts || (question && question.expectedConcepts);
      conceptsList = typeof rawConcepts === 'string' ? JSON.parse(rawConcepts) : rawConcepts;
    } catch(e) {
      conceptsList = expectedConcepts || (question && question.expectedConcepts) || [];
    }
    if (!conceptsList || !Array.isArray(conceptsList)) {
      conceptsList = [];
    }

    const normalizedConcepts = conceptsList.map(c => {
      if (typeof c === 'string') {
        return { name: c, keywords: [c.toLowerCase()] };
      }
      return c;
    });

    const transcriptLower = (transcript || '').toLowerCase();
    const questionText = typeof question === 'object' ? question.text : question;
    const questionLower = (questionText || '').toLowerCase().trim();
    
    // 2. Reject Garbage Answers
    const totalWords = (transcript || '').split(/\s+/).filter(w => w.length > 0).length;
    if (totalWords < 5) {
      return res.json({ success: true, data: { valid: false, message: "Answer too short. Please provide a more detailed response." } });
    }
    
    // Check if the user just repeated the question
    if (questionLower && (transcriptLower === questionLower || transcriptLower.includes(questionLower))) {
      return res.json({ success: true, data: { valid: false, message: "Please provide an answer to the question, rather than just repeating it." } });
    }

    // 3. Keyword-Based Concept Coverage
    const matchedConcepts = [];
    const missedConcepts = [];

    const conceptCoverage = {};
    
    for (const concept of normalizedConcepts) {
      const isMatch = concept.keywords.some(kw => transcriptLower.includes(kw));
      if (isMatch) {
        matchedConcepts.push(concept.name);
        conceptCoverage[concept.name] = 100;
      } else {
        missedConcepts.push(concept.name);
        conceptCoverage[concept.name] = 0;
      }
    }

    if (matchedConcepts.length === 0) {
      return res.json({ success: true, data: { valid: false, message: "Answer appears unrelated to the current subject." } });
    }

    const coverageScore = Math.round((matchedConcepts.length / normalizedConcepts.length) * 100);

    // 4. Generate Professor Feedback (Tiny LLM Call)
    const feedbackPayload = await ModelRouter.execute('VIVA_FEEDBACK', {
      topic,
      question,
      coverageScore,
      matchedConcepts,
      missedConcepts
    });

    // 5. Update MasteryProfile via EMA
    let profile = await MasteryProfile.findOne({ userId, workspaceId });
    if (!profile) {
      profile = new MasteryProfile({ userId, workspaceId, topics: {} });
    }

    let topicData = profile.topics.get(topic) || { mastery: 0, confidence: 0, concepts: {} };
    const oldMastery = topicData.mastery || 0;
    
    // Apply EMA
    const newMastery = (oldMastery * 0.8) + (coverageScore * 0.2);
    topicData.mastery = newMastery;
    topicData.lastReviewed = new Date();
    
    // Concept updates inside topic
    for (const [conceptName, score] of Object.entries(conceptCoverage)) {
      console.log('--- VIVA COACH DEBUG ---');
      console.log('topicData:', topicData);
      console.log('topicData.concepts:', topicData.concepts);
      console.log('typeof topicData.concepts:', typeof topicData.concepts);
      console.log('Array.isArray(topicData.concepts):', Array.isArray(topicData.concepts));
      
      let oldConceptScore = 0;
      if (topicData.concepts && typeof topicData.concepts.get === 'function') {
         oldConceptScore = topicData.concepts.get(conceptName) || 0;
      } else if (topicData.concepts) {
         oldConceptScore = topicData.concepts[conceptName] || 0;
      }
      
      const newScore = (oldConceptScore * 0.8) + (score * 0.2);
      
      if (topicData.concepts && typeof topicData.concepts.set === 'function') {
         topicData.concepts.set(conceptName, newScore);
      } else {
         if (!topicData.concepts) topicData.concepts = {};
         topicData.concepts[conceptName] = newScore;
      }
    }

    if (profile.topics.set) {
       profile.topics.set(topic, topicData);
    } else {
       profile.topics[topic] = topicData;
    }
    await profile.save();

    // 6. Save Viva Session
    const session = new VivaSession({
      userId,
      workspaceId,
      topic,
      question,
      transcript,
      technicalScore: coverageScore,
      confidenceScore: parseInt(selfConfidence) || 50,
      latencySeconds: parseFloat(latencySeconds) || 0,
      silenceRatio: parseFloat(silenceRatio) || 0,
      fillerWords: 0,
      conceptCoverage,
      weakConcepts: missedConcepts,
      strongConcepts: matchedConcepts
    });
    
    await session.save();

    // 7. Sync Academic Twin
    try {
      const WorkspaceService = (await import('../services/WorkspaceService.js')).default;
      await WorkspaceService.syncTwin(workspaceId, userId);
    } catch(err) {
      console.error('Failed to sync twin after Viva:', err);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        session: session._id,
        transcript,
        coverageScore,
        matchedConcepts,
        missedConcepts,
        masteryUpdate: {
          oldMastery: Math.round(oldMastery),
          newMastery: Math.round(newMastery)
        },
        feedback: feedbackPayload.data.observation,
        followUpQuestion: feedbackPayload.data.followUpQuestion
      }
    });

  } catch (error) {
    console.error('VIVA ERROR');
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

router.get('/twin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const profile = await MasteryProfile.findOne({ userId, workspaceId });
    const twinData = await TwinBuilder.build(profile);

    // Fetch history
    const sessions = await VivaSession.find({ userId, workspaceId }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: {
        ...twinData,
        history: sessions.map(s => ({
          topic: s.topic,
          technicalScore: s.technicalScore,
          confidenceScore: s.confidenceScore,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('[Twin Route] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import express from 'express';
import MockExamGenerator from '../services/MockExamGenerator.js';
import ExamEvaluator from '../services/ExamEvaluator.js';
import MockExamSession from '../models/MockExamSession.js';
import MasteryProfile from '../models/MasteryProfile.js';
import Workspace from '../models/Workspace.js';
import WorkspaceService from '../services/WorkspaceService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const questions = await MockExamGenerator.generateExam(userId, workspaceId);
    
    res.json({
      success: true,
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('[MockExam Generate] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { durationSeconds, answers } = req.body;

    if (!answers || answers.length === 0) {
      throw new Error('No answers submitted');
    }

    // Verify workspace exists
    const workspace = await Workspace.findOne({ _id: workspaceId, userId, deleted: false });
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    if (!workspace.analysisResult) {
      throw new Error('Cannot build Academic Twin without analysisResult');
    }

    let totalMarks = 0;
    let maxTotal = 0;
    const unitScores = {};
    const evaluatedQuestions = [];

    // Evaluate each question
    for (const ans of answers) {
      if (!unitScores[ans.unitName]) {
        unitScores[ans.unitName] = { marks: 0, maxMarks: 0 };
      }

      let score = 0;
      let feedback = "No answer provided.";
      
      if (ans.answer && ans.answer.trim().length > 0) {
        const evalResult = await ExamEvaluator.evaluateAnswer(ans.topic, ans.text, ans.answer, ans.marks);
        score = evalResult.marksAwarded;
        feedback = evalResult.feedback;
        
        // Update MasteryProfile EMA
        let profile = await MasteryProfile.findOne({ userId, workspaceId });
        if (!profile) {
          profile = new MasteryProfile({ userId, workspaceId, topics: {} });
        }
        
        let topicData = profile.topics.get(ans.topic) || { mastery: 0, confidence: 0, concepts: {} };
        
        // Math: percentage score on this question
        const pct = (score / ans.marks) * 100;
        
        // EMA update (Alpha 0.3)
        topicData.mastery = Math.round((0.7 * (topicData.mastery || 0)) + (0.3 * pct));
        topicData.lastReviewed = new Date();
        
        // Concept updates
        if (evalResult.conceptCoverage) {
          if (!topicData.concepts) topicData.concepts = {};
          for (const [cName, cScore] of Object.entries(evalResult.conceptCoverage)) {
             const oldC = topicData.concepts[cName] || 0;
             topicData.concepts[cName] = Math.round((0.7 * oldC) + (0.3 * cScore));
          }
        }
        
        profile.topics.set(ans.topic, topicData);
        await profile.save();
      }

      totalMarks += score;
      maxTotal += ans.marks;
      
      unitScores[ans.unitName].marks += score;
      unitScores[ans.unitName].maxMarks += ans.marks;

      evaluatedQuestions.push({
        ...ans,
        score,
        feedback
      });
    }

    // Save Mock Exam Session
    const session = new MockExamSession({
      userId,
      workspaceId,
      durationSeconds,
      finalScore: totalMarks,
      maxScore: maxTotal,
      unitScores,
      questions: evaluatedQuestions
    });

    await session.save();

    // Trigger Twin Update
    await WorkspaceService.syncTwin(workspaceId, userId);

    res.json({
      success: true,
      data: session
    });

  } catch (err) {
    console.error('MOCK EXAM SUBMIT ERROR');
    console.error(err);
    console.error(err.stack);

    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import WorkspaceService from '../services/WorkspaceService.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[WorkspaceRouter] ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware);

// GET lightweight summary of all workspaces
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user.id, deleted: false })
      .select('name subjectCode semester theme stats lastOpenedAt createdAt version status')
      .sort({ lastOpenedAt: -1 });
    
    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new workspace
router.post('/', async (req, res) => {
  try {
    console.log("POST /api/workspaces req.body:", req.body);
    console.log("POST /api/workspaces req.user:", req.user);

    const { name, subjectCode, semester, theme } = req.body;
    
    const workspace = new Workspace({
      userId: req.user.id,
      name,
      subjectCode,
      semester,
      theme
    });
    
    await workspace.save();
    
    // Auto-update lastOpenedWorkspace
    await User.findByIdAndUpdate(req.user.id, { lastOpenedWorkspace: workspace._id });
    
    res.json({ success: true, data: workspace });
  } catch (error) {
    console.error("Workspace creation error:", error);
    res.status(500).json({ success: false, error: error.message, stack: String(error.stack) });
  }
});

// GET generate report
router.get('/:id/report', async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    
    // Strict isolation
    const workspace = await Workspace.findOne({ _id: workspaceId, userId, deleted: false });
    if (!workspace) return res.status(403).json({ success: false, error: 'Unauthorized workspace access' });
    
    if (!workspace.analysisResult) {
      return res.json({ success: false, message: "Run PYQ Analysis first." });
    }

    // Dynamic imports for related models
    const MasteryProfile = (await import('../models/MasteryProfile.js')).default;
    const MockExamSession = (await import('../models/MockExamSession.js')).default;
    const VivaSession = (await import('../models/VivaSession.js')).default;
    const ReportSnapshot = (await import('../models/ReportSnapshot.js')).default;
    const ModelRouter = (await import('../services/ModelRouter.js')).default;

    const profile = await MasteryProfile.findOne({ userId, workspaceId }) || { topics: new Map(), askedQuestions: [] };
    const mockExams = await MockExamSession.find({ userId, workspaceId }).sort({ createdAt: 1 });
    const vivas = await VivaSession.find({ userId, workspaceId });

    // Aggregate Data
    let knowledgeCoverage = 0;
    let topicCompletion = 0;
    const strongTopics = [];
    const weakTopics = [];
    
    const allTopics = workspace.analysisResult.knowledgeGraph?.units?.flatMap(u => u.topics.map(t => t.name)) || [];
    if (allTopics.length > 0) {
      let totalMastery = 0;
      let touchedTopics = 0;
      allTopics.forEach(t => {
        const tData = profile.topics?.get ? profile.topics.get(t) : profile.topics[t];
        if (tData) {
          totalMastery += (tData.mastery || 0);
          touchedTopics++;
          if ((tData.mastery || 0) >= 70) strongTopics.push(t);
          else if ((tData.mastery || 0) < 40) weakTopics.push(t);
        } else {
          weakTopics.push(t); // Untouched topics are risks
        }
      });
      knowledgeCoverage = Math.round(totalMastery / allTopics.length);
      topicCompletion = Math.round((touchedTopics / allTopics.length) * 100);
    }

    let mockExamAverage = 0;
    let bestScore = 0;
    if (mockExams.length > 0) {
      let validExamsCount = 0;
      const totalScore = mockExams.reduce((acc, exam) => {
        const finalScore = exam.finalScore || 0;
        const maxScore = exam.maxScore || 1; // Prevent division by zero
        if (exam.maxScore > 0) {
            validExamsCount++;
            return acc + (finalScore / maxScore) * 100;
        }
        return acc;
      }, 0);
      
      if (validExamsCount > 0) {
        mockExamAverage = Math.round(totalScore / validExamsCount);
      }
      
      const scores = mockExams
        .filter(e => e.maxScore > 0)
        .map(e => ((e.finalScore || 0) / e.maxScore) * 100);
      bestScore = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;
    }

    let vivaAverage = 0;
    if (vivas.length > 0) {
      vivaAverage = Math.round(vivas.reduce((acc, v) => acc + v.technicalScore, 0) / vivas.length);
    }

    const readiness = Math.round((knowledgeCoverage * 0.4) + (mockExamAverage * 0.3) + (vivaAverage * 0.2) + (topicCompletion * 0.1));

    const predictedQuestions = workspace.predictions?.eightMark?.slice(0, 5) || [];
    
    const payload = {
      subject: workspace.name,
      readiness,
      strongTopics: strongTopics.slice(0, 5),
      weakTopics: weakTopics.slice(0, 5),
      mockExamAverage,
      bestScore,
      vivaAverage,
      predictedQuestions,
      studyPlan: workspace.studyPlan?.roadmap || []
    };

    // Generate Professor Summary
    const summary = await ModelRouter.execute('REPORT_SUMMARY', payload);

    const scoreRange = summary?.expectedScoreRange ?? '';

    // Ensure no NaN values reach MongoDB
    const safeNum = (val) => Number.isFinite(val) ? val : 0;

    // Snapshot
    const snapshot = new ReportSnapshot({
      userId,
      workspaceId,
      readiness: safeNum(readiness),
      knowledgeCoverage: safeNum(knowledgeCoverage),
      mockExamAverage: safeNum(mockExamAverage),
      topicCompletion: safeNum(topicCompletion),
      vivaPerformance: safeNum(vivaAverage),
      expectedScoreRange: scoreRange,
      mostLikelyGrade: scoreRange.includes('8') || scoreRange.includes('9') ? 'A' : 'B',
      biggestRisk: summary.biggestWeakness || 'None',
      potentialGain: Math.round(Math.max(0, 90 - safeNum(readiness)) / 2),
      studyTimeNeeded: Math.max(2, weakTopics.length * 1.5),
      professorSummary: summary.overallAssessment + "\n\n" + summary.highestImpactRecommendation,
      snapshotData: {
        weakTopicsList: weakTopics.map(t => ({ name: t, mastery: profile.topics?.get(t)?.mastery || 0 })),
        mockExams: mockExams.map(e => Math.round((e.totalMarksAwarded / e.maxMarks) * 100))
      }
    });
    await snapshot.save();

    // Fetch history
    const history = await ReportSnapshot.find({ userId, workspaceId }).sort({ createdAt: 1 }).select('readiness createdAt');

    res.json({
      success: true,
      data: {
        snapshot,
        history,
        workspaceDetails: {
          name: workspace.name,
          subjectCode: workspace.subjectCode,
          topicsCount: allTopics.length,
          pyqsAnalysed: workspace.documents?.length || 0,
          predictedQuestions,
          studyPlan: workspace.studyPlan?.roadmap || [],
        }
      }
    });

  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET full workspace
router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id, userId: req.user.id, deleted: false });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });
    
    workspace.lastOpenedAt = new Date();
    await workspace.save();
    
    await User.findByIdAndUpdate(req.user.id, { lastOpenedWorkspace: workspace._id });
    
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update metadata
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow deep updates via basic PUT, just metadata
    delete updates.analysisResult;
    delete updates.studyPlan;
    delete updates.predictions;
    delete updates.academicTwin;
    
    const workspace = await WorkspaceService.updateWorkspace(req.params.id, req.user.id, updates);
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE soft delete
router.delete('/:id', async (req, res) => {
  try {
    const workspace = await WorkspaceService.updateWorkspace(req.params.id, req.user.id, { deleted: true, deletedAt: new Date() });
    res.json({ success: true, data: { id: workspace._id, deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST clone
router.post('/:id/clone', async (req, res) => {
  try {
    const newWorkspace = await WorkspaceService.cloneWorkspace(req.params.id, req.user.id, req.body.newName);
    res.json({ success: true, data: newWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



export default router;

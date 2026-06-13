import express from 'express';
import DocumentState from '../models/DocumentState.js';
import ModelRouter from '../services/ModelRouter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import WorkspaceService from '../services/WorkspaceService.js';
const router = express.Router({ mergeParams: true });

function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function computeFuzzySimilarity(str1, str2) {
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;
  return 0; // Naive for now
}

import MasteryProfile from '../models/MasteryProfile.js';

function hybridDeterministicMapper(pyqDocs, syllabusDocs, masteryProfile = null) {
  const ontology = {}; 
  const unitsList = [];
  
  // Phase 1: Build Canonical Academic Ontology
  syllabusDocs.forEach(doc => {
    let units = doc.metadata?.extractedStructure?.syllabusContent;
    if (!Array.isArray(units)) units = [];
    units.forEach(u => {
      if (!u.unitName) return;
      unitsList.push({ id: u.unitName, name: u.unitName, topics: [] });
      const unitTopics = u.topics || [];
      unitTopics.forEach(t => {
        const topicName = t.name;
        if (!topicName) return;
        ontology[topicName] = { 
          unitName: u.unitName, 
          aliases: (t.aliases || []).map(normalizeText),
          exactNorm: normalizeText(topicName)
        };
      });
    });
  });

  const knowledgeGraph = { units: unitsList };
  
  const mappingConfidence = {
    overall: 0,
    exactMatches: 0,
    aliasMatches: 0,
    fuzzyMatches: 0,
    semanticScanMatches: 0,
    unmapped: 0,
    total: 0
  };

  const pyqQuestions = [];
  pyqDocs.forEach(doc => {
    const year = doc.metadata?.extractedStructure?.pyqYear || new Date().getFullYear();
    let qs = doc.metadata?.extractedStructure?.pyqQuestions;
    if (!Array.isArray(qs)) qs = [];
    qs.forEach(q => pyqQuestions.push({ ...q, year }));
  });

  mappingConfidence.total = pyqQuestions.length;

  // Phase 2: Deterministic Matching Pipeline
  pyqQuestions.forEach(q => {
    // Split normalizedTopic by commas if Gemini generated a list, e.g., "Trojan Horses, Backdoors, Cybercrime Protection"
    const rawTopics = q.normalizedTopic ? q.normalizedTopic.split(',') : [q.rawText];
    
    let matchedTopic = null;
    let matchedUnit = null;
    let matchType = null;

    // We try to find a match for ANY of the extracted sub-topics.
    for (const rawT of rawTopics) {
      if (matchedTopic) break;
      const qNorm = normalizeText(rawT);
      if (!qNorm) continue;

      // Layer 1: Exact Match
      for (const [tName, tData] of Object.entries(ontology)) {
        if (tData.exactNorm === qNorm) {
          matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'exact'; break;
        }
      }

      // Layer 2: Alias Match
      if (!matchedTopic) {
        for (const [tName, tData] of Object.entries(ontology)) {
          if (tData.aliases.includes(qNorm)) {
            matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'alias'; break;
          }
        }
      }

      // Layer 3: Fuzzy Match
      if (!matchedTopic) {
        for (const [tName, tData] of Object.entries(ontology)) {
          if (computeFuzzySimilarity(qNorm, tData.exactNorm) > 0.7) {
            matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'fuzzy'; break;
          }
          if (tData.aliases.some(a => computeFuzzySimilarity(qNorm, a) > 0.7)) {
            matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'fuzzy'; break;
          }
        }
      }
    }

    // Layer 4: Full Text Semantic Scan
    if (!matchedTopic && q.rawText) {
      const qLower = q.rawText.toLowerCase();
      for (const [tName, tData] of Object.entries(ontology)) {
        if (qLower.includes(tName.toLowerCase()) || qLower.includes(tData.exactNorm.toLowerCase())) {
          matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'semantic_scan'; break;
        }
        if (tData.aliases.some(a => qLower.includes(a.toLowerCase()))) {
          matchedTopic = tName; matchedUnit = tData.unitName; matchType = 'semantic_scan'; break;
        }
      }
    }

    // Layer 5: Unmapped
    if (matchedTopic) {
      if (matchType === 'exact') mappingConfidence.exactMatches++;
      if (matchType === 'alias') mappingConfidence.aliasMatches++;
      if (matchType === 'fuzzy') mappingConfidence.fuzzyMatches++;
      if (matchType === 'semantic_scan') mappingConfidence.semanticScanMatches++;
      
      const unitNode = knowledgeGraph.units.find(u => u.name === matchedUnit);
      if (unitNode) {
        let topicNode = unitNode.topics.find(t => t.name === matchedTopic);
        if (!topicNode) {
          topicNode = { id: matchedTopic, name: matchedTopic, questions: [] };
          unitNode.topics.push(topicNode);
        }
        topicNode.questions.push({ year: q.year, marks: q.marks || 5 });
      }
    } else {
      mappingConfidence.unmapped++;
    }
  });

  if (mappingConfidence.total > 0) {
    const mapped = mappingConfidence.exactMatches + mappingConfidence.aliasMatches + mappingConfidence.fuzzyMatches + mappingConfidence.semanticScanMatches;
    mappingConfidence.overall = Math.round((mapped / mappingConfidence.total) * 100);
  }

  // Phase 3: Weightage Computation
  const currentYear = new Date().getFullYear();
  let maxUnitFreq = 0;
  let maxTopicFreq = 0;

  knowledgeGraph.units.forEach(u => {
    let uFreq = 0;
    u.topics.forEach(t => {
      let tMarks = 0;
      let tFreq = 0;
      let tYears = new Set();
      let tLastSeen = 0;
      t.questions.forEach(q => {
        tMarks += q.marks;
        tFreq++;
        tYears.add(q.year);
        if (q.year > tLastSeen) tLastSeen = q.year;
      });
      t.totalMarks = tMarks;
      t.frequency = tFreq;
      t.yearsCovered = tYears.size;
      t.lastSeen = tLastSeen;
      
      uFreq += tFreq;
      if (tFreq > maxTopicFreq) maxTopicFreq = tFreq;
    });
    if (uFreq > maxUnitFreq) maxUnitFreq = uFreq;
  });

  const grandTotalMarks = knowledgeGraph.units.reduce((acc, u) => acc + u.topics.reduce((acc2, t) => acc2 + t.totalMarks, 0), 0);

  knowledgeGraph.units.forEach(u => {
    let uMarks = 0; let uFreq = 0; let uYears = new Set(); let uLastSeen = 0;
    u.topics.forEach(t => {
      uMarks += t.totalMarks;
      uFreq += t.frequency;
      t.questions.forEach(q => uYears.add(q.year));
      if (t.lastSeen > uLastSeen) uLastSeen = t.lastSeen;
      
      const normWeight = grandTotalMarks > 0 ? (t.totalMarks / grandTotalMarks) : 0;
      const normFreq = maxTopicFreq > 0 ? (t.frequency / maxTopicFreq) : 0;
      const normRecency = Math.max(0, 1 - (currentYear - t.lastSeen) / 10);
      
      let decayedMastery = 0;
      let decayedConfidence = 0;
      
      if (masteryProfile && masteryProfile.topics.has(t.name)) {
        const tData = masteryProfile.topics.get(t.name);
        const daysSinceReview = (Date.now() - new Date(tData.lastReviewed || Date.now()).getTime()) / (1000 * 3600 * 24);
        const decayFactor = Math.max(0.5, 1 - (daysSinceReview * 0.01));
        decayedMastery = (tData.mastery || 0) * decayFactor;
        decayedConfidence = (tData.confidence || 0) * decayFactor;
      }
      
      // Dynamic priority: Weightage * Recurrence * RecencyFactor * (100 - Mastery)
      const weightage = normWeight * 100;
      t.priorityScore = Math.round(weightage * t.frequency * normRecency * Math.max(1, (100 - decayedMastery)));
      t.predictionConfidence = t.frequency > 0 ? Math.round((normFreq * 0.6 + normRecency * 0.4) * 100) : 0;
    });

    u.totalMarks = uMarks;
    u.frequency = uFreq;
    u.yearsCovered = uYears.size;
    u.weightagePercent = grandTotalMarks > 0 ? Math.round((uMarks / grandTotalMarks) * 100) : 0;
    
    const uNormWeight = u.weightagePercent; // Already a percentage (0-100)
    const uNormFreq = uFreq;
    const uNormRecency = Math.max(0, 1 - (currentYear - uLastSeen) / 10);
    
    // Average mastery of topics in this unit
    let uMastery = 0;
    if (u.topics.length > 0 && masteryProfile) {
      const topicDatas = u.topics.map(t => masteryProfile.topics.get(t.name)).filter(Boolean);
      if (topicDatas.length > 0) {
        uMastery = topicDatas.reduce((acc, td) => acc + (td.mastery || 0), 0) / topicDatas.length;
      }
    }
    
    u.priorityScore = Math.round(uNormWeight * uNormFreq * uNormRecency * Math.max(1, (100 - uMastery)));
    u.priorityFactors = {
      weightage: Math.round(uNormWeight),
      frequency: Math.round(uNormFreq),
      recency: Math.round(uNormRecency * 100)
    };
  });

  const unitWeightage = knowledgeGraph.units.map(u => ({
    unitName: u.name,
    totalMarks: u.totalMarks,
    frequency: u.frequency,
    yearsCovered: u.yearsCovered,
    weightagePercent: u.weightagePercent,
    priorityScore: u.priorityScore,
    priorityFactors: u.priorityFactors
  }));

  return { knowledgeGraph, mappingConfidence, unitWeightage };
}

router.post('/unified-analysis', authMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { documentIds } = req.body;
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ success: false, error: 'An array of documentIds is required' });
    }

    const docs = await DocumentState.find({ _id: { $in: documentIds } });
    if (docs.length === 0) {
      return res.status(404).json({ success: false, error: 'No documents found' });
    }

    const syllabusDocs = docs.filter(d => (d.metadata?.detectedType || '').toUpperCase() === 'SYLLABUS');
    const pyqDocs = docs.filter(d => (d.metadata?.detectedType || '').toUpperCase() === 'PYQ');

    if (syllabusDocs.length === 0 || pyqDocs.length === 0) {
      return res.json({ success: false, error: 'Requires at least one SYLLABUS and one PYQ' });
    }

    // Mathematical Core
    const userId = req.user.id;
    const masteryProfile = await MasteryProfile.findOne({ userId, workspaceId });
    
    const { knowledgeGraph, mappingConfidence, unitWeightage } = hybridDeterministicMapper(pyqDocs, syllabusDocs, masteryProfile);

    let predictions = {};
    let studyPlan = {};
    let predictionTelemetry = null;

    try {
      const response = await ModelRouter.execute('PREDICTION', { knowledgeGraph, unitWeightage });
      predictions = response.data.predictions;
      studyPlan = response.data.studyPlan;
      predictionTelemetry = response.telemetry;
    } catch (err) {
      console.warn('Prediction Engine Error:', err.message);
      // Fallback: We still have the deterministic math!
      predictions = {
        eightMark: ["(AI Failed) - Please try again."],
        fiveMark: ["(AI Failed) - Check unit weightages for hints."],
        twoMark: ["(AI Failed)"]
      };
      studyPlan = {
        estimatedHours: unitWeightage.reduce((acc, u) => acc + Math.round((u.weightagePercent / 100) * 40), 0) || 10,
        plan: [{ day: 1, focus: "System Recovery", reason: "Both prediction models failed or were rate-limited. Deterministic graph is still 100% accurate." }]
      };
    }

    const analysisPayload = {
      status: 'success',
      versions: {
        graphVersion: "1.2",
        mappingEngineVersion: "2.1",
        predictionVersion: predictionTelemetry ? "3.0_gemini" : "3.0_fallback"
      },
      mappingConfidence,
      knowledgeGraph,
      unitWeightage,
      predictions,
      studyPlan,
      telemetry: { prediction: predictionTelemetry }
    };

    // Auto-save to workspace
    await WorkspaceService.updateWorkspace(workspaceId, userId, {
      analysisResult: { knowledgeGraph, mappingConfidence, unitWeightage },
      predictions,
      studyPlan
    });

    res.json({
      success: true,
      data: analysisPayload
    });

  } catch (error) {
    console.error('Gemini Agent Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to execute unified analysis agent' });
  }
});

export default router;

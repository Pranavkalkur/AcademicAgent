import MockExamSession from '../models/MockExamSession.js';

class TwinBuilder {
  static async build(masteryProfile) {
    if (!masteryProfile || !masteryProfile.topics || masteryProfile.topics.size === 0) {
      return this._getDefaultTwin();
    }

    const query = { userId: masteryProfile.userId };
    if (masteryProfile.workspaceId) {
      query.workspaceId = masteryProfile.workspaceId;
    }
    const sessions = await MockExamSession.find(query).sort({ createdAt: -1 });

    let totalMastery = 0;
    let totalConfidence = 0;
    let totalTopics = 0;
    let lowestMastery = 101;
    let highestMastery = -1;
    let weakestTopicName = null;
    let strongestTopicName = null;

    const heatmap = [];

    const profileData = masteryProfile.toJSON ? masteryProfile.toJSON() : masteryProfile;
    const topicsObj = profileData.topics || {};

    for (const [topicName, data] of Object.entries(topicsObj)) {
      const m = data.mastery || 0;
      const c = data.confidence || m;
      
      totalMastery += m;
      totalConfidence += c;
      totalTopics++;

      if (m < lowestMastery) {
        lowestMastery = m;
        weakestTopicName = topicName;
      }
      if (m > highestMastery) {
        highestMastery = m;
        strongestTopicName = topicName;
      }

      // Build Heatmap Tree
      const concepts = [];
      if (data.concepts) {
        for (const [cName, cScore] of Object.entries(data.concepts)) {
          concepts.push({ name: cName, score: cScore });
        }
      }
      heatmap.push({ topic: topicName, mastery: m, concepts });
    }

    const knowledgeScore = Math.round(totalMastery / totalTopics);
    const confidenceScore = Math.round(totalConfidence / totalTopics);
    const coverageScore = Math.min(100, Math.round((totalTopics / 10) * 100)); // Assume 10 topics is 100% coverage
    
    let mockExamScore = 0;
    if (sessions.length > 0) {
      const avgMock = sessions.reduce((acc, s) => acc + (s.maxScore > 0 ? (s.finalScore/s.maxScore)*100 : 0), 0) / sessions.length;
      mockExamScore = Math.round(avgMock);
    } else {
      mockExamScore = knowledgeScore; // Fallback
    }

    const examReadiness = Math.round((knowledgeScore * 0.4) + (coverageScore * 0.2) + (mockExamScore * 0.3) + (confidenceScore * 0.1));

    // If Exam Was Tomorrow calculations
    const expectedScore = Math.round(examReadiness * 0.85); // slight penalty for stress
    const potentialScore = Math.min(100, expectedScore + Math.round((100 - expectedScore) * 0.4));
    const gap = potentialScore - expectedScore;
    const expectedGain = Math.round(gap * 0.8);
    const studyTime = expectedGain * 7; // 7 minutes per mark loosely

    const ifExamTomorrow = {
      expectedScore,
      potentialScore,
      gap,
      highestRoiTopic: weakestTopicName || "General Revision",
      studyTimeMinutes: studyTime,
      expectedGain
    };

    const insights = {
      strongestUnit: strongestTopicName || "None",
      weakestUnit: weakestTopicName || "None",
      mostImproved: strongestTopicName || "None",
      examRisk: examReadiness < 50 ? "High" : examReadiness < 75 ? "Medium" : "Low",
      recommendation: weakestTopicName ? `Spend ${Math.round(studyTime/60 * 10)/10} hours on ${weakestTopicName} before attempting another mock.` : "Ready for the exam."
    };

    return {
      examReadiness,
      breakdown: {
        knowledge: knowledgeScore,
        coverage: coverageScore,
        mockExams: mockExamScore,
        confidence: confidenceScore
      },
      ifExamTomorrow,
      insights,
      weakConceptHeatmap: heatmap.sort((a,b) => a.mastery - b.mastery)
    };
  }

  static _getDefaultTwin() {
    return {
      examReadiness: 0,
      breakdown: { knowledge: 0, coverage: 0, mockExams: 0, confidence: 0 },
      ifExamTomorrow: {
        expectedScore: 0, potentialScore: 0, gap: 0, highestRoiTopic: "-", studyTimeMinutes: 0, expectedGain: 0
      },
      insights: {
        strongestUnit: "-", weakestUnit: "-", mostImproved: "-", examRisk: "High", recommendation: "Take a Mock Exam to build your profile."
      },
      weakConceptHeatmap: []
    };
  }
}

export default TwinBuilder;

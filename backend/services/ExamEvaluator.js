import ModelRouter from './ModelRouter.js';
import fs from 'fs';
import path from 'path';

class ExamEvaluator {
  constructor() {
    this.conceptTrees = {};
    try {
      const dataPath = path.join(process.cwd(), 'data', 'conceptTrees.json');
      if (fs.existsSync(dataPath)) {
        this.conceptTrees = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (e) {
      console.warn("Failed to load conceptTrees.json:", e.message);
    }
  }

  async evaluateAnswer(topic, questionText, answerText, marks) {
    // 1. Get concepts from Tree or default to topic
    let expectedConcepts = this.conceptTrees[topic] || [topic];

    try {
      const response = await ModelRouter.execute('MOCK_EVALUATION', {
        topic,
        questionText,
        answerText,
        marks,
        expectedConcepts
      });

      return response.data;
    } catch (error) {
      console.error("[ExamEvaluator] Evaluation Failed via ModelRouter:", error);
      // Fallback
      return {
        marksAwarded: Math.round(marks * 0.5),
        feedback: "Could not fully evaluate answer due to system load. Partial credit awarded.",
        conceptCoverage: {}
      };
    }
  }
}

export default new ExamEvaluator();

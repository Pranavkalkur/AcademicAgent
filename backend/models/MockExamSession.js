import mongoose from 'mongoose';

const mockExamSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  durationSeconds: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 }, // Should be 24 (2x2 + 2x5 + 1x10)
  unitScores: {
    type: Map,
    of: {
      marks: { type: Number, default: 0 },
      maxMarks: { type: Number, default: 0 }
    }
  },
  questions: [{
    questionId: String,
    topic: String,
    unitName: String,
    text: String,
    marks: Number,
    questionType: String,
    answer: String,
    score: Number,
    feedback: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MockExamSession', mockExamSessionSchema);

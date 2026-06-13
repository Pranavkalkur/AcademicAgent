import mongoose from 'mongoose';

const reportSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  readiness: { type: Number, required: true },
  knowledgeCoverage: { type: Number, default: 0 },
  mockExamAverage: { type: Number, default: 0 },
  topicCompletion: { type: Number, default: 0 },
  vivaPerformance: { type: Number, default: 0 },
  expectedScoreRange: { type: String },
  mostLikelyGrade: { type: String },
  biggestRisk: { type: String },
  potentialGain: { type: Number },
  studyTimeNeeded: { type: Number },
  professorSummary: { type: String },
  snapshotData: { type: mongoose.Schema.Types.Mixed } // Store full JSON for history
}, { timestamps: true });

export default mongoose.model('ReportSnapshot', reportSnapshotSchema);

import mongoose from 'mongoose';

const VivaSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  transcript: { type: String },
  technicalScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  latencySeconds: { type: Number, default: 0 },
  silenceRatio: { type: Number, default: 0 },
  fillerWords: { type: Number, default: 0 },
  conceptCoverage: { type: Map, of: Number, default: {} },
  strongConcepts: [{ type: String }],
  weakConcepts: [{ type: String }],
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('VivaSession', VivaSessionSchema);

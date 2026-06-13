import mongoose from 'mongoose';

const MasteryProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  topics: {
    type: Map,
    of: new mongoose.Schema({
      mastery: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      lastReviewed: { type: Date, default: Date.now },
      concepts: { type: Map, of: Number, default: {} }
    }, { _id: false }),
    default: {}
  },
  askedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionTemplate' }],
  updatedAt: { type: Date, default: Date.now }
});

MasteryProfileSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.model('MasteryProfile', MasteryProfileSchema);

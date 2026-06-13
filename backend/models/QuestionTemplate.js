import mongoose from 'mongoose';

const questionTemplateSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'basic' },
  question: { type: String, required: true },
  tags: [{ type: String }],
  expectedConcepts: [{ type: mongoose.Schema.Types.Mixed }],
  source: { type: String, enum: ['pyq', 'system', 'llm'], default: 'system' }
}, { timestamps: true });

export default mongoose.model('QuestionTemplate', questionTemplateSchema);

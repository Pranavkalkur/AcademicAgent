import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // JWT User ID
  name: { type: String, required: true },
  subjectCode: { type: String },
  semester: { type: Number },
  version: { type: Number, default: 1 },
  
  theme: {
    color: { type: String, default: '#4CAF50' },
    icon: { type: String, default: '📘' }
  },

  stats: {
    documentCount: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    topicCount: { type: Number, default: 0 },
    readiness: { type: Number, default: 0 },
    lastExamScore: { type: Number, default: 0 }
  },

  status: { type: String, default: 'active' }, // active, analyzing, failed
  
  analysisResult: { type: mongoose.Schema.Types.Mixed },
  studyPlan: { type: mongoose.Schema.Types.Mixed },
  predictions: { type: mongoose.Schema.Types.Mixed },
  academicTwin: { type: mongoose.Schema.Types.Mixed },

  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  lastOpenedAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt timestamp
WorkspaceSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model('Workspace', WorkspaceSchema);

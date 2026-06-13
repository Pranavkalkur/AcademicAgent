import mongoose from 'mongoose';

const DocumentStateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  type: {
    type: String,
    enum: ['syllabus', 'pyq', 'codebase_context'],
    required: true
  },
  state: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  originalFilename: String,
  parsedText: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const DocumentState = mongoose.model('DocumentState', DocumentStateSchema);
export default DocumentState;

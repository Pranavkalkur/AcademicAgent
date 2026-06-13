import Workspace from '../models/Workspace.js';
import DocumentState from '../models/DocumentState.js';
import MasteryProfile from '../models/MasteryProfile.js';
import TwinBuilder from './TwinBuilder.js';

class WorkspaceService {
  async updateWorkspace(workspaceId, userId, updates) {
    const workspace = await Workspace.findOne({ _id: workspaceId, userId, deleted: false });
    if (!workspace) throw new Error('Workspace not found or access denied');
    
    // Apply updates
    Object.assign(workspace, updates);
    workspace.version += 1;
    
    // Update stats before saving
    await this._recomputeStats(workspace);
    
    await workspace.save();
    return workspace;
  }
  
  async _recomputeStats(workspace) {
    const docCount = await DocumentState.countDocuments({ workspaceId: workspace._id });
    
    let topicCount = 0;
    if (workspace.analysisResult?.knowledgeGraph?.units) {
      workspace.analysisResult.knowledgeGraph.units.forEach(u => {
        topicCount += (u.topics || []).length;
      });
    }
    
    workspace.stats = workspace.stats || {};
    workspace.stats.documentCount = docCount;
    workspace.stats.topicCount = topicCount;
    
    // Readiness from Academic Twin
    if (workspace.academicTwin?.examReadiness) {
      workspace.stats.readiness = workspace.academicTwin.examReadiness;
    }
  }

  async syncTwin(workspaceId, userId) {
    const profile = await MasteryProfile.findOne({ workspaceId, userId });
    if (profile) {
      const twinData = await TwinBuilder.build(profile);
      await this.updateWorkspace(workspaceId, userId, { academicTwin: twinData });
    }
  }

  async cloneWorkspace(workspaceId, userId, newName) {
    const source = await Workspace.findOne({ _id: workspaceId, userId, deleted: false });
    if (!source) throw new Error('Source workspace not found');
    
    const cloneData = source.toObject();
    delete cloneData._id;
    delete cloneData.__v;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    
    cloneData.name = newName || `${source.name} (Clone)`;
    cloneData.version = 1;
    
    const newWorkspace = new Workspace(cloneData);
    await newWorkspace.save();
    return newWorkspace;
  }
}

export default new WorkspaceService();

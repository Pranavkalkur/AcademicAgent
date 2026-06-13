import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import jwt from 'jsonwebtoken';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-agent');
    
    // Find a user and workspace
    const user = await User.findOne();
    if (!user) throw new Error("No users found in database");
    
    const workspace = await Workspace.findOne({ userId: user._id });
    if (!workspace) throw new Error("No workspaces found for user");
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    
    console.log(`\n--- PROVING REPORT ARCHITECT ROUTE ---`);
    console.log(`Endpoint: GET /api/workspaces/${workspace._id}/report`);
    
    const res = await fetch(`http://localhost:5000/api/workspaces/${workspace._id}/report`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    console.log(`\nHTTP Status: ${res.status}`);
    if (res.status === 200 && data.success) {
      console.log(`Response Success: true`);
      console.log(`Report Snapshot Readiness: ${data.data.snapshot.readiness}%`);
      console.log(`Professor Summary: ${data.data.snapshot.professorSummary.substring(0, 50)}...`);
    } else {
      console.log("Error Response:", data);
    }
    
  } catch (err) {
    console.error("Test Script Error:", err);
  } finally {
    mongoose.disconnect();
  }
})();

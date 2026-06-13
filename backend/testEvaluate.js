import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import ModelRouter from './services/ModelRouter.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-agent');
    
    // Simulate req.body
    const topic = 'Raspberry Pi';
    const question = 'What is Raspberry Pi?';

    console.log("Calling ModelRouter for VIVA_FEEDBACK...");
    const feedbackPayload = await ModelRouter.execute('VIVA_FEEDBACK', {
      topic,
      question,
      coverageScore: 100,
      matchedConcepts: ['Microcomputer', 'Linux', 'GPIO'],
      missedConcepts: []
    });

    console.log("Feedback Payload:", JSON.stringify(feedbackPayload, null, 2));

    console.log("SUCCESS");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
})();

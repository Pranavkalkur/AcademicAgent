import 'dotenv/config';
import mongoose from 'mongoose';
import DocumentState from '../models/DocumentState.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-agent');
  const docs = await DocumentState.find().lean();
  console.log("TOTAL DOCS:", docs.length);
  docs.forEach(d => {
    console.log(`- ID: ${d._id}`);
    console.log(`  type: ${d.type}`);
    console.log(`  metadata.detectedType: ${d.metadata?.detectedType}`);
    if (d.metadata?.extractedStructure) {
       console.log(`  Keys in extractedStructure: ${Object.keys(d.metadata.extractedStructure).join(', ')}`);
       console.log(`  extractedStructure.detectedType: ${d.metadata.extractedStructure.detectedType}`);
    }
  });
  process.exit(0);
}

check();

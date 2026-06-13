import mongoose from 'mongoose';
import MasteryProfile from './models/MasteryProfile.js';
import MockExamSession from './models/MockExamSession.js';
import VivaSession from './models/VivaSession.js';
import DocumentState from './models/DocumentState.js';

const MONGODB_URI = 'mongodb+srv://temptemp:Pranav%40123@cluster0.8tmvr9l.mongodb.net/academic-agent?retryWrites=true&w=majority&appName=Cluster0';

async function clear() {
  await mongoose.connect(MONGODB_URI);
  await MasteryProfile.deleteMany({});
  await MockExamSession.deleteMany({});
  await VivaSession.deleteMany({});
  await DocumentState.deleteMany({});
  console.log("Database cleared");
  process.exit(0);
}

clear();

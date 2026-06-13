import QuestionTemplate from '../models/QuestionTemplate.js';
import MasteryProfile from '../models/MasteryProfile.js';
import ModelRouter from './ModelRouter.js';

class QuestionBank {
  async getQuestionForTopic(topic, aliases, userId, workspaceId) {
    let profile = await MasteryProfile.findOne({ userId, workspaceId });
    if (!profile) {
      profile = new MasteryProfile({ userId, workspaceId, topics: {}, askedQuestions: [] });
      await profile.save();
    }

    const topicData = profile.topics.get(topic) || { mastery: 0 };
    const mastery = topicData.mastery || 0;

    let difficulty = 'basic';
    let marks = 2;
    if (mastery >= 40 && mastery < 75) {
      difficulty = 'intermediate';
      marks = 5;
    } else if (mastery >= 75) {
      difficulty = 'advanced';
      marks = 8;
    }

    // 1. Fetch unasked questions for topic + difficulty
    const askedIds = profile.askedQuestions || [];
    let availableQuestions = await QuestionTemplate.find({
      topic,
      difficulty,
      _id: { $nin: askedIds }
    }).sort({ source: 1 });

    // Better sort
    const pyqQuestions = availableQuestions.filter(q => q.source === 'pyq');
    const systemQuestions = availableQuestions.filter(q => q.source === 'system');
    const llmQuestions = availableQuestions.filter(q => q.source === 'llm');

    let selectedQuestion = pyqQuestions[0] || systemQuestions[0] || llmQuestions[0];

    // 2. If NO question found, generate via LLM (ModelRouter)
    if (!selectedQuestion) {
      console.log(`[QuestionBank] No cached question found for ${topic} at ${difficulty} level. Generating...`);
      
      const newQuestionText = this._generateDeterministicQuestion(topic, difficulty);
      const expectedConcepts = this._generateDeterministicConcepts(topic, aliases);
      
      selectedQuestion = new QuestionTemplate({
        topic,
        difficulty,
        question: newQuestionText,
        expectedConcepts,
        source: 'llm'
      });
      await selectedQuestion.save();
    }

    // Embed marks context dynamically
    selectedQuestion = selectedQuestion.toObject();
    selectedQuestion.marks = marks;

    return selectedQuestion;
  }

  _generateDeterministicQuestion(topic, difficulty) {
    if (difficulty === 'basic') return `Define ${topic} and list its main components.`;
    if (difficulty === 'intermediate') return `Explain how ${topic} works and describe a practical use case.`;
    return `Compare and contrast ${topic} with alternative approaches and analyze its limitations.`;
  }

  _generateDeterministicConcepts(topic, aliases) {
    const coreKeywords = [topic.toLowerCase()];
    if (aliases && aliases.length > 0) {
      coreKeywords.push(...aliases.map(a => a.toLowerCase()));
    }
    topic.split(' ').filter(w => w.length > 3).forEach(w => coreKeywords.push(w.toLowerCase()));

    return [
      { name: "Core Definition", keywords: coreKeywords },
      { name: "Mechanism / Components", keywords: ["work", "use", "process", "function", "component", "part", "element", "layer"] },
      { name: "Application / Use Case", keywords: ["example", "real world", "apply", "scenario", "advantage", "benefit", "limitation"] }
    ];
  }

  async markQuestionAsked(userId, workspaceId, questionId) {
    await MasteryProfile.updateOne(
      { userId, workspaceId },
      { $addToSet: { askedQuestions: questionId } }
    );
  }
}

export default new QuestionBank();

import MasteryProfile from '../models/MasteryProfile.js';
import DocumentState from '../models/DocumentState.js';

class MockExamGenerator {
  async generateExam(userId, workspaceId) {
    const profile = await MasteryProfile.findOne({ userId, workspaceId });
    let weakTopics = [];
    let strongTopics = [];
    
    if (profile && profile.topics) {
      for (const [topic, data] of profile.topics.entries()) {
        if (topic === 'General Review') continue; // Skip dummy chat topics
        if (data.mastery < 50) weakTopics.push(topic);
        else strongTopics.push(topic);
      }
    }

    // Fetch Syllabus to map topics to units
    const syllabus = await DocumentState.findOne({ userId, workspaceId, 'metadata.detectedType': 'SYLLABUS' }).sort({ uploadDate: -1 });
    const unitMap = {};
    if (syllabus?.metadata?.extractedStructure?.syllabusContent) {
      syllabus.metadata.extractedStructure.syllabusContent.forEach(unit => {
        (unit.topics || []).forEach(t => {
          unitMap[t.name] = unit.unitName;
        });
      });
    }

    // Fallback topics if none in profile
    if (weakTopics.length === 0 && strongTopics.length === 0) {
      weakTopics = Object.keys(unitMap);
      
      // If no syllabus, try to pull from PYQs
      if (weakTopics.length === 0) {
        const pyqs = await DocumentState.find({ userId, workspaceId, 'metadata.detectedType': 'PYQ' });
        const pyqTopics = new Set();
        pyqs.forEach(doc => {
          if (doc.metadata?.extractedStructure?.pyqQuestions) {
            doc.metadata.extractedStructure.pyqQuestions.forEach(q => pyqTopics.add(q.topic));
          }
        });
        weakTopics = Array.from(pyqTopics);
      }

      // Absolute fallback if no docs have structure
      if (weakTopics.length === 0) {
         throw new Error('NO_SYLLABUS_UPLOADED');
      }
    }

    // Ensure we have at least 5 topics to sample
    const pool = [...weakTopics, ...strongTopics, ...Object.keys(unitMap)];
    let uniquePool = [...new Set(pool)];
    
    // Shuffle the unique pool so we get different topics each time
    uniquePool = uniquePool.sort(() => Math.random() - 0.5);
    
    const selectedTopics = [];
    for (let i=0; i<5; i++) {
      selectedTopics.push(uniquePool[i % uniquePool.length]);
    }

    const questionTypes = ["Definition", "Explanation", "Comparison", "Application", "Case Study"];
    // Shuffle question types so it's not always 2-mark Definition, 2-mark Explanation, etc.
    const shuffledTypes = questionTypes.sort(() => Math.random() - 0.5);
    
    const questions = [
      { marks: 2, topic: selectedTopics[0], type: shuffledTypes[0] },
      { marks: 2, topic: selectedTopics[1], type: shuffledTypes[1] },
      { marks: 5, topic: selectedTopics[2], type: shuffledTypes[2] },
      { marks: 5, topic: selectedTopics[3], type: shuffledTypes[3] },
      { marks: 10, topic: selectedTopics[4], type: shuffledTypes[4] }
    ];

    const generatedQuestions = questions.map((q, idx) => {
      const unit = unitMap[q.topic] || 'Unknown Unit';
      let text = '';
      switch (q.type) {
        case "Definition": text = `Define ${q.topic} and list its primary components.`; break;
        case "Explanation": text = `Explain the process and significance of ${q.topic}.`; break;
        case "Comparison": text = `Compare and contrast ${q.topic} with traditional alternatives.`; break;
        case "Application": text = `Describe a real-world scenario where ${q.topic} is utilized effectively.`; break;
        case "Case Study": text = `Analyze a hypothetical breach or deployment involving ${q.topic}. What are the key takeaways?`; break;
      }
      return {
        questionId: `mock_${Date.now()}_${idx}`,
        topic: q.topic,
        unitName: unit,
        text,
        marks: q.marks,
        questionType: q.type
      };
    });

    return generatedQuestions;
  }
}

export default new MockExamGenerator();

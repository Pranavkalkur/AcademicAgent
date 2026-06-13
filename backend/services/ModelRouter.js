import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import OpenAI from 'openai';
import RateLimiter from './RateLimiter.js';
import CircuitBreaker from './CircuitBreaker.js';

class ModelRouter {
  constructor() {
    this.gemini = {
      id: 'gemini',
      model: null, // Model instantiated per request to allow key rotation
      limit: parseInt(process.env.GEMINI_RPM_LIMIT || '45', 10) // 15 rpm * 3 keys = 45 rpm
    };
    
    this.glm = {
      id: 'glm',
      client: new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY || '',
        baseURL: 'https://integrate.api.nvidia.com/v1',
      }),
      limit: parseInt(process.env.GLM_RPM_LIMIT || '60', 10)
    };
  }

  _getGeminiKey() {
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ].filter(k => k && k.trim() !== '' && !k.includes('your_'));
    
    if (keys.length === 0) return '';
    return keys[Math.floor(Math.random() * keys.length)];
  }
  // Capability-based provider selection
  _selectProvider(task) {
    let primary = 'gemini';
    let secondary = 'glm';

    switch (task) {
      case 'CONCEPT_EVALUATION':
      case 'VIVA_FEEDBACK':
      case 'MOCK_EVALUATION':
        primary = 'glm';
        secondary = 'gemini';
        break;
      case 'STRUCTURE_EXTRACTION':
        primary = 'gemini';
        secondary = 'glm';
        break;
      case 'PREDICTION':
      case 'STUDY_PLAN':
      case 'REPORT_SUMMARY':
        primary = 'gemini';
        secondary = 'glm';
        break;
      default:
        primary = 'gemini';
        secondary = 'glm';
    }

    const primaryObj = this[primary];
    const secondaryObj = this[secondary];

    const isPrimaryHealthy = CircuitBreaker.isAvailable(primary) && RateLimiter.isAvailable(primary, primaryObj.limit);
    
    if (isPrimaryHealthy) {
      return { providerId: primary, isFallback: false };
    }

    console.warn(`[ModelRouter] Primary provider ${primary} degraded or near limit. Failing over to ${secondary}.`);
    return { providerId: secondary, isFallback: true };
  }

  // Generic Execution Wrapper
  async execute(task, payload) {
    if (process.env.DEMO_MODE === 'true') {
      console.log(`[ModelRouter] DEMO_MODE active. Returning mock for ${task}`);
      return this._executeDemoMock(task, payload);
    }
    const { providerId, isFallback } = this._selectProvider(task);
    const startTime = Date.now();
    let result = null;
    let fallbackTriggered = isFallback;
    let actualProviderId = providerId;

    try {
      RateLimiter.record(providerId);
      result = await this._runTask(providerId, task, payload);
      CircuitBreaker.recordSuccess(providerId);
    } catch (error) {
      CircuitBreaker.recordFailure(providerId);
      console.warn(`[ModelRouter] ${providerId} failed for ${task}:`, error.message);
      
      // If primary failed, try secondary
      if (!isFallback) {
        fallbackTriggered = true;
        actualProviderId = providerId === 'gemini' ? 'glm' : 'gemini';
        
        console.log(`[ModelRouter] Executing secondary fallback: ${actualProviderId}`);
        RateLimiter.record(actualProviderId);
        try {
          result = await this._runTask(actualProviderId, task, payload);
          CircuitBreaker.recordSuccess(actualProviderId);
        } catch (secondaryError) {
          CircuitBreaker.recordFailure(actualProviderId);
          console.warn(`[ModelRouter] Both providers failed. Secondary error:`, secondaryError);
          
          if (task === 'CONCEPT_EVALUATION') {
             result = { conceptScores: {} }; // Mock zero coverage
             actualProviderId = 'rule_engine';
          } else if (task === 'VIVA_FEEDBACK') {
             result = {
               observation: "AI evaluation temporarily unavailable. (Offline Mode)",
               followUpQuestion: "Please try answering again or move to the next topic."
             };
             actualProviderId = 'rule_engine';
          } else {
            throw new Error(`Both providers failed. Last error: ${secondaryError.message}`);
          }
        }
      } else {
        console.warn(`[ModelRouter] Primary provider failed and no fallback available. Executing Rule Engine Fallback.`);
        if (task === 'CONCEPT_EVALUATION') {
           result = { conceptScores: {} }; // Mock zero coverage
           actualProviderId = 'rule_engine';
        } else if (task === 'VIVA_FEEDBACK') {
           result = {
             observation: "AI evaluation temporarily unavailable. (Offline Mode)",
             followUpQuestion: "Please try answering again or move to the next topic."
           };
           actualProviderId = 'rule_engine';
        } else {
           throw error;
        }
      }
    }

    const processingTimeMs = Date.now() - startTime;
    return {
      data: result,
      telemetry: {
        task,
        providerUsed: actualProviderId,
        fallbackTriggered,
        processingTimeMs
      }
    };
  }

  // Route to specific implementation
  async _runTask(providerId, task, payload) {
    if (task === 'STRUCTURE_EXTRACTION') {
      return providerId === 'gemini' ? await this._geminiExtract(payload) : await this._glmExtract(payload);
    } else if (task === 'PREDICTION' || task === 'STUDY_PLAN') {
      return providerId === 'gemini' ? await this._geminiPredict(payload) : await this._glmPredict(payload);
    } else if (task === 'VIVA_FEEDBACK') {
      return providerId === 'gemini' ? await this._geminiVivaFeedback(payload) : await this._glmVivaFeedback(payload);
    } else if (task === 'CONCEPT_EVALUATION') {
      return providerId === 'gemini' ? await this._geminiConceptEval(payload) : await this._glmConceptEval(payload);
    } else if (task === 'MOCK_EVALUATION') {
      return providerId === 'gemini' ? await this._geminiMockEval(payload) : await this._glmMockEval(payload);
    } else if (task === 'REPORT_SUMMARY') {
      return providerId === 'gemini' ? await this._geminiReportSummary(payload) : await this._glmReportSummary(payload);
    }
    throw new Error(`Unknown task: ${task}`);
  }

  _executeDemoMock(task, payload) {
    let result = {};
    if (task === 'STRUCTURE_EXTRACTION') {
      result = {
        detectedType: "SYLLABUS",
        confidence: 100,
        syllabusContent: []
      };
    } else if (task === 'PREDICTION' || task === 'STUDY_PLAN') {
      result = {
        predictions: {
          eightMark: [{ topic: "Mock 8 Mark", confidence: 90, appeared: [2022], unit: "Unit 1", trend: "up" }],
          fiveMark: [{ topic: "Mock 5 Mark", confidence: 80, appeared: [2021], unit: "Unit 1", trend: "steady" }],
          twoMark: []
        },
        studyPlan: {
          estimatedHours: 10, daysRemaining: 5, plan: [{ day: 1, focus: "Mock Focus", reason: "Demo Mode" }]
        }
      };
    } else if (task === 'REPORT_SUMMARY') {
      result = {
        overallAssessment: "Good progress overall, but needs focus on specific areas.",
        biggestStrength: "Fundamentals",
        biggestWeakness: "Advanced topics",
        expectedScoreRange: "70-80%",
        highestImpactRecommendation: "Focus on mock exams."
      };
    } else if (task === 'VIVA_FEEDBACK') {
      result = {
        observation: "Excellent answer (Demo Mode).",
        followUpQuestion: "Can you explain the mock concept further?"
      };
    } else if (task === 'CONCEPT_EVALUATION') {
      const scores = {};
      (payload.expectedConcepts || []).forEach(c => scores[c] = Math.floor(Math.random() * 50) + 50); // 50-100 random score
      result = { conceptScores: scores };
    } else if (task === 'MOCK_EVALUATION') {
      const scores = {};
      (payload.expectedConcepts || []).forEach(c => scores[c] = Math.floor(Math.random() * 50) + 50);
      result = {
        marksAwarded: Math.round(payload.marks * 0.8),
        feedback: "Good mock answer.",
        conceptCoverage: scores
      };
    }
    
    return {
      data: result,
      telemetry: {
        task,
        providerUsed: 'demo_mock',
        fallbackTriggered: false,
        processingTimeMs: 10
      }
    };
  }

  // --- MODEL SPECIFIC IMPLEMENTATIONS ---

  _getExtractionSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        detectedType: { type: SchemaType.STRING, description: "Must be 'SYLLABUS' or 'PYQ'" },
        confidence: { type: SchemaType.INTEGER },
        syllabusContent: { 
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              unitName: { type: SchemaType.STRING },
              topics: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    aliases: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                  },
                  required: ["name", "aliases"]
                }
              }
            },
            required: ["unitName", "topics"]
          }
        },
        pyqYear: { type: SchemaType.INTEGER },
        pyqQuestions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              questionId: { type: SchemaType.STRING },
              marks: { type: SchemaType.INTEGER },
              rawText: { type: SchemaType.STRING },
              normalizedTopic: { type: SchemaType.STRING }
            }
          }
        }
      },
      required: ["detectedType", "confidence"]
    };
  }

  _getPredictionSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        predictions: {
          type: SchemaType.OBJECT,
          properties: {
            eightMark: { 
              type: SchemaType.ARRAY, 
              items: { 
                type: SchemaType.OBJECT,
                properties: {
                  topic: { type: SchemaType.STRING },
                  confidence: { type: SchemaType.INTEGER },
                  appeared: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
                  unit: { type: SchemaType.STRING },
                  trend: { type: SchemaType.STRING }
                }
              } 
            },
            fiveMark: { 
              type: SchemaType.ARRAY, 
              items: { 
                type: SchemaType.OBJECT,
                properties: {
                  topic: { type: SchemaType.STRING },
                  confidence: { type: SchemaType.INTEGER },
                  appeared: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
                  unit: { type: SchemaType.STRING },
                  trend: { type: SchemaType.STRING }
                }
              } 
            },
            twoMark: { 
              type: SchemaType.ARRAY, 
              items: { 
                type: SchemaType.OBJECT,
                properties: {
                  topic: { type: SchemaType.STRING },
                  confidence: { type: SchemaType.INTEGER },
                  appeared: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
                  unit: { type: SchemaType.STRING },
                  trend: { type: SchemaType.STRING }
                }
              } 
            }
          }
        },
        studyPlan: {
          type: SchemaType.OBJECT,
          properties: {
            estimatedHours: { type: SchemaType.INTEGER },
            daysRemaining: { type: SchemaType.INTEGER },
            plan: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  day: { type: SchemaType.INTEGER },
                  focus: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING }
                }
              }
            }
          }
        }
      }
    };
  }

  _getVivaFeedbackSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        observation: { type: SchemaType.STRING, description: "A short, live professor feedback observing their performance and specifically pointing out missing concepts." },
        followUpQuestion: { type: SchemaType.STRING, description: "A highly targeted question strictly addressing the weakestConcept, if one exists. Keep it short." }
      },
      required: ["observation", "followUpQuestion"]
    };
  }

  _getConceptEvalSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        conceptScores: {
          type: SchemaType.OBJECT,
          description: "A map where key is the concept name and value is a score from 0 to 100 representing how well the concept was covered in the transcript."
        }
      },
      required: ["conceptScores"]
    };
  }

  async _geminiExtract({ filename, text, docType }) {
    const prompt = docType === 'SYLLABUS' 
      ? `You are a strict Academic Preprocessor. Parse the following OCR text from ${filename}, which is confirmed to be a SYLLABUS. 
CRITICAL RULES:
1. 'unitName' MUST be short (e.g., "Unit 1: Security"). NEVER put descriptions in unitName.
2. You MUST extract an array of 'topics' for each unit. If topics are missing, the system will crash.
3. Each topic MUST have a short 'name' and an array of 'aliases' (3-5 semantic keywords).

EXAMPLE OUTPUT FORMAT:
{
  "detectedType": "SYLLABUS",
  "confidence": 100,
  "syllabusContent": [
    {
      "unitName": "Unit 1: Introduction",
      "topics": [
        { "name": "Cybercrime Fundamentals", "aliases": ["Information Security", "origins of cybercrime"] },
        { "name": "Social Engineering", "aliases": ["Cyberstalking", "manipulation", "phishing"] }
      ]
    }
  ]
}

[Document Text]:\n${text.substring(0, 50000)}`
      : `You are a strict Academic Preprocessor. Parse the following OCR text from ${filename}, which is confirmed to be a PYQ (Previous Year Question Paper). \nExtract year and questions, normalizing topics and ensuring marks are captured (default to 5 if not explicitly stated).\n\n[Document Text]:\n${text.substring(0, 50000)}`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: this._getExtractionSchema() }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmExtract({ filename, text, docType }) {
    const prompt = docType === 'SYLLABUS' 
      ? `You are a strict Academic Preprocessor. Parse the following OCR text from ${filename}, which is confirmed to be a SYLLABUS. 
CRITICAL RULES:
1. 'unitName' MUST be short (e.g., "Unit 1: Security"). NEVER put descriptions in unitName.
2. You MUST extract an array of 'topics' for each unit. If topics are missing, the system will crash.
3. Each topic MUST have a short 'name' and an array of 'aliases' (3-5 semantic keywords).

EXAMPLE OUTPUT FORMAT:
{
  "detectedType": "SYLLABUS",
  "confidence": 100,
  "syllabusContent": [
    {
      "unitName": "Unit 1: Introduction",
      "topics": [
        { "name": "Cybercrime Fundamentals", "aliases": ["Information Security", "origins of cybercrime"] },
        { "name": "Social Engineering", "aliases": ["Cyberstalking", "manipulation", "phishing"] }
      ]
    }
  ]
}

[Document Text]:\n${text.substring(0, 50000)}`
      : `You are a strict Academic Preprocessor. Parse the following OCR text from ${filename}, which is confirmed to be a PYQ (Previous Year Question Paper). \nExtract year and questions, normalizing topics and ensuring marks are captured (default to 5 if not explicitly stated).\n\n[Document Text]:\n${text.substring(0, 50000)}`;

    const schemaStr = JSON.stringify(this._getExtractionSchema());
    const systemMessage = `You are a JSON-only API. You MUST return ONLY a valid JSON object matching the requested format perfectly. Do not wrap in \`\`\`json or include markdown. Your output MUST strictly adhere to this exact JSON schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      top_p: 1,
      max_tokens: 4096,
    });

    let rawOutput = completion.choices[0].message.content.trim();
    if (rawOutput.startsWith('```json')) {
      rawOutput = rawOutput.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(rawOutput);
  }

  async _geminiPredict({ knowledgeGraph, unitWeightage }) {
    const prompt = `You are a strict Academic AI. The backend has pre-calculated a 'priorityScore' and 'predictionConfidence' for every Unit and Topic based on deterministic math (weightage * frequency * recency).
Do NOT recalculate these metrics. You MUST strictly follow the 'priorityScore' to rank your Study Plan, acting ONLY as an explainer. 
For Predictions, extract the topics with the highest 'predictionConfidence' and format them precisely matching the requested JSON schema.

[DETERMINISTIC KNOWLEDGE GRAPH]
${JSON.stringify(knowledgeGraph, null, 2)}

[UNIT WEIGHTAGE ANALYTICS]
${JSON.stringify(unitWeightage, null, 2)}`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: this._getPredictionSchema() }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmPredict({ knowledgeGraph, unitWeightage }) {
    const prompt = `You are a strict Academic AI. The backend has pre-calculated a 'priorityScore' and 'predictionConfidence' for every Unit and Topic based on deterministic math (weightage * frequency * recency).
Do NOT recalculate these metrics. You MUST strictly follow the 'priorityScore' to rank your Study Plan, acting ONLY as an explainer. 
For Predictions, extract the topics with the highest 'predictionConfidence' and format them precisely matching the requested JSON schema.

[DETERMINISTIC KNOWLEDGE GRAPH]
${JSON.stringify(knowledgeGraph, null, 2)}

[UNIT WEIGHTAGE ANALYTICS]
${JSON.stringify(unitWeightage, null, 2)}`;

    const schemaStr = JSON.stringify(this._getPredictionSchema());
    const systemMessage = `You are a JSON-only API. You MUST return ONLY a valid JSON object representing predictions and a studyPlan. Do not wrap in \`\`\`json or include markdown. Use the exact schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      top_p: 1,
      max_tokens: 4096,
    });

    let rawOutput = completion.choices[0].message.content.trim();
    if (rawOutput.startsWith('```json')) {
      rawOutput = rawOutput.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(rawOutput);
  }

  async _geminiVivaFeedback({ topic, question, coverageScore, matchedConcepts, missedConcepts }) {
    const prompt = `You are an Adaptive Professor evaluating a student's answer.
Topic: ${topic}
Question: ${question}
Coverage Score: ${coverageScore}%

The student successfully covered these concepts: ${matchedConcepts.join(', ') || 'None'}.
They missed these concepts: ${missedConcepts.join(', ') || 'None'}.

${missedConcepts.length > 0 ? `Generate a short observation pointing out what they missed, and generate EXACTLY ONE targeted follow-up question specifically about one of the missed concepts. Do not ask multi-part questions.` : `The student did well. Acknowledge their strong answer and generate EXACTLY ONE slightly more advanced follow-up question.`}`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this._getVivaFeedbackSchema()
      }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmVivaFeedback({ topic, question, coverageScore, matchedConcepts, missedConcepts }) {
    const prompt = `You are an Adaptive Professor evaluating a student's answer.
Topic: ${topic}
Question: ${question}
Coverage Score: ${coverageScore}%

The student successfully covered these concepts: ${matchedConcepts.join(', ') || 'None'}.
They missed these concepts: ${missedConcepts.join(', ') || 'None'}.

${missedConcepts.length > 0 ? `Generate a short observation pointing out what they missed, and generate EXACTLY ONE targeted follow-up question specifically about one of the missed concepts. Do not ask multi-part questions.` : `The student did well. Acknowledge their strong answer and generate EXACTLY ONE slightly more advanced follow-up question.`}`;

    const schemaStr = JSON.stringify(this._getVivaFeedbackSchema());
    const systemMessage = `You are a JSON-only API. You MUST return ONLY a valid JSON object matching the exact schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async _geminiConceptEval({ transcript, expectedConcepts }) {
    const prompt = `You are an Academic Evaluator. Evaluate the transcript against the following Expected Concepts:
${expectedConcepts.join(', ')}

For each expected concept, assign a score from 0 to 100 based on how thoroughly and accurately it was explained in the transcript.

Transcript: "${transcript}"`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this._getConceptEvalSchema()
      }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmConceptEval({ transcript, expectedConcepts }) {
    const prompt = `You are an Academic Evaluator. Evaluate the transcript against the following Expected Concepts:
${expectedConcepts.join(', ')}

For each expected concept, assign a score from 0 to 100 based on how thoroughly and accurately it was explained in the transcript.

Transcript: "${transcript}"`;

    const schemaStr = JSON.stringify(this._getConceptEvalSchema());
    const systemMessage = `You are a JSON-only API. You MUST return ONLY a valid JSON object matching the exact schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  _getMockEvalSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        marksAwarded: { type: SchemaType.NUMBER },
        feedback: { type: SchemaType.STRING },
        conceptCoverage: { type: SchemaType.OBJECT, description: "Map of concept name to score (0-100)" }
      },
      required: ["marksAwarded", "feedback", "conceptCoverage"]
    };
  }

  async _geminiMockEval({ topic, questionText, answerText, marks, expectedConcepts }) {
    const prompt = `You are an Academic Evaluator.
Topic: ${topic}
Question: ${questionText} (Max Marks: ${marks})
Expected Concepts: ${expectedConcepts.join(', ')}

Student Answer: "${answerText}"

Evaluate the student's answer. Assign a score between 0 and ${marks}.`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: this._getMockEvalSchema() }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmMockEval({ topic, questionText, answerText, marks, expectedConcepts }) {
    const prompt = `You are an Academic Evaluator.
Topic: ${topic}
Question: ${questionText} (Max Marks: ${marks})
Expected Concepts: ${expectedConcepts.join(', ')}

Student Answer: "${answerText}"

Evaluate the student's answer. Assign a score between 0 and ${marks}.`;

    const schemaStr = JSON.stringify(this._getMockEvalSchema());
    const systemMessage = `You are a strict JSON-only API. You must output ONLY a JSON object matching this schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let rawOutput = completion.choices[0].message.content.trim();
    if (rawOutput.startsWith('```json')) rawOutput = rawOutput.replace(/^```json/, '').replace(/```$/, '').trim();
    return JSON.parse(rawOutput);
  }

  _getReportSummarySchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        overallAssessment: { type: SchemaType.STRING },
        biggestStrength: { type: SchemaType.STRING },
        biggestWeakness: { type: SchemaType.STRING },
        expectedScoreRange: { type: SchemaType.STRING },
        highestImpactRecommendation: { type: SchemaType.STRING }
      },
      required: ["overallAssessment", "biggestStrength", "biggestWeakness", "expectedScoreRange", "highestImpactRecommendation"]
    };
  }

  async _geminiReportSummary(payload) {
    const prompt = `Act as a university professor.

Analyze the student's data for subject: ${payload.subject}
- Current readiness: ${payload.readiness}%
- Strong topics: ${payload.strongTopics.join(', ')}
- Weak topics: ${payload.weakTopics.join(', ')}
- Mock exam performance: Average ${payload.mockExamAverage}%, Best ${payload.bestScore}%
- Viva performance: Average ${payload.vivaAverage}%
- Predicted exam questions: ${payload.predictedQuestions.map(q => q.topic).join(', ')}

Return:
1. Overall assessment
2. Biggest strength
3. Biggest weakness
4. Expected score range (e.g. "68-75 Marks")
5. One highest impact recommendation

Maximum 150 words total.`;

    const model = new GoogleGenerativeAI(this._getGeminiKey()).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", responseSchema: this._getReportSummarySchema() }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async _glmReportSummary(payload) {
    const prompt = `Act as a university professor.

Analyze the student's data for subject: ${payload.subject}
- Current readiness: ${payload.readiness}%
- Strong topics: ${payload.strongTopics.join(', ')}
- Weak topics: ${payload.weakTopics.join(', ')}
- Mock exam performance: Average ${payload.mockExamAverage}%, Best ${payload.bestScore}%
- Viva performance: Average ${payload.vivaAverage}%
- Predicted exam questions: ${payload.predictedQuestions.map(q => q.topic).join(', ')}

Return:
1. Overall assessment
2. Biggest strength
3. Biggest weakness
4. Expected score range (e.g. "68-75 Marks")
5. One highest impact recommendation

Maximum 150 words total.`;

    const schemaStr = JSON.stringify(this._getReportSummarySchema());
    const systemMessage = `You are a strict JSON-only API. You must output ONLY a JSON object matching this schema: ${schemaStr}`;

    const completion = await this.glm.client.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    let rawOutput = completion.choices[0].message.content.trim();
    if (rawOutput.startsWith('```json')) rawOutput = rawOutput.replace(/^```json/, '').replace(/```$/, '').trim();
    return JSON.parse(rawOutput);
  }
}

export default new ModelRouter();

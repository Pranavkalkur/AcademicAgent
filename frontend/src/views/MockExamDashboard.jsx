import React, { useState, useEffect, useContext } from 'react';
import { Play, Check, ChevronRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import { WorkspaceContext } from '../context/WorkspaceContext';

export default function MockExamDashboard() {
  const { activeWorkspace } = useContext(WorkspaceContext);
  const [twin, setTwin] = useState(null);
  
  // Exam State
  const [examStatus, setExamStatus] = useState('idle'); // idle, active, evaluating, results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examStartTime, setExamStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [examResults, setExamResults] = useState(null);

  useEffect(() => {
    fetchTwin();
  }, []);

  useEffect(() => {
    let interval;
    if (examStatus === 'active') {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - examStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStatus, examStartTime]);

  const fetchTwin = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await apiFetch(`/api/workspaces/${activeWorkspace._id}/viva/twin`);
      const payload = await res.json();
      if (payload.success) setTwin(payload.data);
    } catch (err) {
      console.error('Failed to fetch Twin', err);
    }
  };

  const startExam = async () => {
    setExamStatus('evaluating');
    try {
      const res = await apiFetch(`/api/workspaces/${activeWorkspace._id}/mock-exam/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const payload = await res.json();
      if (payload.success) {
        setQuestions(payload.data.questions);
        setAnswers({});
        setExamStartTime(Date.now());
        setElapsedTime(0);
        setExamStatus('active');
      } else {
        if (payload.error === 'NO_SYLLABUS_UPLOADED') {
          setExamStatus('no_syllabus');
        } else {
          setExamStatus('idle');
        }
      }
    } catch (err) {
      console.error("Failed to generate exam", err);
      setExamStatus('idle');
    }
  };

  const submitExam = async () => {
    setExamStatus('evaluating');
    
    const submissionData = questions.map(q => ({
      ...q,
      answer: answers[q.questionId] || ''
    }));

    try {
      const res = await apiFetch(`/api/workspaces/${activeWorkspace._id}/mock-exam/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationSeconds: elapsedTime,
          answers: submissionData
        })
      });
      const payload = await res.json();
      if (payload.success) {
        setExamResults(payload.data);
        setExamStatus('results');
        fetchTwin(); // Refresh the twin metrics
      }
    } catch (err) {
      console.error("Failed to evaluate exam", err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const renderProgressBar = (percentage) => {
    const filledCount = Math.round(percentage / 10);
    const emptyCount = 10 - filledCount;
    return (
      <span className="font-mono">
        {'█'.repeat(filledCount)}{'░'.repeat(emptyCount)}
      </span>
    );
  };

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center tech-panel">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl italic text-textMain">No Subject Selected</h2>
          <p className="font-mono text-sm text-textMuted max-w-sm mx-auto">Please select a subject to access its Mock Exam simulator.</p>
        </div>
      </div>
    );
  }

  if (!twin) return <div className="p-8 text-textMuted font-mono text-sm">Loading Mock Exam Environment...</div>;

  return (
    <div className="space-y-6 pb-20">
      
      {/* EXAM READINESS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-deck-effect p-6 bg-borderDark/5">
          <h2 className="text-xl font-serif italic text-textMain mb-6">Academic Twin Readiness</h2>
          
          <div className="flex gap-8 items-center mb-6">
            <div className="text-6xl font-mono text-accent">{twin.examReadiness}%</div>
            <div className="flex-1 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-emerald-500">
                <span className="w-24">Knowledge</span>
                <span>{renderProgressBar(twin.breakdown.knowledge)}</span>
                <span className="w-8 text-right">{twin.breakdown.knowledge}%</span>
              </div>
              <div className="flex justify-between items-center text-amber-500">
                <span className="w-24">Coverage</span>
                <span>{renderProgressBar(twin.breakdown.coverage)}</span>
                <span className="w-8 text-right">{twin.breakdown.coverage}%</span>
              </div>
              <div className="flex justify-between items-center text-blue-500">
                <span className="w-24">Mock Exams</span>
                <span>{renderProgressBar(twin.breakdown.mockExams)}</span>
                <span className="w-8 text-right">{twin.breakdown.mockExams}%</span>
              </div>
              <div className="flex justify-between items-center text-purple-500">
                <span className="w-24">Confidence</span>
                <span>{renderProgressBar(twin.breakdown.confidence)}</span>
                <span className="w-8 text-right">{twin.breakdown.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* IF EXAM WAS TOMORROW */}
        <div className="card-deck-effect p-6 bg-accent/5 border border-accent/20">
          <h2 className="text-xl font-serif italic text-textMain mb-4 border-b border-accent/20 pb-2 flex justify-between">
            If Exam Was Tomorrow
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent flex items-center">
              ROI Engine Active <span className="animate-pulse ml-2">●</span>
            </span>
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-textMuted mb-1">Expected Score</div>
              <div className="text-3xl font-mono text-emerald-500">{twin.ifExamTomorrow.expectedScore} / 100</div>
              <div className="text-xs text-textMuted mt-1 line-through">Potential: {twin.ifExamTomorrow.potentialScore} / 100</div>
            </div>
            <div className="bg-base border border-borderDark/10 p-3 rounded-sm">
              <div className="text-[10px] uppercase tracking-widest text-textMuted mb-1">Highest ROI Topic</div>
              <div className="text-sm font-serif italic text-accent">{twin.ifExamTomorrow.highestRoiTopic}</div>
              <div className="text-xs font-mono mt-2 flex justify-between">
                <span>Time: {twin.ifExamTomorrow.studyTimeMinutes}m</span>
                <span className="text-emerald-500 font-bold">+{twin.ifExamTomorrow.expectedGain} Marks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* INSIGHTS */}
        <div className="card-deck-effect p-6 bg-borderDark/5 col-span-1">
          <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-4">Academic Insights</h3>
          <ul className="space-y-4 text-xs font-mono text-textMain/80">
            <li><span className="text-emerald-500 font-bold">Strongest Unit:</span><br/>{twin.insights.strongestUnit}</li>
            <li><span className="text-rose-500 font-bold">Weakest Unit:</span><br/>{twin.insights.weakestUnit}</li>
            <li><span className="text-amber-500 font-bold">Exam Risk:</span><br/>{twin.insights.examRisk}</li>
            <li className="border-t border-borderDark/10 pt-2 text-textMuted italic">{twin.insights.recommendation}</li>
          </ul>
        </div>

        {/* WEAK CONCEPT HEATMAP */}
        <div className="card-deck-effect p-6 bg-borderDark/5 col-span-2">
          <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-4">Concept Tree Heatmap</h3>
          <div className="space-y-4 h-48 overflow-y-auto pr-2 custom-scrollbar">
            {twin.weakConceptHeatmap.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-xs font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold font-serif text-sm text-textMain">{item.topic}</span>
                  <span className={item.mastery > 75 ? 'text-emerald-500' : 'text-rose-500'}>{item.mastery}%</span>
                </div>
                {item.concepts && item.concepts.length > 0 ? (
                  <div className="pl-4 space-y-1 border-l border-borderDark/20">
                    {item.concepts.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-textMuted">
                        <span>├── {c.name}</span>
                        <span>{c.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-4 text-textMuted/50 italic">├── No sub-concepts recorded</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOCK EXAM SIMULATOR */}
      <div className="card-deck-effect p-8 bg-obsidian text-white border-none shadow-2xl">
        {examStatus === 'idle' && (
          <div className="text-center py-10">
            <h2 className="font-serif text-4xl italic mb-4">Exam Readiness Simulator</h2>
            <p className="text-sm font-mono text-white/50 mb-8 max-w-lg mx-auto">
              Generate a high-stakes 5-question mock exam targeting your weakest concepts and historical PYQ frequencies.
            </p>
            <button onClick={startExam} className="bg-emerald-500 text-obsidian px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center mx-auto gap-2 hover:bg-emerald-400">
              <Play size={16} /> Start Mock Exam
            </button>
          </div>
        )}

        {examStatus === 'evaluating' && (
          <div className="text-center py-20 font-mono text-accent animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            Processing Exam Data...
          </div>
        )}

        {examStatus === 'no_syllabus' && (
          <div className="text-center py-10 border-2 border-dashed border-rose-500/50 bg-rose-500/10 rounded-xl">
            <h2 className="font-serif text-3xl italic mb-4 text-rose-400">Missing Academic Context</h2>
            <p className="text-sm font-mono text-white/70 mb-6 max-w-lg mx-auto">
              We cannot generate a personalized Mock Exam without knowing your syllabus. Please upload a syllabus or study material in the PYQ Engine first.
            </p>
            <button onClick={() => setExamStatus('idle')} className="bg-white/10 text-white px-6 py-2 rounded-sm font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">
              Return
            </button>
          </div>
        )}

        {examStatus === 'active' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="font-serif text-2xl italic">Mock Exam Active</h2>
              <div className="font-mono text-xl text-accent">Elapsed: {formatTime(elapsedTime)}</div>
            </div>

            <div className="space-y-8">
              {questions.map((q, idx) => (
                <div key={q.questionId} className="bg-white/5 p-6 rounded-element border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold bg-white/10 px-2 py-1 rounded-sm">
                      Q{idx + 1} // {q.questionType}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">[{q.marks} Marks]</span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed mb-4">{q.text}</p>
                  <textarea
                    value={answers[q.questionId] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                    placeholder="Draft your answer here..."
                    className="w-full h-32 bg-obsidian border border-white/20 rounded-sm p-4 text-sm font-mono text-white/90 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              ))}
            </div>

            <button onClick={submitExam} className="w-full bg-emerald-500 text-obsidian px-8 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
              <Check size={18} /> Submit Exam
            </button>
          </div>
        )}

        {examStatus === 'results' && examResults && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl italic mb-2 text-emerald-400">Exam Concluded</h2>
              <div className="text-sm font-mono text-white/50">Time Taken: {formatTime(examResults.durationSeconds)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 p-6 rounded-element border border-white/10">
                <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Final Score</h3>
                <div className="text-6xl font-mono text-emerald-500 mb-2">
                  {examResults.finalScore} <span className="text-2xl text-white/30">/ {examResults.maxScore}</span>
                </div>
                <div className="text-sm text-white/50 font-mono">
                  {Math.round((examResults.finalScore / examResults.maxScore) * 100)}% Readiness Impact
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-element border border-white/10">
                <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Exam Risk Map</h3>
                <div className="space-y-3 font-mono text-xs">
                  {Object.entries(examResults.unitScores).map(([unitName, data]) => (
                    <div key={unitName} className="flex justify-between items-center">
                      <span className="w-32 truncate" title={unitName}>{unitName}</span>
                      <span className={data.marks/data.maxMarks > 0.7 ? 'text-emerald-500' : 'text-rose-500'}>
                        {renderProgressBar((data.marks/data.maxMarks)*100)}
                      </span>
                      <span className="w-12 text-right">{data.marks}/{data.maxMarks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Detailed Feedback</h3>
              {examResults.questions.map((q, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-sm border-l-2 border-accent">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-serif italic text-sm text-white/90">Q{idx+1}: {q.topic}</span>
                    <span className="font-mono text-xs font-bold text-accent">{q.score}/{q.marks}</span>
                  </div>
                  <p className="font-mono text-xs text-white/60 leading-relaxed">{q.feedback}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setExamStatus('idle')} className="w-full border border-white/20 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

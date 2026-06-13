import React, { useState, useEffect } from 'react';
import { Terminal, Download, FileText, FileJson, Printer, AlertCircle, RefreshCw, ChevronRight, User } from 'lucide-react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { apiFetch } from '../services/api';

const ReportArchitect = () => {
  const { activeWorkspace } = React.useContext(WorkspaceContext);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${activeWorkspace._id}/report`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error);
      }
      setReportData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      generateReport();
    } else {
      setReportData(null);
      setError(null);
    }
  }, [activeWorkspace]);

  const exportJSON = () => {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `academic_report_${activeWorkspace.subjectCode}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportMarkdown = () => {
    if (!reportData) return;
    const { snapshot, workspaceDetails } = reportData;
    const md = `# Academic Intelligence Report: ${workspaceDetails.name}

## Exam Readiness: ${snapshot.readiness}%
- Expected Score: ${snapshot.expectedScoreRange}
- Most Likely Grade: ${snapshot.mostLikelyGrade}
- Biggest Risk: ${snapshot.biggestRisk}

## Professor Observation
${snapshot.professorSummary}
`;
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `academic_report_${activeWorkspace.subjectCode}.md`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center tech-panel">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl italic text-textMain">No Subject Selected</h2>
          <p className="font-mono text-sm text-textMuted max-w-sm mx-auto">Please select a subject to access Report Architect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col tech-panel overflow-hidden relative">
      {/* Header */}
      <div className="mb-6 border-b-2 border-borderDark/10 pb-6 flex justify-between items-start shrink-0">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-textMuted font-bold block mb-2 flex items-center gap-2">
            <Terminal size={12} /> Module // Synthesis // Workspace ID: {activeWorkspace.subjectCode}
          </span>
          <h2 className="font-serif text-5xl italic font-medium leading-none tracking-tight text-textMain">Report Architect</h2>
          <p className="text-sm text-textMuted mt-4 max-w-xl">Academic Intelligence Report generated from Knowledge Graph, Mock Exams, and Viva Sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="p-2 border border-borderDark/20 rounded-md hover:bg-borderDark/5 hover:text-textMain text-textMuted transition-colors" title="Export PDF">
            <Printer size={16} />
          </button>
          <button onClick={exportMarkdown} className="p-2 border border-borderDark/20 rounded-md hover:bg-borderDark/5 hover:text-textMain text-textMuted transition-colors" title="Export Markdown">
            <FileText size={16} />
          </button>
          <button onClick={exportJSON} className="p-2 border border-borderDark/20 rounded-md hover:bg-borderDark/5 hover:text-textMain text-textMuted transition-colors" title="Export JSON">
            <FileJson size={16} />
          </button>
          <button onClick={generateReport} disabled={loading} className="p-2 bg-textMain text-bgMain rounded-md hover:scale-105 transition-transform disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-12 print:overflow-visible">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-textMuted space-y-4">
            <RefreshCw size={24} className="animate-spin text-textMain" />
            <p className="font-mono text-sm">Synthesizing multi-modal data streams...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-element flex items-start gap-4 text-rose-400">
            <AlertCircle size={24} className="shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-xl italic mb-2">Synthesis Failed</h3>
              <p className="font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        {reportData && !loading && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 1. IF EXAM WAS TOMORROW */}
            <div className="bg-textMain/5 border-2 border-textMain rounded-element p-8">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-textMain mb-6 flex items-center gap-2">
                <AlertCircle size={14} /> If Exam Was Tomorrow
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-textMuted mb-2">Expected Score</p>
                  <p className="font-serif text-3xl italic text-textMain">{reportData.snapshot.expectedScoreRange}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-textMuted mb-2">Likely Grade</p>
                  <p className="font-serif text-3xl italic text-emerald-500">{reportData.snapshot.mostLikelyGrade}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-textMuted mb-2">Biggest Risk</p>
                  <p className="font-serif text-xl italic text-rose-500 line-clamp-2">{reportData.snapshot.biggestRisk}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-textMuted mb-2">Potential Gain</p>
                  <p className="font-serif text-3xl italic text-emerald-500">+{reportData.snapshot.potentialGain}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-textMuted mb-2">Study Time Needed</p>
                  <p className="font-serif text-3xl italic text-textMain">{reportData.snapshot.studyTimeNeeded}h</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 2. SUBJECT SUMMARY */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Subject Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-borderDark/5 pb-2">
                    <span className="font-serif text-lg italic text-textMain">Subject</span>
                    <span className="font-mono text-sm text-textMuted">{reportData.workspaceDetails.name}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-borderDark/5 pb-2">
                    <span className="font-serif text-lg italic text-textMain">Topics</span>
                    <span className="font-mono text-sm text-textMuted">{reportData.workspaceDetails.topicsCount}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-borderDark/5 pb-2">
                    <span className="font-serif text-lg italic text-textMain">PYQs Analysed</span>
                    <span className="font-mono text-sm text-textMuted">{reportData.workspaceDetails.pyqsAnalysed}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-serif text-lg italic text-textMain">Readiness</span>
                    <span className="font-mono text-sm text-textMuted">{reportData.snapshot.readiness}%</span>
                  </div>
                </div>
              </div>

              {/* 3. EXAM READINESS BREAKDOWN */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Exam Readiness Breakdown</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl font-serif italic text-textMain">{reportData.snapshot.readiness}%</div>
                  <div className="flex-1 h-2 bg-borderDark/20 rounded-full overflow-hidden">
                    <div className="h-full bg-textMain" style={{ width: `${reportData.snapshot.readiness}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-mono text-textMuted">
                  <div className="flex justify-between"><span>Knowledge Coverage (40%)</span> <span>{reportData.snapshot.knowledgeCoverage}%</span></div>
                  <div className="flex justify-between"><span>Mock Exam Average (30%)</span> <span>{reportData.snapshot.mockExamAverage}%</span></div>
                  <div className="flex justify-between"><span>Viva Performance (20%)</span> <span>{reportData.snapshot.vivaPerformance}%</span></div>
                  <div className="flex justify-between"><span>Topic Completion (10%)</span> <span>{reportData.snapshot.topicCompletion}%</span></div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* 4. HIGH PROBABILITY QUESTIONS */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">High Probability Questions</h3>
                <div className="space-y-6">
                  {reportData.workspaceDetails.predictedQuestions.map((q, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-serif text-sm italic text-textMain">{q.topic}</span>
                        <span className="font-mono text-xs text-emerald-500">{q.confidence}%</span>
                      </div>
                      <div className="h-1 bg-borderDark/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50" style={{ width: `${q.confidence}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {reportData.workspaceDetails.predictedQuestions.length === 0 && <p className="font-mono text-xs text-textMuted">No predictions generated yet.</p>}
                </div>
              </div>

              {/* 5. WEAK CONCEPT TREE */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Weak Concept Tree</h3>
                <div className="font-mono text-xs text-textMuted space-y-2 bg-bgMain p-4 rounded-md border border-borderDark/10 overflow-x-auto">
                  <div className="text-textMain mb-2">{activeWorkspace.name}</div>
                  {reportData.snapshot.snapshotData.weakTopicsList.slice(0, 5).map((topic, i, arr) => (
                    <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-borderDark">{i === arr.length - 1 ? '└──' : '├──'}</span>
                      <span className="flex-1 text-rose-400">{topic.name}</span>
                      <span className="text-rose-500">{Math.round(topic.mastery)}%</span>
                    </div>
                  ))}
                  {reportData.snapshot.snapshotData.weakTopicsList.length === 0 && <p>No major risk areas detected.</p>}
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 6. MOCK EXAM ANALYTICS */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Mock Exam Analytics</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-textMuted mb-1">Average Score</p>
                    <p className="font-serif text-3xl italic text-textMain">{reportData.snapshot.mockExamAverage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-textMuted mb-1">Attempts</p>
                    <p className="font-serif text-3xl italic text-textMain">{reportData.snapshot.snapshotData.mockExams.length}</p>
                  </div>
                </div>

                <div className="font-mono text-xs text-textMuted">
                  <p className="mb-4 text-[10px] uppercase tracking-widest font-bold">Trajectory</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {reportData.snapshot.snapshotData.mockExams.length > 0 ? reportData.snapshot.snapshotData.mockExams.map((score, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-1 bg-borderDark/10 rounded-sm text-textMain">{score}%</span>
                        {i < arr.length - 1 && <ChevronRight size={14} className="text-borderDark" />}
                      </React.Fragment>
                    )) : <span className="opacity-50">No exams taken.</span>}
                  </div>
                </div>
              </div>

              {/* 7. STUDY PLAN EXPORT */}
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Next 5 Days Plan</h3>
                <div className="space-y-4">
                  {reportData.workspaceDetails.studyPlan.slice(0, 5).map((day, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 text-center shrink-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-textMuted">Day</div>
                        <div className="font-serif text-xl italic text-textMain leading-none mt-1">{i + 1}</div>
                      </div>
                      <div className="flex-1 font-mono text-xs text-textMuted mt-1">
                        <ul className="list-disc list-inside space-y-1">
                          {day.topics.slice(0, 2).map((t, j) => <li key={j} className="truncate">{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {reportData.workspaceDetails.studyPlan.length === 0 && <p className="font-mono text-xs text-textMuted">No study plan generated.</p>}
                </div>
              </div>

            </div>

            {/* 8. REPORT HISTORY & PROFESSOR SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-borderDark/5 border border-borderDark/10 p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMuted mb-6 border-b border-borderDark/10 pb-4">Report History</h3>
                <div className="space-y-4 font-mono text-xs">
                  {reportData.history.map((snap, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-textMuted">{new Date(snap.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="text-textMain">Readiness: {snap.readiness}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-textMain/5 border-l-2 border-textMain p-6 rounded-element">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-textMain mb-6 border-b border-textMain/10 pb-4 flex items-center gap-2">
                  <User size={12} /> Professor Observation
                </h3>
                <p className="font-serif text-sm italic text-textMain leading-relaxed whitespace-pre-wrap">
                  {reportData.snapshot.professorSummary}
                </p>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ReportArchitect;

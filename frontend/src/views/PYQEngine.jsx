import React, { useState, useEffect, useContext } from 'react';
import Dropzone from '../components/Dropzone';
import { Terminal, Play, Cpu, Check, AlertTriangle, Layers, Activity, Crosshair, Map } from 'lucide-react';
import { apiFetch } from '../services/api';
import { WorkspaceContext } from '../context/WorkspaceContext';

const PYQEngine = () => {
  const { activeWorkspace, setActiveWorkspace, refreshWorkspace } = useContext(WorkspaceContext);
  const analysisResult = activeWorkspace?.analysisResult;
  const [documents, setDocuments] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('graph'); // graph, analytics, predictions, plan

  console.log('Workspace:', activeWorkspace);
  console.log('Analysis:', activeWorkspace?.analysisResult);
  console.log('Predictions:', activeWorkspace?.predictions);
  console.log('StudyPlan:', activeWorkspace?.studyPlan);

  const handleUploadSuccess = (result) => {
    setDocuments(prev => [...prev, result]);
    refreshWorkspace(); // Update stats
  };

  const hasSyllabus = documents.some(d => d.detectedType?.toUpperCase() === 'SYLLABUS');
  const hasPYQ = documents.some(d => d.detectedType?.toUpperCase() === 'PYQ');
  const reliability = (hasSyllabus && hasPYQ) ? 'HIGH' : 'LOW';

  const executeUnifiedAnalysis = async () => {
    setIsAnalyzing(true);
    setActiveWorkspace(prev => ({ ...prev, analysisResult: null }));
    setConsoleLogs(['> INITIATING_HYBRID_DETERMINISTIC_MAPPER...']);

    setTimeout(() => setConsoleLogs(prev => [...prev, '> BUILDING_CANONICAL_ACADEMIC_ONTOLOGY [OK]']), 800);
    setTimeout(() => setConsoleLogs(prev => [...prev, '> MATCHING_LAYERS: EXACT -> ALIAS -> FUZZY [OK]']), 1600);
    setTimeout(() => setConsoleLogs(prev => [...prev, '> COMPUTING_WEIGHTAGE_MATHEMATICS [OK]']), 2400);

    try {
      const documentIds = documents.map(doc => doc.documentId);
      const response = await apiFetch(`/api/workspaces/${activeWorkspace._id}/agents/unified-analysis`, {
        method: 'POST',
        body: JSON.stringify({ documentIds })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute unified analysis');
      }
      
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, '> EXECUTION_COMPLETE [SUCCESS]']);
        setIsAnalyzing(false);
        refreshWorkspace(); // Re-fetch workspace to get the newly saved analysisResult
        setActiveTab('graph');
      }, 3500);

    } catch (error) {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, `> FATAL_ERROR: ${error.message}`]);
        setIsAnalyzing(false);
      }, 3000);
    }
  };

  const renderTabNavigation = () => (
    <div className="flex gap-2 mb-8 border-b-2 border-borderDark/10 pb-4 overflow-x-auto">
      <button onClick={() => setActiveTab('graph')} className={`flex items-center gap-2 px-4 py-2 rounded-element font-mono text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'graph' ? 'bg-textMain text-base' : 'bg-transparent text-textMuted hover:bg-borderDark/5'}`}>
        <Layers size={14} /> Knowledge Graph
      </button>
      <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-element font-mono text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'analytics' ? 'bg-textMain text-base' : 'bg-transparent text-textMuted hover:bg-borderDark/5'}`}>
        <Activity size={14} /> Analytics
      </button>
      <button onClick={() => setActiveTab('predictions')} className={`flex items-center gap-2 px-4 py-2 rounded-element font-mono text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'predictions' ? 'bg-textMain text-base' : 'bg-transparent text-textMuted hover:bg-borderDark/5'}`}>
        <Crosshair size={14} /> Predictions
      </button>
      <button onClick={() => setActiveTab('plan')} className={`flex items-center gap-2 px-4 py-2 rounded-element font-mono text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'plan' ? 'bg-textMain text-base' : 'bg-transparent text-textMuted hover:bg-borderDark/5'}`}>
        <Map size={14} /> Study Plan
      </button>
    </div>
  );

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center tech-panel">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl italic text-textMain">No Subject Selected</h2>
          <p className="font-mono text-sm text-textMuted max-w-sm mx-auto">Please create a new subject or select an existing one from the sidebar to begin analyzing documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col tech-panel overflow-auto">
      <div className="mb-8 border-b-2 border-borderDark/10 pb-6 flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-textMuted font-bold block mb-2 flex items-center gap-2">
            <Cpu size={12} /> Module // Intelligence_Report
          </span>
          <h2 className="font-serif text-5xl italic font-medium leading-none tracking-tight text-textMain">PYQ Engine</h2>
          <p className="text-sm text-textMuted mt-4 max-w-xl">Deterministic Knowledge Graph & Predictive Analytics generated via Hybrid Mapping.</p>
        </div>
        
        {analysisResult && analysisResult.status === 'success' && (
          <div className="text-right">
            <div className="flex items-center gap-3 font-mono text-xs font-bold border-2 border-borderDark px-4 py-2 rounded-full bg-base mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GRAPH_COMPILED
            </div>
            <p className="text-[9px] font-mono text-textMuted uppercase">v{analysisResult.versions?.graphVersion}</p>
          </div>
        )}
      </div>

      {!analysisResult && !isAnalyzing && (
        <div className="mb-8">
          <Dropzone onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {documents.length > 0 && !isAnalyzing && !analysisResult && (
        <div className="flex-1">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold">// STAGED_DOCUMENTS</h3>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-textMuted font-bold">Analysis Quality</p>
              <div className={`text-xs font-mono font-bold ${reliability === 'HIGH' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {reliability === 'HIGH' ? 'HIGH RELIABILITY' : 'LOW RELIABILITY (Missing Syllabus or PYQ)'}
              </div>
            </div>
          </div>
          
          <div className="grid gap-4 mb-8">
            {documents.map((doc, i) => (
              <div key={i} className="card-deck-effect p-4 flex items-center justify-between border-l-4 border-l-accent">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-borderDark rounded-element flex items-center justify-center font-mono font-bold text-xs bg-borderDark/5">
                    PDF
                  </div>
                  <div>
                    <h4 className="font-bold font-mono text-textMain text-sm tracking-tight">{doc.originalFilename || `Document_ID_${doc.documentId.substring(0, 6)}`}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-emerald-600 font-mono font-bold">PARSED_READY</p>
                      <p className="text-[10px] text-textMuted font-mono uppercase bg-base px-2 py-0.5 border border-borderDark rounded-sm">
                        TYPE: {doc.detectedType || 'UNKNOWN'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-borderDark/10 pt-6">
            <button 
              onClick={executeUnifiedAnalysis}
              className="w-full flex items-center justify-center gap-3 bg-obsidian text-white px-6 py-4 rounded-element font-mono text-sm tracking-widest hover:bg-black transition-colors cursor-pointer group"
            >
              <Play size={16} className="text-accent group-hover:text-white transition-colors" /> 
              EXECUTE DETERMINISTIC ANALYSIS
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="floating-console w-full max-w-2xl min-h-[200px] flex flex-col space-y-2">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
              <Terminal size={14} className="text-white/60" />
              <span className="text-white/40 uppercase tracking-widest text-[9px]">Node.js // Hybrid_Mapper</span>
            </div>
            {consoleLogs.map((log, i) => (
              <div key={i} className="text-green-400 font-mono text-xs animate-pulse">{log}</div>
            ))}
            <div className="w-2 h-4 bg-white/60 animate-pulse mt-2"></div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="flex-1 animate-fadeIn pb-12">
          {analysisResult.status === 'insufficient_data' ? (
            <div className="card-deck-effect p-8 flex flex-col items-center justify-center text-center border-rose-500/30">
              <AlertTriangle size={48} className="text-rose-500 mb-4" />
              <h3 className="font-serif text-3xl italic text-textMain mb-2">Insufficient Context</h3>
              <p className="text-textMuted max-w-md">Requires at least one SYLLABUS and one PYQ to build the Knowledge Graph.</p>
            </div>
          ) : (
            <>
              {renderTabNavigation()}

              {/* TAB 1: KNOWLEDGE GRAPH */}
              {activeTab === 'graph' && (
                <div className="space-y-6">
                  {analysisResult.knowledgeGraph?.units.map((u, idx) => (
                    <div key={idx} className="card-deck-effect p-6">
                      <h4 className="font-serif text-3xl italic text-textMain truncate max-w-full" title={u.name}>{u.name}</h4>
                      <div className="mt-6 pl-4 border-l-2 border-borderDark/20 space-y-6">
                        {u.topics.filter(t => t.questions?.length > 0).map((t, tIdx) => (
                          <div key={tIdx} className="overflow-hidden">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm font-bold text-textMain truncate max-w-full" title={t.name}>{t.name}</span>
                              {t.frequency >= 4 && <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">🔥 Hot ({t.frequency})</span>}
                              {t.frequency >= 2 && t.frequency <= 3 && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">⚠️ Emerging ({t.frequency})</span>}
                              {t.frequency === 1 && <span className="text-[10px] bg-borderDark/10 text-textMuted px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">• Low Data</span>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {t.questions?.map((q, qIdx) => (
                                <span key={qIdx} className="font-mono text-[10px] bg-borderDark/5 px-2 py-1 rounded-sm border border-borderDark/10 text-textMuted">
                                  {q.year} ({q.marks}M)
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {u.topics.filter(t => t.questions.length > 0).length === 0 && (
                          <p className="text-xs font-mono text-textMuted">No questions mapped to this unit.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Analysis Health Card */}
                  <div className="card-deck-effect p-6 border-l-4 border-l-textMain bg-borderDark/5">
                    <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-6 flex items-center gap-2">
                      <Activity size={14} /> Analysis Health
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[10px] uppercase text-textMuted font-bold mb-1">Graph Confidence</p>
                        <p className={`text-4xl font-serif italic ${analysisResult.mappingConfidence?.overall > 75 ? 'text-emerald-500' : analysisResult.mappingConfidence?.overall > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {analysisResult.mappingConfidence?.overall}%
                        </p>
                        <p className="text-[10px] font-mono font-bold mt-2 uppercase tracking-widest">
                          Status: {analysisResult.mappingConfidence?.overall > 90 ? 'VERIFIED' : analysisResult.mappingConfidence?.overall > 75 ? 'HIGH' : analysisResult.mappingConfidence?.overall > 50 ? 'MEDIUM' : 'LOW'}
                        </p>
                      </div>
                      
                      <div className="font-mono text-xs space-y-2 border-l border-borderDark/10 pl-6">
                        <p className="flex justify-between"><span className="text-textMuted">Documents:</span> <span className="font-bold">{documents.length}</span></p>
                        <p className="flex justify-between"><span className="text-textMuted">Units:</span> <span className="font-bold">{analysisResult.knowledgeGraph?.units.length}</span></p>
                        <p className="flex justify-between"><span className="text-textMuted">Topics:</span> <span className="font-bold">{analysisResult.knowledgeGraph?.units.reduce((acc, u) => acc + u.topics.length, 0)}</span></p>
                      </div>

                      <div className="font-mono text-xs space-y-2 border-l border-borderDark/10 pl-6">
                        <p className="flex justify-between"><span className="text-textMuted">Questions Parsed:</span> <span className="font-bold">{analysisResult.mappingConfidence?.total}</span></p>
                        <p className="flex justify-between"><span className="text-emerald-500">Mapped:</span> <span className="font-bold">{analysisResult.mappingConfidence?.total - analysisResult.mappingConfidence?.unmapped}</span></p>
                        <p className="flex justify-between"><span className="text-rose-500">Unmapped:</span> <span className="font-bold">{analysisResult.mappingConfidence?.unmapped}</span></p>
                      </div>
                      
                      <div className="font-mono text-xs space-y-2 border-l border-borderDark/10 pl-6">
                        <p className="flex justify-between"><span className="text-textMuted">Exact Matches:</span> <span className="font-bold">{analysisResult.mappingConfidence?.exactMatches}</span></p>
                        <p className="flex justify-between"><span className="text-textMuted">Alias Matches:</span> <span className="font-bold">{analysisResult.mappingConfidence?.aliasMatches}</span></p>
                        <p className="flex justify-between"><span className="text-textMuted">Semantic Scan:</span> <span className="font-bold">{analysisResult.mappingConfidence?.semanticScanMatches || 0}</span></p>
                        <p className="flex justify-between"><span className="text-textMuted">Fuzzy Matches:</span> <span className="font-bold">{analysisResult.mappingConfidence?.fuzzyMatches}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="card-deck-effect p-6">
                    <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-4">// UNIT_WEIGHTAGE</h3>
                    <div className="space-y-4">
                      {analysisResult.unitWeightage?.sort((a,b) => b.weightagePercent - a.weightagePercent).map((u, idx) => (
                        <div key={idx} className="overflow-hidden border-b border-borderDark/10 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <div className="text-sm font-bold font-serif italic text-textMain truncate mb-1" title={u.unitName}>{u.unitName}</div>
                              <div className="text-[10px] font-mono text-textMuted flex gap-3">
                                <span>Questions: <strong className="text-textMain">{u.frequency}</strong></span>
                                <span>Total Marks: <strong className="text-textMain">{u.totalMarks}</strong></span>
                                <span>Years Covered: <strong className="text-textMain">{u.yearsCovered}</strong></span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-serif italic text-textMain leading-none">{u.weightagePercent}%</div>
                              <div className="text-[9px] font-mono text-emerald-600 font-bold uppercase mt-1">Priority: {u.priorityScore}</div>
                            </div>
                          </div>
                          <div className="w-full bg-borderDark/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-textMain h-full" style={{ width: `${u.weightagePercent}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PREDICTIONS */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { key: 'eightMark', label: '8-Mark Predictions' },
                      { key: 'fiveMark', label: '5-Mark Predictions' },
                      { key: 'twoMark', label: '2-Mark Predictions' }
                    ].map(block => (
                      <div key={block.key} className="card-deck-effect p-6 bg-borderDark/5">
                        <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-4">// {block.label}</h3>
                        <div className="space-y-4">
                          {activeWorkspace?.predictions?.[block.key]?.map((p, pIdx) => {
                            if (typeof p === 'string') {
                              return <div key={pIdx} className="text-xs font-mono text-textMain border-l-2 border-accent pl-3 py-1">{p}</div>;
                            }
                            return (
                              <div key={pIdx} className="bg-base border border-borderDark/10 p-4 rounded-element">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold font-serif text-sm italic text-textMain leading-tight pr-4">{p.topic}</h4>
                                  <span className={`shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase ${p.confidence > 80 ? 'bg-emerald-500/10 text-emerald-600' : p.confidence > 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {p.confidence}% CONF
                                  </span>
                                </div>
                                <ul className="text-[10px] font-mono text-textMuted space-y-1.5 border-l border-borderDark/20 pl-3">
                                  <li className="flex gap-2"><strong className="text-textMain/70 w-16">Unit:</strong> <span className="truncate" title={p.unit}>{p.unit}</span></li>
                                  <li className="flex gap-2"><strong className="text-textMain/70 w-16">Appeared:</strong> <span>{p.appeared?.join(', ')}</span></li>
                                  <li className="flex gap-2"><strong className="text-textMain/70 w-16">Trend:</strong> <span>{p.trend}</span></li>
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Why Not Predicted? */}
                  <div className="card-deck-effect p-6 bg-borderDark/5">
                    <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-4">// TOPICS NOT PRIORITIZED</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResult.knowledgeGraph?.units.flatMap(u => u.topics.filter(t => t.predictionConfidence < 30)).slice(0, 6).map((t, i) => (
                        <div key={i} className="bg-base border border-borderDark/10 p-4 rounded-element opacity-70">
                          <h4 className="font-bold font-serif text-sm italic text-textMain leading-tight line-through decoration-textMuted">{t.name}</h4>
                          <div className="text-[10px] font-mono text-textMuted mt-2 border-l border-borderDark/20 pl-2">
                            <p className="font-bold text-textMain/70 mb-1">Reason:</p>
                            <ul className="list-disc pl-3 space-y-1">
                              {t.frequency === 0 && <li>Never appeared</li>}
                              {t.frequency > 0 && t.frequency < 2 && <li>Appeared only {t.frequency} time(s)</li>}
                              {t.lastSeen > 0 && new Date().getFullYear() - t.lastSeen > 3 && <li>Last seen in {t.lastSeen}</li>}
                              {(t.totalMarks || 0) < 10 && <li>Low weightage ({t.totalMarks || 0}M)</li>}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDY PLAN */}
              {activeTab === 'plan' && (
                <div className="card-deck-effect p-6 md:p-8">
                  <div className="flex justify-between items-end mb-8 border-b-2 border-borderDark/10 pb-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">// ACTION_PLAN</h3>
                      <h4 className="font-serif text-4xl italic text-textMain leading-none">Yield Roadmap</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-textMuted tracking-widest">Est. Effort</p>
                      <p className="font-mono text-lg font-bold text-textMain">{activeWorkspace?.studyPlan?.estimatedHours}H</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {activeWorkspace?.studyPlan?.plan?.map((step, idx) => (
                      <div key={idx} className="flex gap-6 items-start">
                        <div className="w-12 h-12 shrink-0 flex flex-col items-center justify-center bg-obsidian text-white rounded-element font-mono">
                          <span className="text-[9px] text-white/50">DAY</span>
                          <span className="font-bold text-sm leading-none">{step.day}</span>
                        </div>
                        <div>
                          <h5 className="font-bold font-mono text-base text-textMain mb-1">{step.focus}</h5>
                          <p className="text-sm text-textMuted">{step.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-12 text-center">
            <button 
              onClick={() => { setActiveWorkspace(prev => ({ ...prev, analysisResult: null })); setDocuments([]); setActiveTab('graph'); }}
              className="font-mono text-xs text-textMuted hover:text-textMain underline uppercase tracking-widest"
            >
              Reset Environment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PYQEngine;

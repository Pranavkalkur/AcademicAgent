import React, { useState, useMemo } from 'react';
import { Send, Cpu, User, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { apiFetch } from '../services/api';
import { WorkspaceContext } from '../context/WorkspaceContext';

export default function VivaChat() {
  const { activeWorkspace } = React.useContext(WorkspaceContext);
  
  const [sessionState, setSessionState] = useState('select_topic'); // select_topic, loading_question, answering, evaluated
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const availableTopics = useMemo(() => {
    if (!activeWorkspace?.analysisResult?.knowledgeGraph?.units) return [];
    return activeWorkspace.analysisResult.knowledgeGraph.units.flatMap(u => u.topics.map(t => t.name));
  }, [activeWorkspace]);

  const selectTopic = async (topic) => {
    console.log("Selected Topic:", topic);
    setCurrentTopic(topic);
    setSessionState('loading_question');
    setMessages([]);
    setInput(''); // Clear input explicitly
    try {
      const workspaceId = activeWorkspace?._id;
      if (!workspaceId) {
        throw new Error('No active workspace selected');
      }

      const res = await apiFetch(`/api/workspaces/${workspaceId}/viva/question`, {
        method: 'POST',
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setCurrentQuestion(data.data);
      setSessionState('answering');
      
      setMessages([{
        role: 'system',
        type: 'question',
        topic: topic,
        text: data.data.text,
        marks: data.data.marks,
        difficulty: data.data.difficulty
      }]);
    } catch (err) {
      console.error(err);
      setSessionState('select_topic');
      alert("Failed to load question for topic.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeWorkspace || !currentQuestion) return;
    
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const workspaceId = activeWorkspace?._id;
      if (!workspaceId) {
        throw new Error('No active workspace selected');
      }

      const res = await apiFetch(`/api/workspaces/${workspaceId}/viva/evaluate`, {
        method: 'POST',
        body: JSON.stringify({
          topic: currentTopic,
          question: currentQuestion.text,
          transcript: userMessage.text,
          expectedConcepts: currentQuestion.expectedConcepts
        })
      });
      
      const data = await res.json();
      setIsTyping(false);
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }
      
      if (!data.data.valid) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          type: 'error',
          text: data.data.message
        }]);
        return;
      }
      
      setSessionState('evaluated');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        type: 'evaluation',
        coverageScore: data.data.coverageScore,
        matchedConcepts: data.data.matchedConcepts,
        missedConcepts: data.data.missedConcepts,
        feedback: data.data.feedback,
        followUpQuestion: data.data.followUpQuestion
      }]);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', type: 'error', text: err.message || 'Sorry, I encountered an error evaluating that.' }]);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="h-full flex items-center justify-center tech-panel">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl italic text-textMain">No Subject Selected</h2>
          <p className="font-mono text-sm text-textMuted max-w-sm mx-auto">Please select a subject to access the PYQ Oral Simulator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col tech-panel overflow-hidden">
      <div className="mb-6 border-b-2 border-borderDark/10 pb-6 flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-textMuted font-bold block mb-2 flex items-center gap-2">
            <Cpu size={12} /> Module // PYQ_Oral_Simulator
          </span>
          <h2 className="font-serif text-5xl italic font-medium leading-none tracking-tight text-textMain">PYQ Oral Simulator</h2>
          <p className="text-sm text-textMuted mt-4 max-w-xl">Deterministic oral assessments mapped directly to the Knowledge Graph and PYQs.</p>
        </div>
        {sessionState !== 'select_topic' && (
          <button onClick={() => setSessionState('select_topic')} className="text-[10px] font-mono text-textMuted hover:text-textMain border border-borderDark/20 px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors">
            End Session
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar mb-6">
        
        {sessionState === 'select_topic' && (
          <div className="animate-fadeIn">
            <h3 className="font-serif text-2xl italic text-textMain mb-6">Select a Topic to Begin</h3>
            {availableTopics.length === 0 ? (
              <p className="font-mono text-xs text-textMuted">No topics found. Please upload a syllabus to build the Knowledge Graph.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableTopics.map(t => (
                  <button 
                    key={t}
                    onClick={() => selectTopic(t)}
                    className="font-mono text-xs px-4 py-2 bg-borderDark/5 border border-borderDark/20 hover:border-textMain/50 text-textMuted hover:text-textMain rounded-element transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {sessionState === 'loading_question' && (
          <div className="flex items-center gap-4 text-textMuted font-mono text-sm">
            <div className="w-4 h-4 border-2 border-textMuted border-t-transparent rounded-full animate-spin"></div>
            Consulting Question Bank...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-element ${msg.role === 'user' ? 'bg-borderDark text-white' : 'bg-borderDark/5 border border-borderDark/10 text-textMain'}`}>
              
              <div className="flex items-center gap-2 mb-3 opacity-50 border-b border-borderDark/10 pb-2">
                {msg.role === 'user' ? <User size={14} /> : <Cpu size={14} />}
                <span className="text-[10px] uppercase tracking-widest font-bold">{msg.role === 'user' ? 'You' : 'System'}</span>
              </div>
              
              {msg.type === 'error' && (
                <div className="font-mono text-sm text-rose-400 flex items-start gap-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{msg.text}</p>
                </div>
              )}

              {msg.type === 'question' && (
                <div>
                  <div className="flex gap-3 mb-4">
                    {msg.marks && <span className="bg-textMain/10 text-textMain px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest">{msg.marks} Marks</span>}
                    {msg.difficulty && <span className="bg-borderDark/20 text-textMuted px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest">{msg.difficulty}</span>}
                  </div>
                  <p className="font-serif text-xl italic text-textMain leading-relaxed">{msg.text}</p>
                </div>
              )}

              {msg.role === 'user' && (
                <p className="font-mono text-sm leading-relaxed">{msg.text}</p>
              )}

              {msg.type === 'evaluation' && (
                <div className="space-y-6">
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-textMuted tracking-widest mb-1">Concept Coverage</p>
                      <p className="font-serif text-5xl italic text-textMain leading-none">{msg.coverageScore}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-bgMain p-4 rounded-md border border-borderDark/10">
                    {msg.matchedConcepts?.map((c, i) => (
                      <div key={'m'+i} className="flex items-center gap-3 font-mono text-xs text-emerald-500">
                        <CheckCircle2 size={14} /> <span>{c}</span>
                      </div>
                    ))}
                    {msg.missedConcepts?.map((c, i) => (
                      <div key={'x'+i} className="flex items-center gap-3 font-mono text-xs text-rose-500">
                        <XCircle size={14} /> <span>{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-textMain/5 p-4 rounded-md border-l-2 border-textMain">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase font-bold text-textMain tracking-widest">Professor Feedback</p>
                      <button className="flex items-center gap-1 text-[10px] font-mono text-textMuted hover:text-textMain uppercase" onClick={() => alert(`Your answer missed the following expected concepts:\n\n${msg.missedConcepts.join(', ')}\n\nTherefore they were considered uncovered.`)}>
                        <HelpCircle size={12} /> Why?
                      </button>
                    </div>
                    <p className="font-serif text-sm italic text-textMain leading-relaxed">{msg.feedback}</p>
                  </div>

                  {msg.followUpQuestion && (
                    <div className="mt-4 pt-4 border-t border-borderDark/10">
                      <p className="text-[10px] uppercase font-bold text-textMuted tracking-widest mb-2">Follow-up Question</p>
                      <p className="font-mono text-sm text-textMain">{msg.followUpQuestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-borderDark/5 border border-borderDark/10 text-textMain p-4 rounded-element flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => {
            console.log("Input changed:", e.target.value);
            setInput(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={sessionState === 'select_topic' ? "Please select a topic above to begin..." : "Type your response here..."}
          disabled={sessionState === 'select_topic' || isTyping}
          className="w-full bg-base border-2 border-borderDark rounded-element px-6 py-4 pr-16 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-textMain/20 disabled:opacity-50"
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isTyping || sessionState === 'select_topic'}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-textMain text-bgMain p-2 rounded-md disabled:opacity-50 hover:scale-105 transition-transform"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

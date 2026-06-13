import React, { useContext } from 'react';
import { ArrowUpRight, Play, Terminal, Book, FileText, LayoutDashboard } from 'lucide-react';
import { WorkspaceContext } from '../context/WorkspaceContext';

export default function Dashboard() {
  const { workspaces, loadWorkspace } = useContext(WorkspaceContext);

  return (
    <div className="h-full flex flex-col space-y-12 pb-12">
      {/* Top Block: High-End Editorial Header Section */}
      <div className="flex justify-between items-start w-full border-b-2 border-borderDark/10 pb-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] uppercase font-bold tracking-widest text-textMuted flex items-center gap-2">
            <Terminal size={12} /> CORE_SESSION_STREAM // INITIALIZED
          </span>
          <h1 className="font-serif text-5xl italic font-medium leading-none tracking-tight text-textMain">
            Next-Gen Academic Analytics, Powered by Agents + You
          </h1>
          <p className="text-xs text-textMuted leading-relaxed max-w-md pt-2">
            Transform chaotic syllabus maps and historical past examinations into clean, actionable data streams.
          </p>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-mono uppercase tracking-widest font-bold text-textMuted mb-6 flex items-center gap-2">
          <LayoutDashboard size={16} /> Active Subjects
        </h2>

        {workspaces.length === 0 ? (
          <div className="card-deck-effect p-12 text-center border-2 border-dashed border-borderDark/20 bg-borderDark/5">
            <h3 className="font-serif italic text-2xl mb-2 text-textMain">No Subjects Found</h3>
            <p className="text-textMuted font-mono text-sm max-w-md mx-auto">
              Create a new subject from the sidebar to begin tracking your academic readiness.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map(ws => (
              <div 
                key={ws._id} 
                onClick={() => loadWorkspace(ws._id)}
                className="group card-deck-effect p-6 cursor-pointer hover:-translate-y-1 transition-transform"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ws.theme?.icon || '📘'}</span>
                    <div>
                      <h3 className="font-serif italic text-xl text-textMain leading-tight">{ws.name}</h3>
                      {ws.subjectCode && (
                        <p className="text-[10px] font-mono text-textMuted uppercase tracking-widest">{ws.subjectCode}</p>
                      )}
                    </div>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full mt-1" 
                    style={{ backgroundColor: ws.theme?.color || '#4CAF50' }}
                  ></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between border-b border-borderDark/10 pb-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-textMuted font-bold">Exam Readiness</span>
                    <span className="text-3xl font-mono text-textMain leading-none">{ws.stats?.readiness || 0}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-textMuted flex items-center gap-1"><Book size={10} /> Topics</span>
                      <span className="text-lg font-mono text-textMain">{ws.stats?.topicCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-textMuted flex items-center gap-1"><FileText size={10} /> Documents</span>
                      <span className="text-lg font-mono text-textMain">{ws.stats?.documentCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

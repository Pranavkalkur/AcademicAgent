import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, FileCode, FileEdit, MessageSquare, LogOut, User, Plus, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { WorkspaceContext } from '../context/WorkspaceContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { workspaces, activeWorkspace, loadWorkspace, createWorkspace } = useContext(WorkspaceContext);
  
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', subjectCode: '', semester: '', color: '#4CAF50', icon: '📘' });

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pyq', label: 'PYQ Engine', icon: FileText },
    { path: '/exam', label: 'Mock Exam', icon: FileEdit },
    { path: '/viva', label: 'Viva Coach', icon: MessageSquare },
    { path: '/report', label: 'Report Architect', icon: FileCode },
  ];

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    await createWorkspace({
      name: newSubject.name,
      subjectCode: newSubject.subjectCode,
      semester: parseInt(newSubject.semester) || 1,
      theme: { color: newSubject.color, icon: newSubject.icon }
    });
    setShowModal(false);
    setNewSubject({ name: '', subjectCode: '', semester: '', color: '#4CAF50', icon: '📘' });
  };

  return (
    <>
      <aside className="w-[280px] flex-shrink-0 card-deck-effect p-8 flex flex-col z-10 overflow-y-auto custom-scrollbar">
        <div className="mb-8 border-b-2 border-borderDark/10 pb-6">
          <h1 className="text-2xl font-serif italic font-bold tracking-tight text-textMain">Academic Agent</h1>
        </div>

        {/* WORKSPACES SECTION */}
        <div className="mb-8">
          <button 
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 bg-obsidian text-white rounded-element hover:bg-obsidian/90 transition-colors font-mono text-sm tracking-tight"
          >
            <Plus size={16} /> New Subject
          </button>
          
          <div className="text-[10px] font-bold uppercase tracking-widest text-textMuted mb-3 px-2">Subjects</div>
          
          <div className="space-y-1">
            {workspaces.map(ws => (
              <button
                key={ws._id}
                onClick={() => loadWorkspace(ws._id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-element transition-all text-left ${
                  activeWorkspace?._id === ws._id
                    ? 'bg-black/5 text-textMain font-bold'
                    : 'text-textMuted hover:bg-black/5 hover:text-textMain'
                }`}
              >
                <span className="text-lg">{ws.theme?.icon || '📘'}</span>
                <span className="font-mono text-sm truncate flex-1">{ws.name}</span>
                {activeWorkspace?._id === ws._id && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ws.theme?.color || '#4CAF50' }}></div>
                )}
              </button>
            ))}
            
            {workspaces.length === 0 && (
              <div className="text-xs font-mono text-textMuted/50 px-2 italic py-2">No subjects yet</div>
            )}
          </div>
        </div>
        
        <div className="border-t-2 border-borderDark/10 pt-6 mb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted px-2">Tools</div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-element transition-all duration-200 border-2 ${
                  isActive 
                    ? 'bg-obsidian text-white border-obsidian font-medium shadow-sm' 
                    : 'text-textMuted hover:bg-black/5 hover:text-textMain border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : ''} />
                <span className="font-mono text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t-2 border-borderDark/10 space-y-4">
          {user && (
            <div className="bg-[#F4F4F4] p-3 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <User size={16} className="text-[#878787] flex-shrink-0" />
                <span className="font-mono text-xs font-semibold uppercase truncate">{user.username}</span>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 hover:bg-[#E5E5E5] rounded transition-colors text-[#878787] hover:text-rose-500 flex-shrink-0"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* NEW SUBJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F4F4] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden card-deck-effect">
            <div className="p-6 border-b border-borderDark/10 flex justify-between items-center">
              <h2 className="font-serif italic text-2xl text-textMain">Create New Subject</h2>
              <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-textMain">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">Subject Name</label>
                <input 
                  type="text" 
                  required
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder="e.g. Operating Systems"
                  className="w-full bg-white border border-borderDark/20 rounded-element px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">Subject Code</label>
                  <input 
                    type="text" 
                    value={newSubject.subjectCode}
                    onChange={e => setNewSubject({...newSubject, subjectCode: e.target.value})}
                    placeholder="e.g. 21CS72"
                    className="w-full bg-white border border-borderDark/20 rounded-element px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">Semester</label>
                  <input 
                    type="number" 
                    value={newSubject.semester}
                    onChange={e => setNewSubject({...newSubject, semester: e.target.value})}
                    placeholder="e.g. 7"
                    min="1" max="10"
                    className="w-full bg-white border border-borderDark/20 rounded-element px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">Icon (Emoji)</label>
                  <input 
                    type="text" 
                    value={newSubject.icon}
                    onChange={e => setNewSubject({...newSubject, icon: e.target.value})}
                    placeholder="📘"
                    className="w-full bg-white border border-borderDark/20 rounded-element px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2">Theme Color</label>
                  <div className="flex gap-2 mt-2">
                    {['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#607D8B'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewSubject({...newSubject, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${newSubject.color === c ? 'scale-110 border-obsidian' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-borderDark/10">
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 text-obsidian font-bold uppercase tracking-widest py-3 px-4 rounded-element hover:bg-emerald-400 transition-colors"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

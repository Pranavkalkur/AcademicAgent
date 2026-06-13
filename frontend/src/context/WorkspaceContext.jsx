import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from '../services/api';
import { AuthContext } from './AuthContext';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const res = await apiFetch('/api/workspaces');
      const payload = await res.json();
      if (payload.success) {
        setWorkspaces(payload.data);
        
        // Auto-load last opened workspace
        if (user?.lastOpenedWorkspace) {
          await loadWorkspace(user.lastOpenedWorkspace);
        } else if (payload.data.length > 0) {
          await loadWorkspace(payload.data[0]._id);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
      setLoading(false);
    }
  };

  const loadWorkspace = async (id) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/workspaces/${id}`);
      const payload = await res.json();
      if (payload.success) {
        setActiveWorkspace(payload.data);
      }
    } catch (err) {
      console.error('Failed to load workspace', err);
    }
    setLoading(false);
  };

  const createWorkspace = async (data) => {
    try {
      const res = await apiFetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const payload = await res.json();
      if (payload.success) {
        setWorkspaces([payload.data, ...workspaces]);
        setActiveWorkspace(payload.data);
        return payload.data;
      }
    } catch (err) {
      console.error('Failed to create workspace', err);
    }
    return null;
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      loading,
      loadWorkspace,
      createWorkspace,
      refreshWorkspace: () => activeWorkspace && loadWorkspace(activeWorkspace._id)
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

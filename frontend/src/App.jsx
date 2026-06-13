import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import PYQEngine from './views/PYQEngine';
import ReportArchitect from './views/ReportArchitect';
import MockExamDashboard from './views/MockExamDashboard';
import VivaChat from './views/VivaChat';
import Login from './views/Login';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

function MainApp() {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();

  if (token && !user) {
    return <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center font-mono text-sm">Authenticating...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-[#F4F4F4] text-[#1C1C1C] overflow-hidden selection:bg-black selection:text-white">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto relative p-6">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/pyq" element={<PageTransition><PYQEngine /></PageTransition>} />
              <Route path="/exam" element={<PageTransition><MockExamDashboard /></PageTransition>} />
              <Route path="/viva" element={<PageTransition><VivaChat /></PageTransition>} />
              <Route path="/report" element={<PageTransition><ReportArchitect /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </WorkspaceProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}

export default App;

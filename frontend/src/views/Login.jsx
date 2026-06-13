import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let res;
    if (isLoginTab) {
      res = await login(username, password);
    } else {
      res = await register(username, password);
    }

    if (!res.success) {
      setError(res.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F4F4F4]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-[18px] shadow-sm border border-[#E5E5E5]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif italic text-[#1C1C1C]">Academic Agent</h1>
          <p className="text-[#6B6B6B] mt-2 font-mono text-sm uppercase tracking-wider">Authentication Required</p>
        </div>

        <div className="flex mb-6 border-b border-[#E5E5E5]">
          <button 
            className={`flex-1 pb-2 text-sm font-mono tracking-wider transition-colors ${isLoginTab ? 'border-b-2 border-[#1C1C1C] text-[#1C1C1C]' : 'text-[#878787] hover:text-[#1C1C1C]'}`}
            onClick={() => { setIsLoginTab(true); setError(''); }}
          >
            LOGIN
          </button>
          <button 
            className={`flex-1 pb-2 text-sm font-mono tracking-wider transition-colors ${!isLoginTab ? 'border-b-2 border-[#1C1C1C] text-[#1C1C1C]' : 'text-[#878787] hover:text-[#1C1C1C]'}`}
            onClick={() => { setIsLoginTab(false); setError(''); }}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-mono rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#878787] mb-1 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[#F4F4F4] border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#1C1C1C] font-mono transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#878787] mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#F4F4F4] border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#1C1C1C] font-mono transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 bg-[#1C1C1C] text-white rounded-xl text-sm font-mono tracking-wider uppercase hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLoginTab ? 'Login' : 'Register'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

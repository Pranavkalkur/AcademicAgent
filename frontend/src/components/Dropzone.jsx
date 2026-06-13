import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/api';
import { WorkspaceContext } from '../context/WorkspaceContext';

const Dropzone = ({ onUploadSuccess }) => {
  const { activeWorkspace } = React.useContext(WorkspaceContext);
  const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, SUCCESS, ERROR
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [docType, setDocType] = useState('SYLLABUS'); // User selected type
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setStatus('UPLOADING');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType.toLowerCase()); // Explicitly pass the lowercased user-selected type

    try {
      const response = await apiFetch(`/api/workspaces/${activeWorkspace._id}/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();

      setStatus('SUCCESS');
      if (onUploadSuccess) onUploadSuccess(result);

      // Immediate State Reset (4 seconds)
      setTimeout(() => {
        setStatus('IDLE');
      }, 4000);

    } catch (error) {
      console.error('Upload Error:', error);
      setStatus('ERROR');
      setErrorMessage(error.message);
      
      // Reset error after 5 seconds
      setTimeout(() => {
        setStatus('IDLE');
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {status === 'IDLE' && (
        <div className="flex bg-borderDark/10 p-1 rounded-lg border border-borderDark/20 mx-auto w-64">
          <button
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${docType === 'SYLLABUS' ? 'bg-textMain text-base shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            onClick={() => setDocType('SYLLABUS')}
          >
            SYLLABUS
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${docType === 'PYQ' ? 'bg-textMain text-base shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            onClick={() => setDocType('PYQ')}
          >
            PYQ
          </button>
        </div>
      )}

      <motion.div
        className={`relative rounded-xl border-2 border-dashed transition-colors duration-300 flex flex-col items-center justify-center p-12 overflow-hidden cursor-pointer
          ${isDragActive ? 'border-accent bg-borderDark/10' : 'border-borderDark/20 bg-base hover:bg-borderDark/5'}`}
        animate={{ scale: isDragActive ? 1.02 : 1 }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        className="hidden" 
        accept="application/pdf"
      />
      
      <AnimatePresence mode="wait">
        {status === 'IDLE' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center"
          >
            <UploadCloud size={48} className="text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-800">Click or drag a file to this area to upload</h3>
            <p className="text-sm text-gray-500 mt-2 font-mono">Maximum file size: 10MB (PDF only)</p>
          </motion.div>
        )}

        {status === 'UPLOADING' && (
          <motion.div 
            key="uploading"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center text-accent"
          >
            <Loader2 size={48} className="animate-spin mb-4" />
            <h3 className="text-lg font-medium">Extracting Text from PDF...</h3>
            <p className="text-sm text-accent/70 mt-2 font-mono">Running binary-to-alphanumeric pipeline</p>
          </motion.div>
        )}

        {status === 'SUCCESS' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center text-emerald-600"
          >
            <CheckCircle size={48} className="mb-4" />
            <h3 className="text-lg font-medium">Upload Complete!</h3>
            <p className="text-sm text-emerald-600/70 mt-2 font-mono">Document ingested successfully.</p>
            <button 
              className="mt-6 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              onClick={(e) => { e.stopPropagation(); setStatus('IDLE'); }}
            >
              Upload another file
            </button>
          </motion.div>
        )}

        {status === 'ERROR' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center text-rose-600"
          >
            <AlertCircle size={48} className="mb-4" />
            <h3 className="text-lg font-medium">Upload Failed</h3>
            <p className="text-sm text-rose-600/70 mt-2 font-mono">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dropzone;

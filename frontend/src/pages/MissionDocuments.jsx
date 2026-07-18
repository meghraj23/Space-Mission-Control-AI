import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Upload, Plus, Terminal } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const MissionDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadSummary, setUploadSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setIsUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/pdf', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setUploadSummary(res.data.summary);
        fetchDocs();
      }
    } catch (err) {
      alert('Upload or AI summarization failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
          MISSION DOCUMENTS CABINET
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">FLIGHT SPECS EXPLORER &bull; AI PDF SUMMARIZATIONS PANEL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Monitor: Document Upload & AI Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Upload className="h-4 w-4 text-accentCyan animate-pulse" /> Document Upload & AI Summarizer
            </h3>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <label className="border border-dashed border-white/10 rounded-lg p-6 hover:border-accentCyan/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="h-6 w-6 text-accentCyan/80" />
                <span className="text-xs font-mono text-gray-400">
                  {fileToUpload ? fileToUpload.name : 'Select flight blueprint PDF/DOC to upload...'}
                </span>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={isUploading || !fileToUpload}
                className="btn-cyber-primary text-xs font-mono py-2 rounded flex items-center justify-center gap-2"
              >
                {isUploading ? 'Analyzing Document via AI...' : 'Upload & run Summarizer'}
              </button>
            </form>

            {uploadSummary && (
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                <span className="text-[9px] font-bold font-orbitron text-accentCyan uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" /> AI ANALYSIS FEEDBACK
                </span>
                <div className="text-[11px] font-mono text-gray-400 leading-relaxed bg-spaceBg/60 p-3 rounded border border-white/5 whitespace-pre-wrap">
                  {uploadSummary}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Monitor: Document Explorer */}
        <GlassCard className="flex flex-col gap-4">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Documents Drawer</h3>
          
          <div className="flex flex-col gap-3 font-mono text-xs text-gray-400 border-t border-white/5 pt-4">
            {documents.map((d) => (
              <div key={d.id} className="p-3 bg-spaceBg/40 border border-white/5 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white">
                  <FileText className="h-4 w-4 text-accentCyan" />
                  <span>{d.name}</span>
                </div>
                <div className="text-[9px] text-gray-500">
                  Type: {d.type} &bull; Size: {Math.round(d.sizeBytes / 1024)} KB
                </div>
                <p className="text-[10px] text-accentCyan/80 leading-relaxed">{d.summary}</p>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default MissionDocuments;

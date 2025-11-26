import React, { useState } from 'react';
import { IdeaData, ScriptData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateScript } from '../../services/geminiService';
import { Send, RefreshCw, FileText, Settings2, PlayCircle, PenTool, ChevronDown, Edit3 } from 'lucide-react';

interface Props {
  idea: IdeaData;
  data: ScriptData;
  updateData: (data: Partial<ScriptData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const ScriptWriter: React.FC<Props> = ({ idea, data, updateData, onApprove, setLoading, isLoading }) => {
  const [feedback, setFeedback] = useState('');
  const [showConfig, setShowConfig] = useState(!data.generatedScript);

  const handleGenerate = async () => {
    if (!data.niche) return alert("Please enter a niche");
    setLoading(true);
    setShowConfig(false);
    try {
      const script = await generateScript(data, idea);
      updateData({ generatedScript: script });
    } catch (error) {
      console.error(error);
      alert("Failed to write script");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const script = await generateScript(data, idea, feedback);
      updateData({ generatedScript: script });
      setFeedback('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentLayout
      agentName="Scribe"
      agentRole="Script Writer"
      color="bg-indigo-500"
      isProcessing={isLoading}
      canApprove={!!data.generatedScript}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {/* Context Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-4 mb-8 backdrop-blur-sm w-full">
        <div className="p-2.5 bg-indigo-500 rounded-lg text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
             <PlayCircle size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5">Working on</div>
            <div className="text-white font-medium text-base truncate">{idea.generatedTitle}</div>
        </div>
      </div>

      {showConfig ? (
        <div className="w-full h-full flex flex-col justify-center animate-fade-in">
           <div className="text-center space-y-2 mb-10">
             <h3 className="text-4xl font-bold text-white">Script Parameters</h3>
             <p className="text-slate-400 text-lg">Define the structure before we write.</p>
           </div>

           <div className="space-y-8 bg-white/5 p-8 lg:p-16 rounded-3xl border border-white/10 shadow-2xl w-full max-w-none">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">Target Niche</label>
                <input 
                  type="text" 
                  value={data.niche}
                  onChange={(e) => updateData({ niche: e.target.value })}
                  placeholder="e.g. Tech Education, Lifestyle Vlogging"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600 text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">Tone</label>
                  <div className="relative group">
                    <select 
                        value={data.tone}
                        onChange={(e) => updateData({ tone: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/60 text-lg font-medium shadow-inner"
                    >
                        <option className="bg-slate-900 text-white">Energetic & Fast-Paced</option>
                        <option className="bg-slate-900 text-white">Professional & Educational</option>
                        <option className="bg-slate-900 text-white">Relaxed & Conversational</option>
                        <option className="bg-slate-900 text-white">Dramatic & Storytelling</option>
                        <option className="bg-slate-900 text-white">Humorous & Witty</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-white transition-colors" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">Length</label>
                  <div className="relative group">
                    <select 
                        value={data.length}
                        onChange={(e) => updateData({ length: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/60 text-lg font-medium shadow-inner"
                    >
                        <option className="bg-slate-900 text-white">Short (Under 5 min)</option>
                        <option className="bg-slate-900 text-white">Medium (8-10 min)</option>
                        <option className="bg-slate-900 text-white">Long (15+ min)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-white transition-colors" size={20} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading || !data.niche}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xl py-5 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:shadow-[0_0_60px_rgba(99,102,241,0.8)] transform hover:-translate-y-0.5"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <PenTool size={24} />}
                Start Writing
              </button>
           </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full animate-fade-in gap-4">
             {/* Script View - Full Width */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8 shadow-inner overflow-hidden flex flex-col relative w-full group">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FileText size={18} className="text-indigo-400" /> Generated Script
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs text-indigo-300/50 flex items-center gap-1 px-2 py-1 rounded-md border border-indigo-500/10">
                            <Edit3 size={10} /> Editable
                        </span>
                        <button 
                            onClick={() => setShowConfig(true)}
                            className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg transition-colors hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        >
                            <Settings2 size={12} /> Parameters
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative">
                   <textarea 
                      value={data.generatedScript}
                      onChange={(e) => updateData({ generatedScript: e.target.value })}
                      className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-slate-100 font-medium text-lg leading-relaxed whitespace-pre-wrap custom-scrollbar p-0 outline-none selection:bg-indigo-500/30"
                      placeholder="Script content..."
                      spellCheck={false}
                   />
                </div>
            </div>

             {/* Refinement Bar - Full Width */}
             <div className="bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg flex items-center gap-2 backdrop-blur-sm shrink-0 w-full">
                <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Rewrite instructions (e.g. 'Make the intro punchier')..."
                    className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                />
                <button
                    onClick={handleRefine}
                    disabled={isLoading || !feedback}
                    className="px-6 py-3 bg-white/10 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold flex items-center gap-2 hover:text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)]"
                >
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                    Refine
                </button>
            </div>
        </div>
      )}
    </AgentLayout>
  );
};

export default ScriptWriter;
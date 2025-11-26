import React, { useState } from 'react';
import { ScriptData, PromptData, VideoPlatform } from '../../types';
import AgentLayout from '../AgentLayout';
import { generatePrompts } from '../../services/geminiService';
import { Send, RefreshCw, Image as ImageIcon, Film, Sparkles, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface Props {
  scriptData: ScriptData;
  data: PromptData;
  updateData: (data: Partial<PromptData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const PromptWriter: React.FC<Props> = ({ scriptData, data, updateData, onApprove, setLoading, isLoading }) => {
  const [feedback, setFeedback] = useState('');
  const [showConfig, setShowConfig] = useState(data.generatedPrompts.length === 0);

  const handleGenerate = async () => {
    setLoading(true);
    setShowConfig(false);
    try {
      const prompts = await generatePrompts(data, scriptData.generatedScript);
      updateData({ generatedPrompts: prompts });
    } catch (error) {
      console.error(error);
      alert("Failed to generate prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const prompts = await generatePrompts(data, scriptData.generatedScript, feedback);
      updateData({ generatedPrompts: prompts });
      setFeedback('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentLayout
      agentName="Vision"
      agentRole="Prompt Engineer"
      color="bg-pink-500"
      isProcessing={isLoading}
      canApprove={data.generatedPrompts.length > 0}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {showConfig ? (
        <div className="w-full h-full flex flex-col justify-center animate-fade-in">
           <div className="text-center mb-10">
             <div className="inline-flex p-4 rounded-full bg-pink-500/10 mb-6 ring-1 ring-pink-500/30">
               <Film className="text-pink-500" size={32} />
             </div>
             <h3 className="text-4xl font-bold text-white mb-2">Visual Generation Strategy</h3>
             <p className="text-slate-400 text-lg">Configure how the AI sees your script.</p>
           </div>

           <div className="bg-white/5 p-8 lg:p-16 rounded-3xl border border-white/10 space-y-8 shadow-2xl backdrop-blur-sm w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">AI Video Platform</label>
                    <div className="relative group">
                      <select 
                        value={data.platform}
                        onChange={(e) => updateData({ platform: e.target.value as VideoPlatform })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-5 text-white focus:ring-1 focus:ring-pink-500 outline-none appearance-none transition-all hover:bg-black/60 cursor-pointer text-lg font-medium shadow-inner"
                      >
                        {Object.values(VideoPlatform).map((p) => (
                          <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-white transition-colors" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">Prompt Density</label>
                    <div className="bg-black/40 p-5 rounded-xl border border-white/10 flex items-center gap-6 h-[70px]">
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={data.count}
                          onChange={(e) => updateData({ count: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                        />
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-white font-bold text-2xl">{data.count}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Scenes</span>
                        </div>
                    </div>
                  </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xl py-5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:shadow-[0_0_60px_rgba(236,72,153,0.8)] hover:-translate-y-0.5"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <Sparkles size={24} />}
                Generate Prompts
              </button>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in h-full flex flex-col w-full">
           <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-500/10 p-2 rounded-lg text-pink-500"><ImageIcon size={20} /></div>
                    <h3 className="text-white font-bold text-lg">Prompts for {data.platform}</h3>
                </div>
                <button 
                    onClick={() => setShowConfig(true)}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <SlidersHorizontal size={14} /> Adjust
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.generatedPrompts.map((prompt, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-pink-500/30 hover:bg-white/10 transition-all duration-300 flex flex-col gap-4">
                          <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/10 text-pink-500 text-sm font-bold border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                                  {idx + 1}
                              </span>
                          </div>
                          <p className="text-slate-300 text-base leading-relaxed font-medium select-all selection:bg-pink-500/30">
                              {prompt}
                          </p>
                      </div>
                  ))}
                </div>
            </div>

             {/* Refinement Chat */}
             <div className="bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg flex items-center gap-2 backdrop-blur-sm shrink-0 w-full">
                <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tweak prompts (e.g. 'More cinematic lighting')..."
                    className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                />
                <button
                    onClick={handleRefine}
                    disabled={isLoading || !feedback}
                    className="px-6 py-3 bg-white/10 hover:bg-pink-500 text-white rounded-xl transition-all font-bold flex items-center gap-2 hover:text-white shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)]"
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

export default PromptWriter;
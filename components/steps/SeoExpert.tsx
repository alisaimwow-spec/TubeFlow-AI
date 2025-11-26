import React, { useState, useEffect } from 'react';
import { ScriptData, PromptData, SeoData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateSEO } from '../../services/geminiService';
import { Send, RefreshCw, Search, Hash, Type, Award, BarChart3 } from 'lucide-react';

interface Props {
  scriptData: ScriptData;
  promptData: PromptData;
  data: SeoData;
  updateData: (data: Partial<SeoData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const SeoExpert: React.FC<Props> = ({ scriptData, promptData, data, updateData, onApprove, setLoading, isLoading }) => {
  const [feedback, setFeedback] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!data.optimizedTitle && !isLoading && !hasStarted) {
        setHasStarted(true);
        handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateSEO(scriptData.generatedScript, promptData.generatedPrompts);
      updateData({
        optimizedTitle: result.title,
        optimizedDescription: result.description,
        optimizedTags: result.tags
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate SEO");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const result = await generateSEO(scriptData.generatedScript, promptData.generatedPrompts, feedback, data);
      updateData({
        optimizedTitle: result.title,
        optimizedDescription: result.description,
        optimizedTags: result.tags
      });
      setFeedback('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!data.optimizedTitle;

  return (
    <AgentLayout
      agentName="Ranker"
      agentRole="SEO Expert"
      color="bg-emerald-500"
      isProcessing={isLoading}
      canApprove={hasResult}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {!hasResult ? (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
             <div className="relative">
                 <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
                 <div className="relative p-6 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                    <BarChart3 size={64} className="text-emerald-500 animate-bounce" />
                 </div>
             </div>
             <p className="text-emerald-400 font-mono font-bold tracking-widest text-sm animate-pulse">OPTIMIZING METADATA...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in w-full h-full flex flex-col">
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              {/* Left Column: Title & Tags */}
              <div className="space-y-6 flex flex-col">
                  {/* Title Section */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Type size={18} />
                            <h4 className="font-bold text-xs uppercase tracking-wider">Optimized Title</h4>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <Award size={12} /> 98/100
                            </span>
                          </div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight break-words">
                        {data.optimizedTitle}
                      </div>
                  </div>

                  {/* Tags Section */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg flex-1">
                      <div className="flex items-center gap-2 mb-6 text-emerald-400">
                        <Hash size={18} />
                        <h4 className="font-bold text-xs uppercase tracking-wider">High Volume Keywords</h4>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {data.optimizedTags.map((tag, i) => (
                            <span key={i} className="bg-black/40 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg border border-white/10 hover:border-emerald-500/40 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all cursor-default">
                                #{tag}
                            </span>
                        ))}
                      </div>
                  </div>
              </div>

              {/* Right Column: Description */}
               <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg flex flex-col h-full overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Search size={18} />
                    <h4 className="font-bold text-xs uppercase tracking-wider">Description</h4>
                  </div>
                  <textarea 
                    readOnly
                    className="flex-1 w-full bg-black/20 text-slate-300 text-sm p-4 rounded-xl focus:outline-none resize-none font-mono leading-relaxed custom-scrollbar border border-white/5"
                    value={data.optimizedDescription}
                  />
               </div>
           </div>

           {/* Refinement */}
            <div className="bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg flex items-center gap-2 backdrop-blur-sm shrink-0 w-full">
                <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Refine SEO strategy..."
                    className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                />
                <button
                    onClick={handleRefine}
                    disabled={isLoading || !feedback}
                    className="px-6 py-3 bg-white/10 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold flex items-center gap-2 hover:text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)]"
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

export default SeoExpert;
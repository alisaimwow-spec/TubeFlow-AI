import React, { useState, useEffect } from 'react';
import { SeoData, ScriptData, ThumbnailData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateThumbnailConcepts } from '../../services/geminiService';
import { Send, RefreshCw, Image, Eye, Lightbulb, CheckCircle2 } from 'lucide-react';

interface Props {
  seoData: SeoData;
  scriptData: ScriptData;
  data: ThumbnailData;
  updateData: (data: Partial<ThumbnailData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const ThumbnailDesigner: React.FC<Props> = ({ seoData, scriptData, data, updateData, onApprove, setLoading, isLoading }) => {
  const [feedback, setFeedback] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (data.generatedConcepts.length === 0 && !isLoading && !hasStarted) {
      setHasStarted(true);
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const concepts = await generateThumbnailConcepts(seoData.optimizedTitle, scriptData.generatedScript);
      updateData({ generatedConcepts: concepts, selectedConceptIndex: null });
    } catch (error) {
      console.error(error);
      alert("Failed to generate thumbnails");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const concepts = await generateThumbnailConcepts(seoData.optimizedTitle, scriptData.generatedScript, feedback);
      updateData({ generatedConcepts: concepts, selectedConceptIndex: null });
      setFeedback('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    updateData({ selectedConceptIndex: index });
  };

  return (
    <AgentLayout
      agentName="Pixel"
      agentRole="Thumbnail Strategist"
      color="bg-orange-500"
      isProcessing={isLoading}
      canApprove={data.selectedConceptIndex !== null}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {data.generatedConcepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
           <div className="relative">
             <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="relative p-6 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                <Image size={64} className="text-orange-500 animate-bounce" />
             </div>
           </div>
           <p className="text-orange-400 font-mono font-bold tracking-widest text-sm">DESIGNING CLICK MAGNETS...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in w-full h-full flex flex-col">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-white font-bold text-xl">Select a Concept to Generate</h3>
             <div className="text-xs text-orange-400 font-bold bg-orange-950/30 border border-orange-500/20 px-3 py-1 rounded-full">
                {data.selectedConceptIndex !== null ? 'Concept Selected' : 'Click card to select'}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto p-1 custom-scrollbar">
            {data.generatedConcepts.map((concept, idx) => {
              const isSelected = data.selectedConceptIndex === idx;
              return (
                <div 
                  key={idx} 
                  onClick={() => handleSelect(idx)}
                  className={`relative rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col h-full min-h-[400px] cursor-pointer
                    ${isSelected 
                        ? 'bg-orange-500/10 border-2 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.2)] transform scale-[1.02]' 
                        : 'bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]'
                    }`}
                >
                  {/* Header / Text Overlay Preview */}
                  <div className="aspect-video bg-black/40 relative flex items-center justify-center p-8 border-b border-white/5 overflow-hidden shrink-0">
                      <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-orange-900/50' : 'from-black/80'} to-transparent`}></div>
                      {/* Simulated text overlay */}
                      <h3 className="relative z-10 text-2xl md:text-3xl font-black text-white text-center uppercase leading-none drop-shadow-2xl tracking-tighter">
                          {concept.headline}
                      </h3>
                      <div className="absolute top-4 left-4 flex gap-2">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow-lg transition-colors ${isSelected ? 'bg-orange-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                            Option {idx + 1}
                          </span>
                          {isSelected && <CheckCircle2 size={18} className="text-orange-500 bg-black rounded-full" />}
                      </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div>
                       <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Eye size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">Visual Direction</span>
                       </div>
                       <p className="text-slate-200 text-sm leading-relaxed font-light select-none">{concept.visualDescription}</p>
                    </div>
                    
                    <div className="pt-4 mt-auto border-t border-white/5">
                       <div className="flex items-center gap-2 mb-1 text-orange-400/80">
                          <Lightbulb size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">Why it works</span>
                       </div>
                       <p className="text-xs text-slate-500 italic select-none">{concept.reasoning}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refinement Chat */}
          <div className="bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg flex items-center gap-2 backdrop-blur-sm sticky bottom-0 w-full shrink-0">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Refine visual strategy..."
                className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              />
              <button
                onClick={handleRefine}
                disabled={isLoading || !feedback}
                className="px-6 py-3 bg-white/10 hover:bg-orange-500 text-white rounded-xl transition-all font-bold flex items-center gap-2 hover:text-black shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)]"
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

export default ThumbnailDesigner;
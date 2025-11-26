import React, { useState, useEffect } from 'react';
import { ThumbnailConcept, ThumbnailGenerationData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateThumbnailImages } from '../../services/geminiService';
import { RefreshCw, Download, Image, Sparkles, Maximize2 } from 'lucide-react';

interface Props {
  concept: ThumbnailConcept | undefined;
  data: ThumbnailGenerationData;
  updateData: (data: Partial<ThumbnailGenerationData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const ThumbnailGenerator: React.FC<Props> = ({ concept, data, updateData, onApprove, setLoading, isLoading }) => {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (concept && data.generatedImages.length === 0 && !isLoading && !hasStarted) {
      setHasStarted(true);
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!concept) return;
    setLoading(true);
    try {
      const images = await generateThumbnailImages(concept);
      updateData({ generatedImages: images });
    } catch (error) {
      console.error(error);
      alert("Failed to generate thumbnail images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentLayout
      agentName="Canvas"
      agentRole="Graphic Designer"
      color="bg-rose-500"
      isProcessing={isLoading}
      canApprove={data.generatedImages.length > 0}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {!concept ? (
         <div className="flex items-center justify-center h-full text-rose-500 font-bold">
            No concept selected. Please go back and select a concept.
         </div>
      ) : data.generatedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
           <div className="relative">
             <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="relative p-6 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                <Sparkles size={64} className="text-rose-500 animate-spin-slow" />
             </div>
           </div>
           <div className="text-center">
               <p className="text-rose-400 font-mono font-bold tracking-widest text-sm mb-2">RENDERING 4K VISUALS...</p>
               <p className="text-slate-500 text-xs max-w-md">"{concept.visualDescription}"</p>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in w-full h-full flex flex-col">
           <div className="shrink-0">
              <h3 className="text-2xl font-bold text-white mb-1">Generated Thumbnails</h3>
              <p className="text-slate-400 text-sm">Based on concept: <span className="text-rose-400">"{concept.headline}"</span></p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto p-1 custom-scrollbar">
              {data.generatedImages.map((base64, idx) => (
                  <div key={idx} className="group relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl hover:border-rose-500/50 transition-all duration-300">
                      <img 
                        src={`data:image/png;base64,${base64}`} 
                        alt={`Generated Thumbnail ${idx + 1}`}
                        className="w-full h-auto object-cover aspect-video group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                          <a 
                            href={`data:image/png;base64,${base64}`}
                            download={`thumbnail-variant-${idx+1}.png`}
                            className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-rose-500 transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:shadow-[0_0_50px_rgba(225,29,72,0.8)]"
                          >
                              <Download size={18} /> Download
                          </a>
                          <button 
                             onClick={() => {
                                 const w = window.open("");
                                 w?.document.write(`<img src="data:image/png;base64,${base64}" style="width:100%"/>`);
                             }}
                             className="px-6 py-2 bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          >
                              <Maximize2 size={18} /> View Full
                          </button>
                      </div>
                      
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-xs font-bold text-rose-400">
                          Variant {idx + 1}
                      </div>
                  </div>
              ))}
           </div>
           
           <div className="flex justify-center shrink-0 py-4">
               <button 
                 onClick={handleGenerate}
                 className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all font-bold shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
               >
                   <RefreshCw size={18} /> Generate New Variations
               </button>
           </div>
        </div>
      )}
    </AgentLayout>
  );
};

export default ThumbnailGenerator;
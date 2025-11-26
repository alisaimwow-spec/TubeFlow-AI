import React from 'react';
import { WorkflowState } from '../../types';
import { CheckCheck, Copy, Youtube, Download, Image, Calendar, Mic2, Star, Clock, Hash, ExternalLink } from 'lucide-react';

interface Props {
  state: WorkflowState;
}

const Finalizer: React.FC<Props> = ({ state }) => {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPackage = () => {
    const content = `TITLE: ${state.seo.optimizedTitle}\n\nDESCRIPTION:\n${state.seo.optimizedDescription}\n\nTAGS:\n${state.seo.optimizedTags.join(', ')}\n\n---\nPUBLISH: ${state.plan.publishDate} @ ${state.plan.publishTime}\n\nSCRIPT:\n${state.script.generatedScript}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tubeflow-assets.txt';
    a.click();
  };

  return (
    <div className="w-full min-h-full flex flex-col gap-6 animate-enter pb-32">
      
      {/* Header Stats */}
      <div className="shrink-0 flex flex-col md:flex-row items-end justify-between gap-6 pb-6 border-b border-white/5">
         <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-2">Mission Complete</h1>
            <p className="text-slate-400 text-lg">Your content package is ready for deployment.</p>
         </div>
         <button 
            onClick={downloadPackage}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:shadow-[0_0_60px_rgba(255,255,255,0.8)] flex items-center gap-3"
         >
            <Download size={20} /> Download All Assets
         </button>
      </div>

      {/* Bento Grid - Removed flex constraints to allow scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-min gap-4">
          
          {/* 1. Title & Identity (Large, Top Left) */}
          <div className="md:col-span-4 lg:col-span-4 glass-card rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group min-h-[220px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4 text-emerald-400">
                       <Youtube size={20} />
                       <span className="text-xs font-bold uppercase tracking-widest">Optimized Title</span>
                   </div>
                   <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4 group-hover:text-emerald-50 transition-colors cursor-text selection:bg-emerald-500/30">
                       {state.seo.optimizedTitle}
                   </h2>
                   <div className="flex flex-wrap gap-2">
                       {state.seo.optimizedTags.slice(0, 5).map(tag => (
                           <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-emerald-300">#{tag}</span>
                       ))}
                   </div>
               </div>
          </div>

          {/* 2. Schedule (Tall, Right) */}
          <div className="md:col-span-2 lg:col-span-2 row-span-2 glass-card rounded-[2rem] p-6 flex flex-col min-h-[400px]">
              <div className="flex items-center gap-2 mb-6 text-cyan-400">
                  <Calendar size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Launch Plan</span>
              </div>
              
              <div className="text-center py-6 border-b border-white/5 mb-6">
                  <div className="text-5xl font-bold text-white tracking-tighter mb-1">{state.plan.publishTime}</div>
                  <div className="text-cyan-400 font-mono text-sm">{state.plan.publishDate}</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {state.plan.generatedSchedule.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] shrink-0"></div>
                          <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">{item}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* 3. Thumbnail (Visual) */}
          <div className="md:col-span-2 lg:col-span-3 glass-card rounded-[2rem] p-1 overflow-hidden relative group min-h-[250px]">
              {state.thumbnailImages.generatedImages[0] ? (
                  <>
                    <img src={`data:image/png;base64,${state.thumbnailImages.generatedImages[0]}`} className="w-full h-full object-cover rounded-[1.8rem] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                         <div className="flex items-center gap-2 text-orange-400 mb-1">
                             <Image size={16} /> <span className="text-xs font-bold uppercase">Thumbnail Variant 1</span>
                         </div>
                    </div>
                  </>
              ) : (
                  <div className="w-full h-full bg-orange-900/10 flex items-center justify-center flex-col gap-2">
                      <Image size={32} className="text-orange-500/50" />
                      <span className="text-xs font-mono text-orange-500/50">NO IMAGE GENERATED</span>
                  </div>
              )}
          </div>

          {/* 4. Voiceover & Audio */}
          <div className="md:col-span-2 lg:col-span-3 glass-card rounded-[2rem] p-6 flex flex-col justify-between group hover:bg-purple-900/10 transition-colors min-h-[200px]">
               <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2 text-purple-400">
                       <Mic2 size={20} />
                       <span className="text-xs font-bold uppercase tracking-widest">Voiceover</span>
                   </div>
                   <span className="px-2 py-1 rounded bg-purple-500 text-white text-[10px] font-bold uppercase">{state.voice.selectedVoice}</span>
               </div>
               
               {state.voice.generatedAudioBase64 ? (
                   <div className="bg-black/40 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                        </div>
                        <div className="flex-1 h-8 flex items-center gap-0.5 opacity-50">
                             {Array.from({length: 20}).map((_,i) => (
                                 <div key={i} className="w-1 bg-purple-400 rounded-full" style={{ height: `${Math.random() * 100}%`}}></div>
                             ))}
                        </div>
                        <a href={state.voice.previewUrl || '#'} download className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Download size={16}/></a>
                   </div>
               ) : (
                   <div className="text-slate-500 text-sm font-mono">Audio not generated.</div>
               )}
          </div>

          {/* 5. Script (Full Width Bottom) */}
          <div className="md:col-span-4 lg:col-span-6 glass-card rounded-[2rem] p-8 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2 text-indigo-400">
                       <CheckCheck size={20} />
                       <span className="text-xs font-bold uppercase tracking-widest">Master Script</span>
                   </div>
                   <button onClick={() => copyToClipboard(state.script.generatedScript)} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"><Copy size={12}/> COPY TEXT</button>
              </div>
              <div className="flex-1 bg-[#050505] rounded-xl border border-white/5 p-6 font-mono text-sm text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                  {state.script.generatedScript}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Finalizer;
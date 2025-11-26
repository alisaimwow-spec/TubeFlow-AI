import React, { useState } from 'react';
import { INITIAL_STATE, WorkflowState, AppStep } from './types';
import IdeaGenerator from './components/steps/IdeaGenerator';
import ScriptWriter from './components/steps/ScriptWriter';
import VoiceGenerator from './components/steps/VoiceGenerator';
import PromptWriter from './components/steps/PromptWriter';
import SeoExpert from './components/steps/SeoExpert';
import ThumbnailDesigner from './components/steps/ThumbnailDesigner';
import ThumbnailGenerator from './components/steps/ThumbnailGenerator';
import ContentPlanner from './components/steps/ContentPlanner';
import Finalizer from './components/steps/Finalizer';
import { LayoutGrid, Check, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<WorkflowState>(INITIAL_STATE);

  const updateState = (updates: Partial<WorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };
  
  const goToStep = (step: AppStep) => {
    if (step <= state.currentStep) {
        setState(prev => ({ ...prev, currentStep: step }));
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case AppStep.IDEA_GENERATION:
        return <IdeaGenerator data={state.idea} updateData={(d) => setState(p => ({ ...p, idea: { ...p.idea, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.SCRIPT_WRITING:
        return <ScriptWriter idea={state.idea} data={state.script} updateData={(d) => setState(p => ({ ...p, script: { ...p.script, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.VOICE_OVER_GENERATION:
        return <VoiceGenerator scriptData={state.script} data={state.voice} updateData={(d) => setState(p => ({ ...p, voice: { ...p.voice, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.PROMPT_WRITING:
        return <PromptWriter scriptData={state.script} data={state.prompts} updateData={(d) => setState(p => ({ ...p, prompts: { ...p.prompts, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.SEO_OPTIMIZATION:
        return <SeoExpert scriptData={state.script} promptData={state.prompts} data={state.seo} updateData={(d) => setState(p => ({ ...p, seo: { ...p.seo, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.THUMBNAIL_DESIGN:
        return <ThumbnailDesigner seoData={state.seo} scriptData={state.script} data={state.thumbnails} updateData={(d) => setState(p => ({ ...p, thumbnails: { ...p.thumbnails, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.THUMBNAIL_GENERATION:
         const selectedConcept = state.thumbnails.selectedConceptIndex !== null ? state.thumbnails.generatedConcepts[state.thumbnails.selectedConceptIndex] : undefined;
        return <ThumbnailGenerator concept={selectedConcept} data={state.thumbnailImages} updateData={(d) => setState(p => ({ ...p, thumbnailImages: { ...p.thumbnailImages, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.CONTENT_PLANNING:
        return <ContentPlanner seoData={state.seo} data={state.plan} updateData={(d) => setState(p => ({ ...p, plan: { ...p.plan, ...d } }))} onApprove={nextStep} setLoading={(l) => updateState({ isLoading: l })} isLoading={state.isLoading} />;
      case AppStep.FINAL_REVIEW:
        return <Finalizer state={state} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  const navItems = [
    { step: AppStep.IDEA_GENERATION, label: 'Sparky', color: 'bg-amber-500' },
    { step: AppStep.SCRIPT_WRITING, label: 'Scribe', color: 'bg-indigo-500' },
    { step: AppStep.VOICE_OVER_GENERATION, label: 'Vox', color: 'bg-purple-500' },
    { step: AppStep.PROMPT_WRITING, label: 'Vision', color: 'bg-pink-500' },
    { step: AppStep.SEO_OPTIMIZATION, label: 'Ranker', color: 'bg-emerald-500' },
    { step: AppStep.THUMBNAIL_DESIGN, label: 'Pixel', color: 'bg-orange-500' },
    { step: AppStep.THUMBNAIL_GENERATION, label: 'Canvas', color: 'bg-rose-500' },
    { step: AppStep.CONTENT_PLANNING, label: 'Scheduler', color: 'bg-cyan-500' },
    { step: AppStep.FINAL_REVIEW, label: 'Launch', color: 'bg-blue-500' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col relative z-0 overflow-hidden">
      
      {/* Navbar */}
      <nav className="h-14 px-4 md:px-6 flex items-center justify-between shrink-0 relative z-50 bg-[#030305]/80 backdrop-blur-md border-b border-white/5">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               <LayoutGrid size={18} fill="black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden md:inline">TubeFlow</span>
         </div>

         {/* Steps Timeline - Desktop */}
         <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[calc(100vw-150px)]">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                {navItems.map((item, idx) => {
                    const isActive = state.currentStep === item.step;
                    const isPast = state.currentStep > item.step;
                    
                    return (
                        <button
                        key={item.step}
                        onClick={() => isPast && goToStep(item.step)}
                        disabled={!isPast && !isActive}
                        className={`
                            relative px-3 md:px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                            ${isActive 
                                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : isPast 
                                ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                                : 'text-slate-700 cursor-default hidden md:flex'
                            }
                        `}
                        >
                            {isPast ? <Check size={10} strokeWidth={4} className={item.color.replace('bg-', 'text-')} /> : <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-black' : 'bg-slate-700'}`}></span>}
                            {item.label}
                        </button>
                    )
                })}
            </div>
         </div>
      </nav>

      {/* Main Stage */}
      <main className="flex-1 w-full min-h-0 relative p-0 md:p-1 lg:p-2 bg-transparent">
          <div className="w-full h-full glass-panel-modern rounded-none md:rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/80 border-t border-white/5">
              {renderStep()}
          </div>
      </main>

    </div>
  );
};

export default App;
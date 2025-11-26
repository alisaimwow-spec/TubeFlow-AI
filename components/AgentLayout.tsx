import React from 'react';
import { Bot, Check, ChevronRight, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface AgentLayoutProps {
  agentName: string;
  agentRole: string;
  color: string; // e.g., "bg-amber-500" or just color reference
  children: React.ReactNode;
  isProcessing: boolean;
  onApprove?: () => void;
  canApprove?: boolean;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ 
  agentName, 
  agentRole, 
  color, 
  children, 
  isProcessing,
  onApprove,
  canApprove
}) => {
  // Extract base color class for text/borders (assuming format like "bg-color-500")
  const accentColorClass = color.replace('bg-', 'text-');
  
  // Extract the raw color name (e.g., "amber-500") for custom shadow construction if needed
  // This is a rough extraction, usually Tailwind classes are static strings
  // We will use white for the main action button to keep it clean, or we can use the prop
  
  return (
    <div className="w-full h-full flex flex-col relative z-10 animate-enter">
      
      {/* Compact HUD Header */}
      <div className="shrink-0 h-10 flex items-center justify-between px-4 border-b border-white/5 bg-[#030305]/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group`}>
                <div className={`absolute inset-0 ${color} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <Bot size={14} className={`${accentColorClass}`} />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                     <Loader2 size={10} className={`${accentColorClass} animate-spin`} />
                  </div>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                    {agentName}
                </h2>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{agentRole}</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
             {isProcessing && (
                 <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 animate-pulse">
                     <Sparkles size={10} className={accentColorClass} />
                     <span className={`text-[10px] font-bold ${accentColorClass}`}>Processing...</span>
                 </div>
             )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden bg-black/20">
         <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2 md:p-4">
            {children}
         </div>
      </div>

      {/* Ultra Compact Floating Action Dock */}
      {onApprove && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
           <div className="glass-panel-modern p-1 rounded-xl flex items-center gap-1 shadow-2xl shadow-black/80 pointer-events-auto backdrop-blur-xl">
               <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <MessageSquare size={16} />
               </button>
               
               <div className="w-px h-4 bg-white/10 mx-1"></div>
               
               <button 
                 onClick={onApprove}
                 disabled={!canApprove || isProcessing}
                 className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-wide transition-all duration-300
                    ${canApprove && !isProcessing
                        ? `bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95`
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }
                 `}
               >
                 <span>Approve Outcome</span>
                 <div className={`p-0.5 rounded-full ${canApprove && !isProcessing ? 'bg-black text-white' : 'bg-transparent border border-slate-600'}`}>
                    {isProcessing ? <Loader2 size={10} className="animate-spin"/> : <ChevronRight size={10} />}
                 </div>
               </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default AgentLayout;
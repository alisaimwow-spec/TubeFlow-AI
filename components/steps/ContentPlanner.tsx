import React, { useState } from 'react';
import { SeoData, PlannerData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateSchedule } from '../../services/geminiService';
import { RefreshCw, Calendar, CheckCircle2, ListVideo, Bell, ArrowRight } from 'lucide-react';

interface Props {
  seoData: SeoData;
  data: PlannerData;
  updateData: (data: Partial<PlannerData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const ContentPlanner: React.FC<Props> = ({ seoData, data, updateData, onApprove, setLoading, isLoading }) => {
  const [dateInput, setDateInput] = useState(data.publishDate);
  const [timeInput, setTimeInput] = useState(data.publishTime || '12:00');

  const handleGenerate = async () => {
    if (!dateInput) return alert("Please select a date");
    setLoading(true);
    try {
      const schedule = await generateSchedule(seoData.optimizedTitle, dateInput, timeInput);
      updateData({ 
        publishDate: dateInput,
        publishTime: timeInput,
        generatedSchedule: schedule 
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentLayout
      agentName="Scheduler"
      agentRole="Content Manager"
      color="bg-cyan-500"
      isProcessing={isLoading}
      canApprove={data.generatedSchedule.length > 0}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {data.generatedSchedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-10 animate-fade-in text-center w-full px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20"></div>
            <div className="relative p-8 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                <Calendar size={48} className="text-cyan-400" />
            </div>
          </div>
          
          <div className="space-y-2">
             <h3 className="text-3xl font-bold text-white">Production Timeline</h3>
             <p className="text-slate-400">Set your target launch to build the roadmap.</p>
          </div>
          
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 w-full max-w-5xl space-y-8 shadow-2xl backdrop-blur-sm mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-left ml-1">Date</label>
                    <input 
                        type="date" 
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-5 text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all hover:bg-black/60 text-lg"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-left ml-1">Time</label>
                    <input 
                        type="time" 
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-5 text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all hover:bg-black/60 text-lg"
                    />
                </div>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !dateInput}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:shadow-[0_0_60px_rgba(6,182,212,0.8)] hover:-translate-y-0.5 mt-2 text-lg"
            >
              {isLoading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
              Generate Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in h-full w-full">
            {/* Schedule List */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden flex flex-col h-full shadow-lg">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                     <CheckCircle2 size={24} /> 
                   </div>
                   <h3 className="font-bold text-xl text-white">Checklist</h3>
                 </div>
                 <div className="text-xs font-bold text-cyan-400 bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    T-Minus: Launch
                 </div>
               </div>
               
               <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                 {data.generatedSchedule.map((item, idx) => (
                   <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all group">
                      <div className="mt-1 w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-cyan-500 flex-shrink-0 transition-colors relative">
                        <div className="absolute inset-0.5 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed group-hover:text-white transition-colors">{item}</p>
                   </div>
                 ))}
               </div>
               
               <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                   <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-2 transition-colors hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <Bell size={14} /> Set Reminders
                   </button>
                   <button 
                     onClick={() => updateData({ generatedSchedule: [] })} 
                     className="text-xs text-slate-500 hover:text-white transition-colors"
                   >
                      Change Date
                   </button>
               </div>
            </div>

            {/* Upcoming Videos Mockup */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <ListVideo size={24} />
                        </div>
                        <h3 className="font-bold text-xl text-white">Calendar</h3>
                   </div>
                </div>
                
                <div className="space-y-6 relative pl-6 flex-1">
                    {/* Vertical Line */}
                    <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-slate-800 via-cyan-500/50 to-slate-800"></div>

                    {/* New Item (Active) */}
                    <div className="relative">
                        <div className="absolute -left-[29px] top-6 w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)] ring-4 ring-slate-900"></div>
                        <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-transparent relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Scheduled Launch</span>
                                <span className="text-xs text-white font-mono bg-white/10 px-2 py-1 rounded">{data.publishDate}</span>
                            </div>
                            <h4 className="font-bold text-white text-xl mb-2 line-clamp-2 leading-tight">{seoData.optimizedTitle}</h4>
                            <div className="flex gap-2 mt-4">
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded font-bold uppercase">Pre-Production</span>
                            </div>
                        </div>
                    </div>

                    {/* Mock Future Item */}
                    <div className="relative opacity-50">
                        <div className="absolute -left-[29px] top-6 w-3 h-3 rounded-full bg-slate-700 ring-4 ring-slate-900"></div>
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 grayscale">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Draft</span>
                            </div>
                            <h4 className="font-bold text-slate-400 text-lg">Next Great Idea...</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </AgentLayout>
  );
};

export default ContentPlanner;
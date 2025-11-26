import React, { useState } from 'react';
import { IdeaData } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateVideoIdea } from '../../services/geminiService';
import { Send, RefreshCw, Sparkles, Zap } from 'lucide-react';

interface Props {
  data: IdeaData;
  updateData: (data: Partial<IdeaData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const IdeaGenerator: React.FC<Props> = ({ data, updateData, onApprove, setLoading, isLoading }) => {
  const [topicInput, setTopicInput] = useState(data.userInput);
  const [feedback, setFeedback] = useState('');

  const handleInitialGenerate = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    try {
      const result = await generateVideoIdea(topicInput);
      updateData({
        userInput: topicInput,
        generatedTitle: result.title,
        generatedConcept: result.concept
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const result = await generateVideoIdea(topicInput, feedback, data);
      updateData({
        generatedTitle: result.title,
        generatedConcept: result.concept
      });
      setFeedback('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!data.generatedTitle;

  return (
    <AgentLayout
      agentName="Sparky"
      agentRole="Viral Strategist"
      color="bg-amber-500"
      isProcessing={isLoading}
      canApprove={hasResult}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      {!hasResult ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full text-center space-y-12 px-4">
            
            <div className="space-y-4 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-tight">
                    Ignite your next <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">viral concept.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 font-light mx-auto">
                    Give me a topic, a niche, or just a random thought. I'll structure it into a click-worthy YouTube hit.
                </p>
            </div>

            <div className="w-full max-w-5xl relative group mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
                <div className="relative flex items-center bg-[#0A0A0C] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <input
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="e.g. 'Future of AI' or 'Vegan Meal Prep'"
                        className="flex-1 bg-transparent border-none text-white text-2xl font-medium px-6 py-4 focus:ring-0 placeholder-slate-700"
                        onKeyDown={(e) => e.key === 'Enter' && handleInitialGenerate()}
                        autoFocus
                    />
                    <button 
                        onClick={handleInitialGenerate}
                        disabled={isLoading || !topicInput}
                        className="p-4 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {isLoading ? <RefreshCw className="animate-spin" /> : <Zap fill="black" />}
                    </button>
                </div>
            </div>

        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center py-4 lg:py-10 px-4">
           
           <div className="w-full flex-1 flex flex-col justify-center max-h-[80vh] glass-card rounded-[2rem] p-8 md:p-14 relative overflow-y-auto custom-scrollbar group border border-amber-500/10 hover:border-amber-500/30">
               <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
               
               <div className="relative z-10 space-y-6 text-center max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={12} /> Generated Concept
                    </div>
                    
                    {/* Reduced font sizes here */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
                        {data.generatedTitle}
                    </h2>
                    
                    <div className="max-w-4xl mx-auto">
                        {/* Reduced font sizes here */}
                        <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">
                            {data.generatedConcept}
                        </p>
                    </div>
               </div>
           </div>

           {/* Refinement Bar - Floating */}
           <div className="mt-6 w-full max-w-3xl relative">
                <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Refine this idea (e.g. 'Make it more controversial')"
                    className="w-full bg-black/50 border border-white/10 rounded-full px-8 py-5 pr-36 text-white text-lg focus:outline-none focus:border-amber-500/50 focus:bg-black/70 transition-all backdrop-blur-md shadow-xl"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                />
                <button
                    onClick={handleRefine}
                    disabled={isLoading || !feedback}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-white/10 hover:bg-amber-500 text-white rounded-full font-bold text-sm transition-all flex items-center gap-2 hover:text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]"
                >
                    {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                    Refine
                </button>
           </div>

        </div>
      )}
    </AgentLayout>
  );
};

export default IdeaGenerator;
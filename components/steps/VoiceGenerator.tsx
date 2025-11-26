
import React, { useState, useEffect, useRef } from 'react';
import { ScriptData, VoiceData, VoiceCustomization } from '../../types';
import AgentLayout from '../AgentLayout';
import { generateAudio } from '../../services/geminiService';
import { Play, Square, Download, Mic2, Volume2, Sparkles, RefreshCw, Edit3, ChevronUp, ChevronDown, Settings2 } from 'lucide-react';

interface Props {
  scriptData: ScriptData;
  data: VoiceData;
  updateData: (data: Partial<VoiceData>) => void;
  onApprove: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const VOICES = [
  { name: 'Puck', gender: 'Male', style: 'Deep, Storytelling' },
  { name: 'Charon', gender: 'Male', style: 'Authoritative, News' },
  { name: 'Kore', gender: 'Female', style: 'Calm, Soothing' },
  { name: 'Fenrir', gender: 'Male', style: 'Energetic, Intense' },
  { name: 'Zephyr', gender: 'Female', style: 'Friendly, Conversational' },
];

const ACCENTS = ['Neutral', 'American', 'British', 'Australian', 'Indian', 'Transatlantic'];
const AGES = ['Default', 'Youthful', 'Mid-Life', 'Elderly', 'Gravelly'];
const PACING = ['Normal', 'Fast', 'Slow', 'Dramatic Pause'];

const VoiceGenerator: React.FC<Props> = ({ scriptData, data, updateData, onApprove, setLoading, isLoading }) => {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Editor State
  const [textToSpeak, setTextToSpeak] = useState(scriptData.generatedScript);
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
     // Update local text if master script changes (unless user has already edited local)
     if (scriptData.generatedScript && textToSpeak === '') {
         setTextToSpeak(scriptData.generatedScript);
     }
  }, [scriptData.generatedScript]);

  // Utility to convert Base64 PCM to WAV Blob for playback/download
  const pcmToWav = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate (24000 for Gemini TTS)
    view.setUint32(24, 24000, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, 24000 * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, len, true);

    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return blob;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handlePreview = async (voiceName: string) => {
    if (playingPreview) return;
    setPlayingPreview(voiceName);
    try {
      // Generate a short sample using current customization
      const base64 = await generateAudio(
          "Hello! I am ready to narrate your amazing video.", 
          voiceName,
          data.customization
      );
      const wavBlob = pcmToWav(base64);
      const url = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(url);
      audio.onended = () => setPlayingPreview(null);
      audio.play();
    } catch (e) {
      console.error(e);
      setPlayingPreview(null);
    }
  };

  const handleGenerateFull = async () => {
    setLoading(true);
    try {
      // Use the local edited text for audio generation with customization
      const base64 = await generateAudio(textToSpeak, data.selectedVoice, data.customization); 
      const wavBlob = pcmToWav(base64);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
      updateData({ generatedAudioBase64: base64, previewUrl: url });
    } catch (e) {
      console.error(e);
      alert("Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  const updateCustomization = (key: keyof VoiceCustomization, value: string) => {
     updateData({ 
         customization: {
             ...data.customization,
             [key]: value
         }
     });
  };

  useEffect(() => {
    if (data.previewUrl && !audioUrl) {
      setAudioUrl(data.previewUrl);
    }
  }, [data.previewUrl, audioUrl]);

  return (
    <AgentLayout
      agentName="Vox"
      agentRole="Voice Over Artist"
      color="bg-purple-500"
      isProcessing={isLoading}
      canApprove={!!data.generatedAudioBase64}
      onApprove={() => {
        updateData({ approved: true });
        onApprove();
      }}
    >
      <div className="w-full min-h-full flex flex-col animate-fade-in gap-6 pb-6">
        
        <div className="flex flex-col xl:flex-row gap-6 shrink-0">
            {/* Voice Selection Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
            {VOICES.map((voice) => (
                <div 
                key={voice.name}
                onClick={() => updateData({ selectedVoice: voice.name })}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all group overflow-hidden flex flex-col justify-between
                    ${data.selectedVoice === voice.name 
                    ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                    }`}
                >
                <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${data.selectedVoice === voice.name ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    <Mic2 size={16} />
                    </div>
                    <button
                    onClick={(e) => { e.stopPropagation(); handlePreview(voice.name); }}
                    className="text-xs font-bold uppercase bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors"
                    >
                    {playingPreview === voice.name ? 'Playing...' : 'Test'}
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{voice.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{voice.gender} • {voice.style}</p>
                </div>
                </div>
            ))}
            </div>

            {/* Customization Panel */}
            <div className="xl:w-72 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-xs border-b border-white/5 pb-2">
                    <Settings2 size={14} /> Voice Lab
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Accent / Style</label>
                        <select 
                          value={data.customization?.accent || 'Neutral'}
                          onChange={(e) => updateCustomization('accent', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                        >
                           {ACCENTS.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Character Age</label>
                        <select 
                          value={data.customization?.age || 'Default'}
                          onChange={(e) => updateCustomization('age', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                        >
                           {AGES.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Speech Pacing</label>
                        <select 
                          value={data.customization?.pacing || 'Normal'}
                          onChange={(e) => updateCustomization('pacing', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                        >
                           {PACING.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Generation Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col items-center shadow-xl relative w-full">
            {/* Background Pulse */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                </div>
            )}

            {!data.generatedAudioBase64 ? (
                <div className={`relative z-10 w-full flex flex-col transition-all duration-500 ${showEditor ? 'w-full' : 'max-w-4xl text-center justify-center space-y-6 flex-1'}`}>
                    
                    {!showEditor ? (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20 mb-4">
                                <Volume2 size={48} className="text-purple-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Ready to Record</h2>
                            <p className="text-slate-400 text-lg max-w-md mx-auto">
                            I will narrate your script using <span className="text-purple-400 font-bold">{data.selectedVoice}</span>'s voice.
                            </p>
                            <div className="mt-2 flex gap-2 justify-center flex-wrap">
                                {data.customization.accent !== 'Neutral' && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{data.customization.accent}</span>}
                                {data.customization.age !== 'Default' && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{data.customization.age}</span>}
                                {data.customization.pacing !== 'Normal' && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{data.customization.pacing}</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 w-full flex flex-col gap-4 mb-4 min-h-[500px] text-left animate-fade-in">
                            <div className="flex items-center justify-between shrink-0 px-2">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                  <Edit3 size={18} className="text-purple-400" /> Script Editor
                                </h3>
                                <span className="text-xs font-bold text-slate-400 bg-black/30 px-3 py-1 rounded-full">
                                  Prepare text for {data.selectedVoice}
                                </span>
                            </div>
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
                                <textarea 
                                    value={textToSpeak}
                                    onChange={(e) => setTextToSpeak(e.target.value)}
                                    className="relative w-full h-full bg-[#0B0F19] border border-white/10 rounded-xl p-6 text-slate-200 font-medium text-lg leading-relaxed focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none custom-scrollbar shadow-inner min-h-[400px]"
                                    placeholder="Script content..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-4 shrink-0 py-6 border-t border-white/5 mt-4">
                         <button 
                            onClick={() => setShowEditor(!showEditor)}
                            className="text-sm text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-white/5 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                         >
                            {showEditor ? (
                               <> <ChevronUp size={14} /> Hide Script Editor </>
                            ) : (
                               <> <Edit3 size={14} /> Review & Edit Script <ChevronDown size={14}/> </>
                            )}
                         </button>

                        <button 
                        onClick={handleGenerateFull}
                        disabled={isLoading}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:shadow-[0_0_70px_rgba(168,85,247,0.8)] transition-all flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:scale-95"
                        >
                        {isLoading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                        Generate Voiceover
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-4xl space-y-8 relative z-10 h-full flex flex-col justify-center">
                    <div className="text-center">
                         <div className="inline-flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest mb-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                             <Sparkles size={12} /> Generated Success
                         </div>
                         <h2 className="text-4xl font-bold text-white mb-2">Voiceover Ready</h2>
                         <p className="text-slate-400"> narrated by {data.selectedVoice}</p>
                    </div>

                    {/* Player UI */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex items-center gap-6 shadow-inner">
                         <button 
                           onClick={() => {
                             const audio = document.getElementById('main-audio') as HTMLAudioElement;
                             if(audio.paused) audio.play(); else audio.pause();
                           }}
                           className="w-16 h-16 bg-purple-500 hover:bg-purple-400 rounded-full flex items-center justify-center text-white transition-all shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] hover:scale-105 shrink-0"
                         >
                             <Play fill="currentColor" className="ml-1" size={24} />
                         </button>
                         <div className="flex-1">
                            <audio id="main-audio" controls className="w-full h-10 accent-purple-500" src={audioUrl || ''} />
                         </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                         <a 
                           href={audioUrl || '#'} 
                           download={`voiceover-${data.selectedVoice}.wav`}
                           className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
                         >
                            <Download size={18} /> Download .WAV
                         </a>
                         <button 
                            onClick={handleGenerateFull}
                            className="px-6 py-3 text-slate-400 hover:text-white font-medium flex items-center gap-2 transition-all hover:bg-white/5 rounded-xl"
                         >
                            <RefreshCw size={16} /> Regenerate
                         </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </AgentLayout>
  );
};

export default VoiceGenerator;

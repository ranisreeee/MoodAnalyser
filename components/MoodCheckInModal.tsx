
import React, { useState } from 'react';
import { analyzeMoodWithContext } from '../services/geminiService';
import { analyzeSentimentHF } from '../services/huggingFaceService';
import { searchYouTubeSong } from '../services/youtubeService';
import { AnalysisResult } from '../types';

interface MoodCheckInModalProps {
  onClose: () => void;
  onComplete: (result: AnalysisResult, rawInput: string, rating: number) => void;
}

const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({ onClose, onComplete }) => {
  const [rating, setRating] = useState<number>(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setStatus("Analyzing Sentiment (Hugging Face)...");
    try {
      // 1. HF Sentiment Analysis
      const sentiment = await analyzeSentimentHF(input || `Rating ${rating}/5`);
      
      // 2. Gemini Mood & Song Suggestion
      setStatus("Mapping Mood to Music (Gemini)...");
      const result = await analyzeMoodWithContext(input || `Mood Rating: ${rating}`, sentiment?.label);
      
      // 3. YouTube Search for each song
      setStatus("Fetching Sonic Balance (YouTube API)...");
      const enrichedRecommendations = await Promise.all(
        result.recommendations.map(async (song) => {
          const url = await searchYouTubeSong(`${song.artist} ${song.title} official`);
          return { ...song, youtubeUrl: url || undefined };
        })
      );

      const finalResult = { ...result, recommendations: enrichedRecommendations };
      onComplete(finalResult, input, rating);
    } catch (error) {
      console.error(error);
      alert("Analysis encountered an error. Please try again.");
    } finally {
      setStatus(null);
    }
  };

  const labels: Record<number, string> = {
    1: "Really Struggling", 2: "Not Great", 3: "Okay / Neutral", 4: "Doing Good", 5: "Feeling Amazing"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-indigo-100">
        <h2 className="text-3xl font-black text-gray-900 mb-2">How are you?</h2>
        <p className="text-gray-500 mb-8 font-medium italic tracking-tight">AI-Powered Well-being Check-in</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num} type="button" onClick={() => setRating(num)}
                  className={`group relative flex flex-col items-center gap-2 transition-all transform hover:scale-110 ${rating === num ? 'scale-125' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <span className="text-4xl">{['😫', '😔', '😐', '😊', '🤩'][num-1]}</span>
                  {rating === num && (
                    <span className="absolute -bottom-6 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {labels[num]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 p-4 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Tell us more about your week..."
              disabled={!!status}
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className={`w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${status || rating === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black hover:-translate-y-1 shadow-xl'}`}
              disabled={!!status || rating === 0}
            >
              {status ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  <span className="text-[10px]">{status}</span>
                </>
              ) : 'Update My Mood'}
            </button>
            <button type="button" onClick={onClose} className="text-gray-400 font-bold text-xs uppercase tracking-widest py-2" disabled={!!status}>Skip</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoodCheckInModal;

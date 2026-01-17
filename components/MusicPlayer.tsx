
import React, { useState, useMemo } from 'react';
import { Play, Music, ExternalLink, Pause, Volume2 } from 'lucide-react';

interface MusicPlayerProps {
  recommendations: { title: string; artist: string; youtubeUrl?: string }[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ recommendations }) => {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const videoId = useMemo(() => {
    if (!activeUrl) return null;
    try {
      const url = new URL(activeUrl);
      if (url.hostname === 'youtu.be') return url.pathname.slice(1);
      if (url.hostname.includes('youtube.com')) {
        return url.searchParams.get('v');
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [activeUrl]);

  const activeSong = useMemo(() => {
    return recommendations.find(s => s.youtubeUrl === activeUrl);
  }, [activeUrl, recommendations]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      {/* Player Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Music size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Sonic Sanctuary</h3>
          </div>
          {activeUrl && (
            <button 
              onClick={() => setActiveUrl(null)}
              className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              Close Player
            </button>
          )}
        </div>
        
        {/* Video Embed Area */}
        {videoId ? (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-gray-100">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube music player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-black text-gray-900 truncate">{activeSong?.title}</h4>
                <p className="text-sm text-indigo-600 font-bold truncate">{activeSong?.artist}</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-200">
                <Volume2 size={16} />
                <div className="w-12 h-1 bg-indigo-50 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-indigo-600"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-8 bg-indigo-50/50 rounded-3xl border border-dashed border-indigo-100 text-center">
            <p className="text-indigo-900/40 text-sm font-medium italic">
              "Music is what feelings sound like."<br/>Select a track to begin your therapy session.
            </p>
          </div>
        )}
      </div>

      {/* Playlist Area */}
      <div className="px-8 pb-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Therapeutic Queue</span>
        </div>
        
        {recommendations.map((song, idx) => (
          <button
            key={idx}
            onClick={() => song.youtubeUrl && setActiveUrl(song.youtubeUrl)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border group ${
              activeUrl === song.youtubeUrl 
              ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100' 
              : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4 text-left flex-1 min-w-0">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeUrl === song.youtubeUrl 
                ? 'bg-white/20 text-white' 
                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
              }`}>
                {activeUrl === song.youtubeUrl ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="translate-x-0.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold tracking-tight truncate ${activeUrl === song.youtubeUrl ? 'text-white' : 'text-gray-900'}`}>
                  {song.title}
                </div>
                <div className={`text-xs font-medium truncate ${activeUrl === song.youtubeUrl ? 'text-indigo-100' : 'text-gray-400'}`}>
                  {song.artist}
                </div>
              </div>
            </div>
            
            {song.youtubeUrl && (
              <a 
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`p-2 flex-shrink-0 transition-colors ${activeUrl === song.youtubeUrl ? 'text-indigo-100 hover:text-white' : 'text-gray-300 hover:text-indigo-600'}`}
              >
                <ExternalLink size={18} />
              </a>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Fixed: Added missing default export
export default MusicPlayer;

import { useState, useRef, useEffect } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { PasswordGate } from './components/PasswordGate';
import { EnvelopeView } from './components/EnvelopeView';
import { LetterView } from './components/LetterView';
import { FinalScene } from './components/FinalScene';
import { AudioToggle } from './components/AudioToggle';
import { CreateLetter } from './components/CreateLetter';
import { ShareLetter } from './components/ShareLetter';

type Scene = 'create' | 'share' | 'locked' | 'envelope' | 'letter' | 'ending';

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('create');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [letterData, setLetterData] = useState<{message: string, password: string} | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#secret=')) {
      try {
        const decodedHash = hash.replace('#secret=', '');
        const decodedStr = decodeURIComponent(escape(atob(decodedHash)));
        const data = JSON.parse(decodedStr);
        if (data && data.message && data.password) {
          setLetterData({ message: data.message, password: data.password });
          setCurrentScene('locked');
          return;
        }
      } catch (e) {
        console.error("Invalid letter link", e);
      }
    }
    setCurrentScene('create');
  }, []);

  const handleCreate = (data: { message: string, password: string }) => {
    const payload = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    const url = `${window.location.origin}${window.location.pathname}#secret=${encoded}`;
    setShareUrl(url);
    setCurrentScene('share');
  };

  // You can use any romantic royalty-free track here.
  // Using a placeholder audio URL for demo purposes.
  const audioUrl = "https://cdn.pixabay.com/download/audio/2022/05/16/audio_f574d75dcd.mp3?filename=romantic-piano-110069.mp3";

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const playAudioWithMusicStarted = () => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => {
      setIsAudioPlaying(true);
    }).catch(e => console.log("Audio play failed:", e));
  }

  const handleUnlock = () => {
    setCurrentScene('envelope');
    playAudioWithMusicStarted();
  };

  const handleEnvelopeOpen = () => {
    setCurrentScene('letter');
  };

  const handleSeal = () => {
    setCurrentScene('ending');
  };

  return (
    <div className="app-container">
      <BackgroundEffects />
      
      {currentScene === 'create' && (
        <CreateLetter onCreated={handleCreate} />
      )}

      {currentScene === 'share' && (
        <ShareLetter shareUrl={shareUrl} />
      )}
      
      {currentScene === 'locked' && (
        <PasswordGate onUnlock={handleUnlock} correctPassword={letterData?.password || 'khushu'} />
      )}
      
      {currentScene === 'envelope' && (
        <EnvelopeView onOpen={handleEnvelopeOpen} />
      )}
      
      {currentScene === 'letter' && (
        <LetterView onSeal={handleSeal} message={letterData?.message || ''} />
      )}
      
      {currentScene === 'ending' && (
        <FinalScene />
      )}

      {(currentScene !== 'locked' && currentScene !== 'create' && currentScene !== 'share') && (
        <AudioToggle isPlaying={isAudioPlaying} toggleAudio={toggleAudio} />
      )}

      <audio ref={audioRef} src={audioUrl} loop />
    </div>
  );
}

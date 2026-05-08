import { useState, useEffect } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { PasswordGate } from './components/PasswordGate';
import { EnvelopeView } from './components/EnvelopeView';
import { LetterView } from './components/LetterView';
import { FinalScene } from './components/FinalScene';
import { CreateLetter } from './components/CreateLetter';
import { ShareLetter } from './components/ShareLetter';

type Scene = 'create' | 'share' | 'locked' | 'envelope' | 'letter' | 'ending';

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('create');
  const [letterData, setLetterData] = useState<{ message: string; password: string; photoUrl?: string } | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#secret=')) {
      try {
        const decodedHash = hash.replace('#secret=', '');
        const decodedStr = decodeURIComponent(escape(atob(decodedHash)));
        const data = JSON.parse(decodedStr);
        if (data && data.message && data.password) {
          setLetterData({ message: data.message, password: data.password, photoUrl: data.photoUrl });
          setCurrentScene('locked');
          return;
        }
      } catch (e) {
        console.error('Invalid letter link', e);
      }
    }
    setCurrentScene('create');
  }, []);

  const handleCreate = (data: { message: string; password: string; photoUrl?: string }) => {
    const payload = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    const url = `${window.location.origin}${window.location.pathname}#secret=${encoded}`;
    setShareUrl(url);
    setCurrentScene('share');
  };

  const handleUnlock = () => setCurrentScene('envelope');
  const handleEnvelopeOpen = () => setCurrentScene('letter');
  const handleSeal = () => setCurrentScene('ending');

  return (
    <div className={`app-container ${currentScene === 'letter' ? 'letter-scene-active' : ''}`}>
      <BackgroundEffects />

      {currentScene === 'create' && (
        <CreateLetter onCreated={handleCreate} />
      )}

      {currentScene === 'share' && (
        <ShareLetter shareUrl={shareUrl} />
      )}

      {currentScene === 'locked' && (
        <PasswordGate onUnlock={handleUnlock} correctPassword={letterData?.password || ''} />
      )}

      {currentScene === 'envelope' && (
        <EnvelopeView onOpen={handleEnvelopeOpen} />
      )}

      {currentScene === 'letter' && (
        <LetterView onSeal={handleSeal} message={letterData?.message || ''} photoUrl={letterData?.photoUrl} />
      )}

      {currentScene === 'ending' && (
        <FinalScene />
      )}
    </div>
  );
}

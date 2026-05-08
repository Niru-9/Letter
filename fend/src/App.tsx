import { useState, useEffect } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { PasswordGate } from './components/PasswordGate';
import { EnvelopeView } from './components/EnvelopeView';
import { LetterView } from './components/LetterView';
import { FinalScene } from './components/FinalScene';
import { CreateLetter } from './components/CreateLetter';
import { ShareLetter } from './components/ShareLetter';

type Scene = 'create' | 'share' | 'locked' | 'envelope' | 'letter' | 'ending';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('create');
  const [letterId, setLetterId] = useState('');
  const [letterData, setLetterData] = useState<{ message: string; photoUrl?: string } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#id=')) {
      const id = hash.replace('#id=', '');
      if (id) {
        setLetterId(id);
        setCurrentScene('locked');
      }
    } else {
      setCurrentScene('create');
    }
  }, []);

  // Called by CreateLetter — saves to backend, gets short ID
  const handleCreate = async (data: { message: string; password: string; photoUrl?: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/letters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save letter');
      const { id } = await res.json();
      const url = `${window.location.origin}${window.location.pathname}#id=${id}`;
      setShareUrl(url);
      setCurrentScene('share');
    } catch {
      alert('Could not save letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Called by PasswordGate — verifies password, fetches letter content
  const handleUnlock = async (password: string) => {
    const res = await fetch(`${API}/api/letters/${letterId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Wrong password');
    const data = await res.json();
    setLetterData({ message: data.message, photoUrl: data.photoUrl });
    setCurrentScene('envelope');
  };

  const handleEnvelopeOpen = () => setCurrentScene('letter');
  const handleSeal = () => setCurrentScene('ending');

  return (
    <div className={`app-container ${currentScene === 'letter' ? 'letter-scene-active' : ''}`}>
      <BackgroundEffects />

      {currentScene === 'create' && (
        <CreateLetter onCreated={handleCreate} loading={loading} />
      )}

      {currentScene === 'share' && (
        <ShareLetter shareUrl={shareUrl} />
      )}

      {currentScene === 'locked' && (
        <PasswordGate onUnlock={handleUnlock} />
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

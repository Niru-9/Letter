import { useState, useEffect } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { PasswordGate } from './components/PasswordGate';
import { EnvelopeView } from './components/EnvelopeView';
import { LetterView } from './components/LetterView';
import { FinalScene } from './components/FinalScene';
import { CreateLetter } from './components/CreateLetter';
import { ShareLetter } from './components/ShareLetter';

type Scene = 'create' | 'share' | 'locked' | 'envelope' | 'letter' | 'ending';

// ── Compression helpers (browser built-in, no library needed) ────────────────

async function compress(str: string): Promise<string> {
  const bytes = new TextEncoder().encode(str);
  const stream = new CompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const compressed = await new Response(stream.readable).arrayBuffer();
  // Convert to base64url (no +/= chars) so it's URL-safe without encoding
  return btoa(String.fromCharCode(...new Uint8Array(compressed)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function decompress(b64url: string): Promise<string> {
  // Restore standard base64
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const stream = new DecompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const decompressed = await new Response(stream.readable).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('create');
  const [letterData, setLetterData] = useState<{ message: string; password: string; photoUrl?: string } | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#secret=')) {
      const token = hash.replace('#secret=', '');
      decompress(token)
        .then((str) => {
          const data = JSON.parse(str);
          if (data?.message && data?.password) {
            setLetterData({ message: data.message, password: data.password, photoUrl: data.photoUrl });
            setCurrentScene('locked');
          } else {
            setCurrentScene('create');
          }
        })
        .catch(() => {
          // Fallback: try old uncompressed format for backwards compatibility
          try {
            const decodedStr = decodeURIComponent(escape(atob(token)));
            const data = JSON.parse(decodedStr);
            if (data?.message && data?.password) {
              setLetterData({ message: data.message, password: data.password, photoUrl: data.photoUrl });
              setCurrentScene('locked');
              return;
            }
          } catch {
            // ignore
          }
          setCurrentScene('create');
        });
    } else {
      setCurrentScene('create');
    }
  }, []);

  const handleCreate = async (data: { message: string; password: string; photoUrl?: string }) => {
    const payload = JSON.stringify(data);
    const token = await compress(payload);
    const url = `${window.location.origin}${window.location.pathname}#secret=${token}`;
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

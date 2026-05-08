import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: (password: string) => Promise<void>;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || unlocking) return;

    setUnlocking(true);
    setError('');
    try {
      await onUnlock(password);
      // onUnlock transitions scene on success
    } catch {
      setError('Hmm… that doesn\'t feel right 💔');
      setPassword('');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className={`glass-panel password-gate ${unlocking ? 'unlocking' : ''}`}>
      <div className="lock-icon-container">
        <Lock className="lock-icon" size={30} />
      </div>
      <h1 className="gate-title">A Secret Letter Awaits You ❤️</h1>
      <p className="gate-subtitle">Only the right heart knows the password.</p>

      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}
      >
        <div className="password-input-wrapper">
          <input
            type="password"
            className={`password-input ${error ? 'error' : ''}`}
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={unlocking}
            spellCheck={false}
          />
        </div>

        <div className="error-slot">
          {error && <p className="error-message">{error}</p>}
        </div>

        <button type="submit" className="unlock-btn" disabled={unlocking}>
          {unlocking ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}

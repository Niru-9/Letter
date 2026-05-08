import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: () => void;
  correctPassword?: string;
}

export function PasswordGate({ onUnlock, correctPassword = 'khushu' }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === correctPassword.toLowerCase()) {
      setError(false);
      setUnlocking(true);
      setTimeout(() => onUnlock(), 1500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword('');
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

        {/* Fixed-height slot so the button never shifts when error appears */}
        <div className="error-slot">
          {error && (
            <p className="error-message">Hmm… that doesn't feel right 💔</p>
          )}
        </div>

        <button type="submit" className="unlock-btn" disabled={unlocking}>
          {unlocking ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}

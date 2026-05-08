import { useState } from 'react';
import { Heart, Lock } from 'lucide-react';

interface CreateLetterProps {
  onCreated: (data: { message: string; password: string }) => void;
}

export function CreateLetter({ onCreated }: CreateLetterProps) {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && password.trim()) {
      onCreated({ message, password });
    }
  };

  return (
    <div className="glass-panel create-letter-scene">
      <h1 className="gate-title">
        Write a Secret Letter <Heart size={24} fill="currentColor" color="var(--color-primary)" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }} />
      </h1>
      <p className="gate-subtitle">Seal your emotions with a password.</p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <textarea
          className="letter-textarea"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        
        <div className="password-input-wrapper">
          <input
            type="password"
            className="password-input"
            placeholder="Set a password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            spellCheck={false}
          />
        </div>
        
        <button type="submit" className="unlock-btn" style={{ alignSelf: 'center' }}>
          Create & Lock <Lock size={18} />
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareLetterProps {
  shareUrl: string;
}

export function ShareLetter({ shareUrl }: ShareLetterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel share-letter-scene">
      <h1 className="gate-title">Your Letter is Sealed</h1>
      <p className="gate-subtitle">Share this link with your special someone.</p>
      
      <div className="share-link-box">
        <input type="text" readOnly value={shareUrl} className="share-input" />
        <button onClick={handleCopy} className="copy-btn" aria-label="Copy Link">
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>

      <p className="hint-text">They will need the correct password to open it.</p>
    </div>
  );
}

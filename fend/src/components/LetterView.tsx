import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { RoseCorner } from './RoseCorner';

interface LetterViewProps {
  onSeal: () => void;
  message: string;
  photoUrl?: string;
}

export function LetterView({ onSeal, message, photoUrl }: LetterViewProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    let index = 0;
    const speed = Math.max(20, Math.min(50, 2000 / Math.max(1, message.length)));
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText((prev) => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        if (photoUrl) setTimeout(() => setShowPhoto(true), 400);
      }
    }, speed);
    return () => clearInterval(typingInterval);
  }, [message, photoUrl]);

  return (
    <div className="letter-view-container">
      <div className="letter-paper">

        {/* Rose corners — all 4, smaller on mobile via CSS */}
        <RoseCorner position="top-left"     size={120} className="letter-rose letter-rose-tl" />
        <RoseCorner position="top-right"    size={120} className="letter-rose letter-rose-tr" />
        <RoseCorner position="bottom-left"  size={120} className="letter-rose letter-rose-bl" />
        <RoseCorner position="bottom-right" size={120} className="letter-rose letter-rose-br" />

        {/* Heart header */}
        <div className="letter-top-dec">
          <Heart fill="#ff4d6d" />
        </div>

        <div className="letter-content">
          {displayedText}
          {isTyping && <span className="typing-cursor" />}
        </div>

        {photoUrl && (
          <div className={`letter-photo-wrapper ${showPhoto ? 'visible' : ''}`}>
            <img src={photoUrl} alt="A memory" className="letter-photo" />
          </div>
        )}

        <div className={`seal-button-container ${!isTyping ? 'visible' : ''}`}>
          <button className="seal-btn" onClick={onSeal}>
            Seal This Memory <Heart size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

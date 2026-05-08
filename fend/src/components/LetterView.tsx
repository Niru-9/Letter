import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LetterViewProps {
  onSeal: () => void;
  message: string;
}

export function LetterView({ onSeal, message }: LetterViewProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText((prev) => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, Math.max(20, Math.min(50, 2000 / Math.max(1, message.length)))); // Dynamic typing speed
    
    return () => clearInterval(typingInterval);
  }, [message]);

  return (
    <div className="letter-view-container">
      <div className="letter-paper">
        <div className="letter-top-dec">
          <Heart fill="#ff4d6d" />
        </div>
        
        <div className="letter-content">
          {displayedText}
          {isTyping && <span className="typing-cursor"></span>}
        </div>

        <div className={`seal-button-container ${!isTyping ? 'visible' : ''}`}>
          <button className="seal-btn" onClick={onSeal}>
            Seal This Memory <Heart size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

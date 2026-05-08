import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { RoseCorner } from './RoseCorner';

interface LetterViewProps {
  onSeal: () => void;
  message: string;
  photoUrl?: string;
}

export function LetterView({ onSeal, message, photoUrl }: LetterViewProps) {
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    // Show photo shortly after letter appears
    if (photoUrl) {
      const t = setTimeout(() => setShowPhoto(true), 600);
      return () => clearTimeout(t);
    }
  }, [photoUrl]);

  return (
    <div className="letter-view-container">
      <div className="letter-paper">

        {/* Rose corners */}
        <RoseCorner position="top-left"     size={120} className="letter-rose letter-rose-tl" />
        <RoseCorner position="top-right"    size={120} className="letter-rose letter-rose-tr" />
        <RoseCorner position="bottom-left"  size={120} className="letter-rose letter-rose-bl" />
        <RoseCorner position="bottom-right" size={120} className="letter-rose letter-rose-br" />

        {/* Heart header */}
        <div className="letter-top-dec">
          <Heart fill="#ff4d6d" />
        </div>

        {/* Full letter — no typewriter */}
        <div className="letter-content">
          {message}
        </div>

        {/* Photo */}
        {photoUrl && (
          <div className={`letter-photo-wrapper ${showPhoto ? 'visible' : ''}`}>
            <img src={photoUrl} alt="A memory" className="letter-photo" />
          </div>
        )}

        <div className="seal-button-container visible">
          <button className="seal-btn" onClick={onSeal}>
            Seal This Memory <Heart size={18} fill="currentColor" />
          </button>
        </div>

      </div>
    </div>
  );
}

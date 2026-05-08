import { useState } from 'react';

interface EnvelopeViewProps {
  onOpen: () => void;
}

export function EnvelopeView({ onOpen }: EnvelopeViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Sequence animations
    setTimeout(() => {
      setIsTransitioning(true);
    }, 2000); // After envelope opens completely and letter slides out

    setTimeout(() => {
      onOpen();
    }, 4000); // Total duration before switching scene
  };

  return (
    <div className="envelope-scene">
      <div className={`envelope-wrapper ${isOpen ? 'open' : ''} ${isTransitioning ? 'transitioning-out' : ''}`} onClick={handleOpen}>
        <div className="envelope-body">
          <div className="envelope-front-left"></div>
          <div className="envelope-front-right"></div>
          <div className="envelope-front-bottom"></div>
        </div>
        <div className="letter-inside"></div>
        <div className="envelope-flap"></div>
      </div>
      {!isOpen && <h2 className="envelope-hint">Tap to open</h2>}
    </div>
  );
}

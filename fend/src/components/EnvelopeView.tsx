import { useState } from 'react';
import { RoseCorner } from './RoseCorner';
import { WaxSeal } from './WaxSeal';

interface EnvelopeViewProps {
  onOpen: () => void;
}

export function EnvelopeView({ onOpen }: EnvelopeViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    setTimeout(() => setIsTransitioning(true), 2000);
    setTimeout(() => onOpen(), 4000);
  };

  return (
    <div className="envelope-scene">
      <div
        className={`envelope-wrapper ${isOpen ? 'open' : ''} ${isTransitioning ? 'transitioning-out' : ''}`}
        onClick={handleOpen}
      >
        {/* ── Envelope body ── */}
        <div className="envelope-body">
          <div className="envelope-border-line" />

          <RoseCorner position="bottom-left"  size={100} className="env-rose env-rose-bl" />
          <RoseCorner position="bottom-right" size={100} className="env-rose env-rose-br" />
          <RoseCorner position="top-left"     size={80}  className="env-rose env-rose-tl" />
          <RoseCorner position="top-right"    size={80}  className="env-rose env-rose-tr" />

          <div className="envelope-front-left" />
          <div className="envelope-front-right" />
          <div className="envelope-front-bottom" />
        </div>

        <div className="letter-inside" />

        {/* ── Flap — seal sits here so it flips away on open ── */}
        <div className="envelope-flap">
          {/* Seal is at the bottom tip of the flap (the V point) */}
          <WaxSeal size={54} />
        </div>
      </div>

      {!isOpen && <h2 className="envelope-hint">Tap to open</h2>}
    </div>
  );
}

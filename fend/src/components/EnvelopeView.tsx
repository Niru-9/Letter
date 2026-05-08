import { useState } from 'react';
import { HeartBurst } from './HeartBurst';

interface EnvelopeViewProps {
  onOpen: () => void;
}

export function EnvelopeView({ onOpen }: EnvelopeViewProps) {
  const [phase, setPhase] = useState<'idle' | 'burst' | 'open' | 'out'>('idle');

  const handleTap = () => {
    if (phase !== 'idle') return;
    setPhase('burst');
  };

  // Called by HeartBurst once user has swiped enough hearts away
  const handleBurstDone = () => {
    setPhase('open');
    setTimeout(() => setPhase('out'), 1800);
    setTimeout(() => onOpen(), 3000);
  };

  return (
    <>
      <HeartBurst active={phase === 'burst'} onDone={handleBurstDone} />

      <div className="envelope-scene">
        <div
          className={[
            'envelope-wrapper',
            phase === 'open' || phase === 'out' ? 'open' : '',
            phase === 'out' ? 'transitioning-out' : '',
          ].filter(Boolean).join(' ')}
          onClick={handleTap}
        >
          <div className="envelope-body">
            <div className="envelope-front-left" />
            <div className="envelope-front-right" />
            <div className="envelope-front-bottom" />
          </div>
          <div className="letter-inside" />
          <div className="envelope-flap" />
        </div>

        {phase === 'idle' && <h2 className="envelope-hint">Tap to open</h2>}
      </div>
    </>
  );
}

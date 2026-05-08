import { useState } from 'react';
import { HeartBurst } from './HeartBurst';

interface EnvelopeViewProps {
  onOpen: () => void;
}

// Sequence timeline (ms):
//  0        — user taps → heart burst starts
//  2400     — burst done → envelope flap opens
//  2400+1500 = 3900 — envelope fully open, letter slides up
//  3900+1500 = 5400 — transition to letter scene

export function EnvelopeView({ onOpen }: EnvelopeViewProps) {
  const [phase, setPhase] = useState<'idle' | 'burst' | 'open' | 'out'>('idle');

  const handleTap = () => {
    if (phase !== 'idle') return;
    setPhase('burst');
  };

  // Called by HeartBurst when the burst animation finishes
  const handleBurstDone = () => {
    setPhase('open');

    // After envelope opens + letter slides up, transition out
    setTimeout(() => setPhase('out'), 1800);
    setTimeout(() => onOpen(), 3200);
  };

  return (
    <>
      {/* Heart burst — renders above everything */}
      <HeartBurst active={phase === 'burst'} onDone={handleBurstDone} />

      <div className="envelope-scene">
        <div
          className={[
            'envelope-wrapper',
            phase === 'open' || phase === 'out' ? 'open' : '',
            phase === 'out' ? 'transitioning-out' : '',
          ]
            .filter(Boolean)
            .join(' ')}
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

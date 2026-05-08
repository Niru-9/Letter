import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioToggleProps {
  isPlaying: boolean;
  toggleAudio: () => void;
}

export function AudioToggle({ isPlaying, toggleAudio }: AudioToggleProps) {
  return (
    <button className="audio-toggle" onClick={toggleAudio} aria-label="Toggle Audio">
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

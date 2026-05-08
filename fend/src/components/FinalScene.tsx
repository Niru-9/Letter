import { useEffect, useState } from 'react';

export function FinalScene() {
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    // heart explosion on mount
    setShowHearts(true);
  }, []);

  return (
    <div className="final-scene">
      <h1 className="final-text">
        "Some feelings deserve their own universe."
      </h1>
      
      {showHearts && (
        <div className="heart-explosion">
          {/* We will let the BackgroundEffects handle the continuing particles, 
              but we could add some specific DOM animations here if we want */}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check on mount
    if (typeof window !== 'undefined') {
        setIsOffline(!navigator.onLine);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-destructive p-3 text-destructive-foreground shadow-lg">
      <div className="flex items-center gap-2">
        <WifiOff className="h-5 w-5" />
        <p className="text-sm font-medium">You are currently offline</p>
      </div>
    </div>
  );
}

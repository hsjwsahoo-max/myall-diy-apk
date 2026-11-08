import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  const handleRetry = () => {
    setIsReconnecting(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setIsReconnecting(false);
    }, 1200);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#F6465D]/15 border-b border-[#F6465D]/30 px-3 py-1.5 flex items-center justify-between text-xs text-[#EAECEF] sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-[#F6465D] shrink-0 animate-pulse" />
        <span className="font-medium">
          Offline Mode — Showing cached portfolio & assets.
        </span>
      </div>
      <button
        onClick={handleRetry}
        disabled={isReconnecting}
        className="px-2 py-0.5 rounded bg-[#2B3139] hover:bg-[#333B47] text-[#EAECEF] text-[11px] font-medium flex items-center gap-1 transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin text-[#FCD535]' : ''}`} />
        <span>Retry</span>
      </button>
    </div>
  );
};

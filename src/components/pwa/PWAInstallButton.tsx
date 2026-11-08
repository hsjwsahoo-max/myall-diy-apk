import React, { useState } from 'react';
import { Download, Check, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');

  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS, don't show the header button to keep UI minimal
  if (!isInstallable && !isIOS && variant === 'header') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      setInstallState('installing');
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setInstallState('installed');
      } else {
        setInstallState('idle');
      }
    } else {
      // Fallback instruction dialog for other browsers
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          aria-label="Install NexusTrade App"
          title="Install NexusTrade PWA on your device"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FCD535]/10 text-[#FCD535] hover:bg-[#FCD535]/20 border border-[#FCD535]/30 transition-colors ${className}`}
        >
          {installState === 'installed' ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#0ECB81]" />
              <span className="text-[#0ECB81]">Installed</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </>
          )}
        </button>
      )}

      {variant === 'card' && (
        <div className={`p-4 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCD535]/10 border border-[#FCD535]/25 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-[#FCD535]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#EAECEF]">Install NexusTrade</div>
              <div className="text-xs text-[#848E9C]">Fast, standalone crypto & wallet experience</div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-semibold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      )}

      {/* iOS & Browser Manual Install Guidance Sheet */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#1E2329] border border-[#2B3139] p-5 shadow-2xl relative text-[#EAECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#848E9C] hover:text-white hover:bg-[#2B3139] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-center shrink-0">
                <img src="/icon.svg" alt="NexusTrade" className="w-8 h-8 rounded-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install NexusTrade</h3>
                <p className="text-xs text-[#848E9C]">PWA Standalone App</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-[#848E9C] py-2 border-y border-[#2B3139]/60 my-3">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2B3139] text-[#EAECEF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  Tap the browser <strong className="text-white">Share</strong> icon <Share className="w-3.5 h-3.5 inline mx-1 text-[#FCD535]" /> in Safari or Chrome menu <strong className="text-white">(⋮)</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2B3139] text-[#EAECEF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> or <strong className="text-white">"Install app"</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2B3139] text-[#EAECEF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  Launch NexusTrade directly from your home screen with zero browser bars and instant load times.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-2 py-2.5 bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-xs rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

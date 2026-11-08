import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import App from './App.tsx';
import './index.css';

function initAndroidSafeAreaInsets() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua) || Capacitor.getPlatform() === 'android';
  const isNativeOrStandalone =
    Capacitor.isNativePlatform() ||
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches;

  if (isAndroid && isNativeOrStandalone) {
    const probe = document.createElement('div');
    probe.style.paddingTop = 'env(safe-area-inset-top, 0px)';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const computedTop = parseFloat(window.getComputedStyle(probe).paddingTop || '0');
    document.body.removeChild(probe);

    if (!computedTop || computedTop < 20) {
      const currentVar = parseFloat(
        document.documentElement.style.getPropertyValue('--android-safe-top') || '0'
      );
      if (!currentVar || currentVar < 20) {
        document.documentElement.style.setProperty('--android-safe-top', '28px');
      }
    }
  }
}

initAndroidSafeAreaInsets();

createRoot(document.getElementById('root')!).render(<App />);


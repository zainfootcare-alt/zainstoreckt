import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running as PWA standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Zain POS app was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Zain POS App:\n- On Android Chrome: Tap Menu (⋮) > Add to Home screen.\n- On iPhone Safari: Tap Share (⎋) > Add to Home Screen.\n- On Desktop Chrome: Click the install icon in your address bar.');
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 transition-all shadow-md hover:shadow-orange-500/25 rounded-lg border border-orange-400/30 ${className}`}
      title="Install Zain Footwear POS App on your Mobile or PC"
    >
      <Smartphone className="w-3.5 h-3.5 animate-pulse" />
      <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
      <Download className="w-3.5 h-3.5 ml-0.5" />
    </button>
  );
};

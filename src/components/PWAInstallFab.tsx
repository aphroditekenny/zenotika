import { useEffect } from 'react';
import { isFeatureEnabled } from '@/featureFlags';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { loadSonner } from '@/utils/loadSonner';

export function PWAInstallFab() {
  const enabled = isFeatureEnabled('pwa');
  const { canInstall, promptInstall, isStandalone } = useInstallPrompt();

  useEffect(() => {
    const onInstalled = () => {
      void loadSonner().then(({ toast }) => toast.success('App installed'));
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  if (!enabled || !canInstall || isStandalone) return null;

  return (
    <button
      aria-label="Install App"
      onClick={async () => {
        const res = await promptInstall();
        const { toast } = await loadSonner();
        if (res?.outcome === 'accepted') {
          toast.success('Install accepted');
        } else {
          toast('Install dismissed');
        }
      }}
      className="fixed bottom-5 right-5 z-50 md:hidden rounded-full shadow-lg px-5 py-3 text-sm font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      Install
    </button>
  );
}

export default PWAInstallFab;

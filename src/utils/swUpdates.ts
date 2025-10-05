import { toast } from 'sonner';

export async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      toast('No service worker registered');
      return;
    }
    await reg.update();
    const waiting = reg.waiting;
    if (waiting) {
      toast('Update available', {
        description: 'Click to refresh to the latest version.',
        action: {
          label: 'Refresh',
          onClick: () => {
            waiting.postMessage('SKIP_WAITING');
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              window.location.reload();
            }, { once: true });
          }
        }
      });
    } else {
      toast.success('You are on the latest version');
    }
  } catch (e) {
    toast('Update check failed');
  }
}

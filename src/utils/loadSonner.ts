let sonnerModulePromise: Promise<typeof import('sonner')> | null = null;

export function loadSonner() {
  if (!sonnerModulePromise) {
    sonnerModulePromise = import('sonner');
  }
  return sonnerModulePromise;
}

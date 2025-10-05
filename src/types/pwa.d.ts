// Minimal types for beforeinstallprompt flow
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// iOS Safari expose navigator.standalone
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

declare const navigator: NavigatorStandalone;

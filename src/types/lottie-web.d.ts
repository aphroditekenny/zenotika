declare module 'lottie-web' {
  export interface AnimationItem {
    play(): void;
    pause(): void;
    destroy(): void;
    setSpeed(speed: number): void;
  }
  export interface LoadAnimationParams {
    container: HTMLElement;
    path: string;
    loop?: boolean;
    autoplay?: boolean;
    renderer?: 'svg' | 'canvas' | 'html';
  }
  export function loadAnimation(params: LoadAnimationParams): AnimationItem;
  const defaultExport: { loadAnimation: typeof loadAnimation };
  export default defaultExport;
}
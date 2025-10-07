import type { AnimationItem } from 'lottie-web';

// Central registry to manage all active Lottie animations for global pause/resume.
class AnimationRegistry {
  private animations = new Map<string, AnimationItem>();

  register(id: string, item: AnimationItem) {
    this.animations.set(id, item);
  }

  unregister(id: string) {
    this.animations.delete(id);
  }

  pauseAll() {
    this.animations.forEach(a => a.pause());
  }

  playAll() {
    this.animations.forEach(a => a.play());
  }

  setSpeedAll(speed: number) {
    this.animations.forEach(a => a.setSpeed(speed));
  }

  destroyAll() {
    this.animations.forEach((a, id) => {
      try { a.destroy(); } catch { /* noop */ }
      this.animations.delete(id);
    });
  }
}

export const animationRegistry = new AnimationRegistry();

export type { AnimationItem };
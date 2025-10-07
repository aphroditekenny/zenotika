import { memo } from 'react';
import { useAccessibility } from './AccessibilityProvider';

// Small floating toggle to manually override reduced motion preference for debugging / user control.
const MotionToggle = memo(function MotionToggle() {
  const { reducedMotion, setReducedMotionOverride } = useAccessibility();
  const toggle = () => setReducedMotionOverride(reducedMotion ? false : true);
  const reset = () => setReducedMotionOverride(null);
  return (
    <div className="fixed bottom-4 left-4 z-[2000] flex gap-2 bg-black/50 text-white backdrop-blur px-3 py-2 rounded-md text-xs shadow-lg">
      <button
        type="button"
        className="focus-ring px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        onClick={toggle}
        aria-pressed={reducedMotion}
        aria-label="Toggle motion animations"
      >
        {reducedMotion ? 'Motion Off' : 'Motion On'}
      </button>
      <button
        type="button"
        className="focus-ring px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        onClick={reset}
        aria-label="Reset motion preference override"
      >
        Reset
      </button>
    </div>
  );
});

export default MotionToggle;
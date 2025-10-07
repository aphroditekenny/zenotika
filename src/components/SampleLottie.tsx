import { memo } from 'react';
import { useLottie } from '../hooks/useLottie';
import { getCssVar } from '../hooks/useDesignTokens';

interface SampleLottieProps {
  id?: string;
  className?: string;
}

const SampleLottie = memo(function SampleLottie({ id = 'sample-pulse', className }: SampleLottieProps) {
  // Demonstrate color remap: map pink fill to current brand violet token value
  const brandViolet = getCssVar('--token-color-brand-violet'); // removed raw hex fallback (must exist via tokens)
  const ref = useLottie({
    id,
    src: `${import.meta.env.BASE_URL}animations/sample.json`,
    loop: true,
    autoplay: true,
    reduceMotionAware: true,
    speed: 1,
    respectPerfBudget: true,
    telemetry: true,
    // colorRemap expects original frame colors; legacy pink shades removed from animation file.
    // If reintroduced, add token-driven remap without raw hex literals.
    colorRemap: {},
    segments: [[0,30],[30,59]],
    segmentIndex: 0,
    preloadFonts: false,
    useWorkerPreprocess: true,
    onError: (e) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Lottie load failed', e);
      }
    }
  });

  return <div ref={ref} className={className} aria-hidden="true" />;
});

export default SampleLottie;
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeContext";
import { OptimizedImage } from "./OptimizedImage";

interface HeroSectionProps {
  onNavigateToHome?: () => void;
}

function HeroSection({ onNavigateToHome }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoRef = useRef<HTMLButtonElement>(null);
  const { isDark, isLight } = useTheme();

  useEffect(() => {
    // Simplified loading with timeout fallback
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // Quick fallback

    // Preload critical images for both themes
    const preloadImages = [
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6705b9208ebb9e666ec8413b_Home-logo_night.png",
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6724406f04b26f75915dd8c2_Home-logo_day.png"
    ];

    const imagePromises = preloadImages.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(resolve, 1000); // 1s timeout per image
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        img.src = src;
      });
    });

    Promise.race([
      Promise.all(imagePromises),
      new Promise(resolve => setTimeout(resolve, 2000)) // 2s max wait
    ]).then(() => {
      clearTimeout(timer);
      setIsLoaded(true);
    });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let animationId: number;
    let isAnimating = true;
    const startTime = Date.now();

    const animateClouds = () => {
      if (!isAnimating) return;

      const elapsed = (Date.now() - startTime) / 1000;

      // Throttle animation to reduce CPU usage
      if (elapsed % 0.016 < 0.008) { // ~60fps throttle
        cloudRefs.current.forEach((cloudElement, index) => {
          if (!cloudElement || !isAnimating) return;

          const speed = 0.2 + index * 0.05; // Reduced speeds
          const amplitude = 8 + index * 3; // Reduced amplitudes
          const phase = index * Math.PI / 2; // Simplified phase

          const x = Math.sin(elapsed * speed + phase) * amplitude;
          const y = Math.cos(elapsed * speed * 0.5 + phase) * (amplitude * 0.4);

          // Use CSS custom properties for smoother animations
          cloudElement.style.setProperty('--cloud-x', `${x}px`);
          cloudElement.style.setProperty('--cloud-y', `${y}px`);
        });
      }

      if (isAnimating) {
        animationId = requestAnimationFrame(animateClouds);
      }
    };

    animateClouds();

    return () => {
      isAnimating = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isLoaded]);

  const CloudImage = ({
    src,
    alt,
    className,
    index
  }: {
    src: string;
    alt: string;
    className: string;
    index: number;
  }) => {
    return (
      <div
        ref={(el) => {
          cloudRefs.current[index] = el;
        }}
        className="cloud-container"
        style={{
          transform: 'translate3d(var(--cloud-x, 0px), var(--cloud-y, 0px), 0px)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  };

  return (
    <div className="section_hero home-hero relative min-h-screen zen-landing-page">
      <div className="padding-global stretch lift-z">
        <div className="container-xlarge">
          <div className={`hero_grid flex flex-col items-center justify-center min-h-screen py-24 sm:py-28 lg:py-32 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>



            {/* Main CTA - Logo */}
            <button
              className="hero_content zen-focus informatika-efficient transition-all duration-300 cursor-pointer border-none bg-transparent focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/30 rounded-2xl p-6"
              onClick={onNavigateToHome}
              aria-label="Enter Things Inc Portfolio"
              ref={logoRef}
            >
              <div className="home-logo-wrap balloon relative flex items-center justify-center">
                {isDark ? (
                  <OptimizedImage
                    src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6705b9208ebb9e666ec8413b_Home-logo_night.png"
                    alt="Things logo - Click to enter"
                    className=""
                    imgClassName="hero-logo hero-night w-full max-w-[320px] sm:max-w-[440px] lg:max-w-[520px] xl:max-w-[600px] h-auto object-contain filter drop-shadow-2xl"
                    loading="eager"
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 440px, (max-width: 1280px) 520px, 600px"
                  />
                ) : (
                  <OptimizedImage
                    src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6724406f04b26f75915dd8c2_Home-logo_day.png"
                    alt="Things logo day - Click to enter"
                    className=""
                    imgClassName="hero-logo hero-day w-full max-w-[320px] sm:max-w-[440px] lg:max-w-[520px] xl:max-w-[600px] h-auto object-contain filter drop-shadow-2xl"
                    loading="eager"
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 440px, (max-width: 1280px) 520px, 600px"
                  />
                )}
              </div>
            </button>


          </div>
        </div>
      </div>



      {/* Optimized Floating Clouds */}
      {isLoaded && (
        <div className="cloud-wrapper absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bottom Left Cloud */}
          <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 lg:bottom-16 lg:left-16">
            <CloudImage
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6705b3ad591f4c89d96fc00e_Property%201%3DNight%2C%20Property%202%3DCloud%201.png"
              alt="Floating cloud"
              className="w-24 sm:w-32 md:w-48 lg:w-64 xl:w-80 h-auto opacity-60 scale-60"
              index={0}
            />
          </div>

          {/* Bottom Right Cloud */}
          <div className="absolute bottom-6 right-4 sm:bottom-12 sm:right-8 lg:bottom-20 lg:right-16">
            <CloudImage
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6705b3f1b2630f7f04b527d0_Property%201%3DNight%2C%20Property%202%3DCloud%203.png"
              alt="Floating cloud"
              className="w-20 sm:w-28 md:w-40 lg:w-52 xl:w-64 h-auto opacity-50 scale-50"
              index={1}
            />
          </div>

          {/* Top Left Cloud */}
          <div className="absolute top-8 left-4 sm:top-16 sm:left-8 lg:top-24 lg:left-16">
            <CloudImage
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/6705b32dbbf4d28a3fe1d971_Property%201%3DNight%2C%20Property%202%3DCloud%202.png"
              alt="Floating cloud"
              className="w-18 sm:w-24 md:w-36 lg:w-48 xl:w-60 h-auto opacity-40 scale-40"
              index={2}
            />
          </div>
        </div>
      )}

      {/* Optimized Stars Overlay */}
      <div
        id="aboutStars"
        className="stars-overlay home-stars absolute inset-0 pointer-events-none"
        style={{
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
      />


    </div>
  );
}

export default HeroSection;
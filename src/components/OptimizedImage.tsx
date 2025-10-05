import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  /**
   * Standard responsive attributes for the fallback <img>
   */
  sizes?: string;
  srcSet?: string;
  /**
   * Optional modern format sources for the <picture> element.
   * When provided, they will be preferred by capable browsers.
   */
  srcSetWebp?: string;
  srcSetAvif?: string;
  /**
   * Explicit fetch priority hint. If `priority` is true, this is set to 'high'.
   */
  fetchPriority?: 'high' | 'low' | 'auto';
  /**
   * Optional className override for the inner <img> element.
   * Defaults to a cover behavior for photography; logos might set object-contain.
   */
  imgClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+',
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  srcSet,
  srcSetWebp,
  srcSetAvif,
  fetchPriority,
  imgClassName,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority) {
      setIsIntersecting(true);
      return;
    }

    const img = imgRef.current;
    if (!img || loading === 'eager') {
      setIsIntersecting(true);
      return;
    }

    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observerRef.current?.unobserve(img);
          }
        },
        {
          rootMargin: '50px'
        }
      );

      observerRef.current.observe(img);
    } else {
      setIsIntersecting(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loading]);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const actualLoading: 'lazy' | 'eager' = priority ? 'eager' : loading;
  const defaultSizes = sizes ?? '100vw';

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder */}
      {!imageLoaded && !imageError && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isIntersecting ? (
        <picture>
          {srcSetAvif ? (
            <source type="image/avif" srcSet={srcSetAvif} sizes={defaultSizes} />
          ) : null}
          {srcSetWebp ? (
            <source type="image/webp" srcSet={srcSetWebp} sizes={defaultSizes} />
          ) : null}
          <img
            ref={imgRef}
            src={src}
            srcSet={srcSet}
            sizes={defaultSizes}
            alt={alt}
            width={width}
            height={height}
            loading={actualLoading}
            decoding="async"
            fetchPriority={priority ? 'high' : fetchPriority}
            className={`${imgClassName ?? 'w-full h-full object-cover'
              } transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${imageError ? 'hidden' : ''
              }`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              // Prevent layout shift
              aspectRatio: width && height ? `${width}/${height}` : 'auto'
            }}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          loading={actualLoading}
          decoding="async"
          className={`${imgClassName ?? 'w-full h-full object-cover'
            } transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${imageError ? 'hidden' : ''
            }`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : 'auto'
          }}
        />
      )}

      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Loading indicator */}
      {!imageLoaded && !imageError && isIntersecting && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      )}
    </div>
  );
}

// CSS for shimmer effect (add to globals.css)
const shimmerStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;
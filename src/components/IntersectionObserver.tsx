import { useEffect, useRef, ReactNode, useState, useCallback } from 'react';

interface IntersectionObserverProps {
  children: ReactNode;
  className?: string;
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  onIntersect?: (isIntersecting: boolean) => void;
  fallbackDelay?: number;
}

export function IntersectionObserver({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  onIntersect,
  fallbackDelay = 100
}: IntersectionObserverProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const intersecting = entry.isIntersecting;
    
    if (intersecting && !isVisible) {
      setIsVisible(true);
      entry.target.classList.add('animate-in');
      onIntersect?.(true);
      
      if (triggerOnce && observerRef.current) {
        observerRef.current.unobserve(entry.target);
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    } else if (!triggerOnce && !intersecting && isVisible) {
      setIsVisible(false);
      entry.target.classList.remove('animate-in');
      onIntersect?.(false);
    }
  }, [isVisible, triggerOnce, onIntersect]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Feature detection with fallback
    if ('IntersectionObserver' in window) {
      try {
        observerRef.current = new window.IntersectionObserver(handleIntersection, {
          threshold,
          rootMargin,
          // Remove experimental properties that might cause issues
        });

        observerRef.current.observe(element);
      } catch (error) {
        console.warn('IntersectionObserver failed, using fallback:', error);
        // Fallback when IntersectionObserver fails
        const fallbackTimer = setTimeout(() => {
          setIsVisible(true);
          element.classList.add('animate-in');
          onIntersect?.(true);
        }, fallbackDelay);

        return () => clearTimeout(fallbackTimer);
      }
    } else {
      // Fallback for older browsers
      const fallbackTimer = setTimeout(() => {
        setIsVisible(true);
        element.classList.add('animate-in');
        onIntersect?.(true);
      }, fallbackDelay);

      return () => clearTimeout(fallbackTimer);
    }

    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
          observerRef.current = null;
        } catch (error) {
          console.warn('Error disconnecting observer:', error);
        }
      }
    };
  }, [handleIntersection, threshold, rootMargin, fallbackDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div ref={elementRef} className={`section ${className}`}>
      {children}
    </div>
  );
}
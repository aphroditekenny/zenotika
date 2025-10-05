import { memo } from "react";
import { useAccessibility } from "./AccessibilityProvider";

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'image' | 'button' | 'circle';
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export const SkeletonLoader = memo(function SkeletonLoader({
  variant = 'text',
  width = '100%',
  height = '1rem',
  className = '',
  lines = 1
}: SkeletonLoaderProps) {
  const { reducedMotion } = useAccessibility();

  const baseClasses = `skeleton-loader ${reducedMotion ? 'no-animation' : ''} ${className}`;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-text-block" role="progressbar" aria-label="Loading content">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} skeleton-text`}
            style={{
              width: i === lines - 1 ? '75%' : width,
              height,
              marginBottom: i < lines - 1 ? '0.5rem' : 0
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} skeleton-${variant}`}
      style={{ width, height }}
      role="progressbar"
      aria-label={`Loading ${variant}`}
    />
  );
});

interface ProjectCardSkeletonProps {
  count?: number;
}

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton({ 
  count = 6 
}: ProjectCardSkeletonProps) {
  return (
    <div className="skeleton-project-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-project-card" role="progressbar" aria-label="Loading project">
          <div className="skeleton-card-inner p-6">
            <div className="skeleton-badges mb-4 flex items-center gap-2">
              <SkeletonLoader variant="button" width="4rem" height="1.5rem" />
              <SkeletonLoader variant="text" width="3rem" height="1rem" />
            </div>
            
            <SkeletonLoader variant="image" height="12rem" className="mb-6" />
            
            <div className="skeleton-content">
              <div className="skeleton-header mb-3 flex items-center justify-between">
                <SkeletonLoader variant="text" width="8rem" height="1.25rem" />
                <SkeletonLoader variant="button" width="5rem" height="1.5rem" />
              </div>
              
              <SkeletonLoader variant="text" lines={2} height="0.875rem" className="mb-4" />
              
              <div className="skeleton-tags flex gap-2">
                <SkeletonLoader variant="button" width="3rem" height="1.25rem" />
                <SkeletonLoader variant="button" width="4rem" height="1.25rem" />
                <SkeletonLoader variant="button" width="3.5rem" height="1.25rem" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

interface PageLoadingProps {
  variant?: 'landing' | 'home' | 'transition';
  message?: string;
}

export const PageLoading = memo(function PageLoading({ 
  variant = 'transition',
  message = 'Loading...'
}: PageLoadingProps) {
  const { reducedMotion, screenReaderMode } = useAccessibility();

  if (variant === 'landing') {
    return (
      <div className="page-loading landing-loading" role="progressbar" aria-label="Loading landing page">
        <div className="loading-content">
          <div className="loading-logo">
            <SkeletonLoader variant="circle" width="4rem" height="4rem" />
          </div>
          <div className="loading-text mt-6">
            <SkeletonLoader variant="text" width="12rem" height="2rem" />
            <SkeletonLoader variant="text" width="20rem" height="1rem" className="mt-4" />
          </div>
        </div>
        {screenReaderMode && (
          <div className="sr-only" aria-live="polite">
            Loading landing page content
          </div>
        )}
      </div>
    );
  }

  if (variant === 'home') {
    return (
      <div className="page-loading home-loading" role="progressbar" aria-label="Loading home page">
        <div className="loading-content max-w-6xl mx-auto px-4">
          {/* Header skeleton */}
          <div className="loading-header mb-12">
            <SkeletonLoader variant="text" width="15rem" height="2.5rem" />
            <SkeletonLoader variant="text" width="25rem" height="1rem" className="mt-4" />
          </div>
          
          {/* Project grid skeleton */}
          <ProjectCardSkeleton count={6} />
          
          {/* About section skeleton */}
          <div className="loading-about mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <SkeletonLoader variant="button" width="6rem" height="1.5rem" className="mb-6" />
                <SkeletonLoader variant="text" width="20rem" height="2rem" className="mb-8" />
                <SkeletonLoader variant="text" lines={3} height="1rem" className="mb-6" />
                <SkeletonLoader variant="text" lines={3} height="1rem" className="mb-6" />
                <SkeletonLoader variant="text" lines={3} height="1rem" />
              </div>
              <div>
                <SkeletonLoader variant="image" height="20rem" />
              </div>
            </div>
          </div>
        </div>
        {screenReaderMode && (
          <div className="sr-only" aria-live="polite">
            Loading home page content and projects
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-loading transition-loading" role="progressbar" aria-label={message}>
      <div className="loading-content">
        <div className={`loading-spinner ${reducedMotion ? 'no-animation' : ''}`}>
          <div className="spinner-ring">
            <div className="ring-segment"></div>
            <div className="ring-segment"></div>
            <div className="ring-segment"></div>
          </div>
        </div>
        <div className="loading-message">
          {message}
        </div>
      </div>
    </div>
  );
});

export default {
  SkeletonLoader,
  ProjectCardSkeleton,
  PageLoading
};
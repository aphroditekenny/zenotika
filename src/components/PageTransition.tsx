import { memo, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  isTransitioning: boolean;
  direction: 'forward' | 'backward';
}

const PageTransition = memo(function PageTransition({ 
  children, 
  isTransitioning, 
  direction 
}: PageTransitionProps) {
  return (
    <div 
      className={`page-transition-wrapper ${
        isTransitioning ? 'transitioning' : ''
      } ${direction}`}
      aria-live="polite"
      aria-busy={isTransitioning}
    >
      {/* Transition Overlay */}
      <div 
        className={`transition-overlay ${isTransitioning ? 'active' : ''}`}
        aria-hidden="true"
      />
      
      {/* Page Content */}
      <div 
        className={`page-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}
        style={{
          pointerEvents: isTransitioning ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
      
      {/* Loading Indicator for Transitions */}
      {isTransitioning && (
        <div 
          className="transition-loading"
          role="progressbar"
          aria-label="Page transition in progress"
          aria-describedby="transition-description"
        >
          <div className="loading-spinner">
            <div className="spinner-dots">
              <div className="dot dot-1" />
              <div className="dot dot-2" />
              <div className="dot dot-3" />
            </div>
          </div>
          <div id="transition-description" className="sr-only">
            Transitioning to {direction === 'forward' ? 'home page' : 'landing page'}
          </div>
        </div>
      )}
    </div>
  );
});

export default PageTransition;